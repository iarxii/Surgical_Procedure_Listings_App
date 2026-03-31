#!/usr/bin/env bash
# Surgical Procedure Listings App - Atomic Deployment Script
# Layout (all under APP_DIR):
#   releases/<timestamp>  ← each release lives here
#   shared/backend/.env   ← reused across releases
#   shared/backend/storage ← persistent runtime dir
#   current -> releases/<timestamp>  ← symlink to latest release
#
# Requirements:
#   - Repo already cloned at APP_DIR
#   - PHP 8.2, Composer, Node 18/20+, MySQL, Nginx + PHP8.2-FPM

set -euo pipefail

#####################################
# Config
#####################################
APP_DIR="/var/www/Surgical_Procedure_Listings_App"
RELEASES_DIR="${APP_DIR}/releases"
SHARED_DIR="${APP_DIR}/shared"
CURRENT_LINK="${APP_DIR}/current"

BACKEND_DIR="backend"
FRONTEND_DIR="frontend"
PUBLIC_ASSETS_DIR="public/assets"
BLADE_ENTRY="resources/views/app.blade.php"

BRANCH="main"
RELEASE_TS="$(date +%F_%H-%M-%S)"
RELEASE_DIR="${RELEASES_DIR}/${RELEASE_TS}"
KEEP_RELEASES=5
KEEP_DB_BACKUPS=10

PHP_BIN="/usr/bin/php"
COMPOSER_BIN="/usr/local/bin/composer"
NODE_BIN="/usr/bin/node"
NPM_BIN="/usr/bin/npm"
PHPPFM_SERVICE="php8.2-fpm"
NGINX_SERVICE="nginx"

# DB backup dir
DB_BACKUP_DIR="${APP_DIR}/db_backups"

#####################################
# Helpers
#####################################
LOG()  { printf "\033[1;34m[INFO]\033[0m %s\n" "$*"; }
WARN() { printf "\033[1;33m[WARN]\033[0m %s\n" "$*"; }
ERR()  { printf "\033[1;31m[ERR ]\033[0m %s\n" "$*"; }
OK()   { printf "\033[1;32m[DONE]\033[0m %s\n" "$*"; }
require_cmd(){ command -v "$1" >/dev/null 2>&1 || { ERR "Missing command: $1"; exit 1; }; }

#####################################
# Pre-flight checks
#####################################
require_cmd git
require_cmd "$PHP_BIN"
require_cmd "$COMPOSER_BIN"
require_cmd "$NODE_BIN"
require_cmd "$NPM_BIN"
require_cmd systemctl

cd "$APP_DIR"

# Avoid git noise from permission flips
git config core.fileMode false || true

# Ensure working tree is clean
if ! git diff-index --quiet HEAD --; then
  ERR "Working tree has local changes. Commit/stash/discard before deploying."
  exit 1
fi

LOG "Fetching latest $BRANCH…"
git fetch origin "$BRANCH"
git checkout "$BRANCH"
git reset --hard "origin/${BRANCH}"

# Create required directories
mkdir -p "$RELEASES_DIR" "$SHARED_DIR/backend" "$DB_BACKUP_DIR"

# Shared .env (first run bootstrap)
if [ ! -f "${SHARED_DIR}/backend/.env" ]; then
  if [ -f "${APP_DIR}/backend/.env" ]; then
    LOG "Seeding shared .env from existing backend/.env"
    mv "${APP_DIR}/backend/.env" "${SHARED_DIR}/backend/.env"
  else
    LOG "Creating shared .env from .env.example"
    cp "${APP_DIR}/backend/.env.example" "${SHARED_DIR}/backend/.env"
  fi
fi

# Shared storage
if [ ! -d "${SHARED_DIR}/backend/storage" ]; then
  LOG "Initializing shared/backend/storage"
  mkdir -p "${SHARED_DIR}/backend/storage"
  if [ -d "${APP_DIR}/backend/storage" ]; then
    rsync -a --ignore-existing "${APP_DIR}/backend/storage/" "${SHARED_DIR}/backend/storage/"
  fi
fi

#####################################
# Create new release via git worktree
#####################################
COMMIT_SHA="$(git rev-parse "origin/${BRANCH}")"
LOG "Preparing release at commit ${COMMIT_SHA:0:8} → ${RELEASE_DIR}"
git worktree add --detach "$RELEASE_DIR" "$COMMIT_SHA"

# Wire shared resources into the release (specifically for the backend)
ln -s "${SHARED_DIR}/backend/.env" "${RELEASE_DIR}/${BACKEND_DIR}/.env"
rm -rf "${RELEASE_DIR}/${BACKEND_DIR}/storage"
ln -s "${SHARED_DIR}/backend/storage" "${RELEASE_DIR}/${BACKEND_DIR}/storage"

#####################################
# Database backup
#####################################
# Parse DB creds from backend .env
DB_NAME="$(grep -E '^DB_DATABASE=' "${SHARED_DIR}/backend/.env" | cut -d= -f2- || true)"
DB_USER="$(grep -E '^DB_USERNAME=' "${SHARED_DIR}/backend/.env" | cut -d= -f2- || true)"
DB_PASS="$(grep -E '^DB_PASSWORD=' "${SHARED_DIR}/backend/.env" | cut -d= -f2- || true)"

if [ -n "$DB_NAME" ] && [ -n "$DB_USER" ]; then
  LOG "Creating MySQL snapshot of ${DB_NAME}"
  TS="$(date +%F_%H-%M-%S)"
  BACKUP_FILE="${DB_BACKUP_DIR}/${TS}.${DB_NAME}.sql.gz"
  mysqldump --no-tablespaces -u "$DB_USER" ${DB_PASS:+-p"$DB_PASS"} "$DB_NAME" | gzip > "$BACKUP_FILE" || WARN "DB backup failed (continuing)."
  ls -1dt "${DB_BACKUP_DIR}"/*.sql.gz 2>/dev/null | tail -n +$((KEEP_DB_BACKUPS+1)) | xargs -r rm -f
else
  WARN "DB creds not found; skipping backup."
fi

#####################################
# Frontend Build
#####################################
LOG "Building frontend (Vite)…"
if [ -d "${RELEASE_DIR}/${FRONTEND_DIR}" ]; then
  cd "${RELEASE_DIR}/${FRONTEND_DIR}"
  "$NPM_BIN" ci || "$NPM_BIN" install
  "$NPM_BIN" run build

  # Publish assets to backend public dir
  LOG "Copying built frontend to backend…"
  mkdir -p "${RELEASE_DIR}/${BACKEND_DIR}/${PUBLIC_ASSETS_DIR}"
  cp -r dist/assets/. "${RELEASE_DIR}/${BACKEND_DIR}/${PUBLIC_ASSETS_DIR}/"
  
  # Copy index.html to app.blade.php
  mkdir -p "$(dirname "${RELEASE_DIR}/${BACKEND_DIR}/${BLADE_ENTRY}")"
  cp dist/index.html "${RELEASE_DIR}/${BACKEND_DIR}/${BLADE_ENTRY}"
else
  ERR "Frontend directory not found!"
  exit 1
fi

#####################################
# Backend Dependencies & Prep
#####################################
LOG "Installing PHP dependencies…"
cd "${RELEASE_DIR}/${BACKEND_DIR}"
"$COMPOSER_BIN" install --no-dev --prefer-dist --optimize-autoloader

if ! grep -q '^APP_KEY=base64:' .env; then
  LOG "Generating APP_KEY…"
  "$PHP_BIN" artisan key:generate --force
fi

#####################################
# Maintenance & Migrations
#####################################
LOG "Entering maintenance mode…"
"$PHP_BIN" artisan down || true

LOG "Running migrations…"
"$PHP_BIN" artisan migrate --force

LOG "Optimizing caches…"
"$PHP_BIN" artisan config:clear || true
"$PHP_BIN" artisan view:clear || true
"$PHP_BIN" artisan optimize

#####################################
# Permissions
#####################################
LOG "Setting permissions…"
sudo chown -R www-data:www-data "${SHARED_DIR}/backend/storage" "${RELEASE_DIR}/${BACKEND_DIR}/bootstrap/cache"
sudo find "${SHARED_DIR}/backend/storage" "${RELEASE_DIR}/${BACKEND_DIR}/bootstrap/cache" -type d -exec chmod 775 {} \;
sudo find "${SHARED_DIR}/backend/storage" "${RELEASE_DIR}/${BACKEND_DIR}/bootstrap/cache" -type f -exec chmod 664 {} \;

#####################################
# Atomic switch
#####################################
LOG "Switching current → ${RELEASE_TS}"
ln -sfn "$RELEASE_DIR" "$CURRENT_LINK"

LOG "Reloading services…"
sudo systemctl reload "$PHPPFM_SERVICE" || sudo systemctl restart "$PHPPFM_SERVICE"
sudo systemctl reload "$NGINX_SERVICE" || sudo systemctl restart "$NGINX_SERVICE"

# Signal workers if they exist
"$PHP_BIN" artisan queue:restart || true

LOG "Exiting maintenance mode…"
"$PHP_BIN" artisan up

OK "Release ${RELEASE_TS} deployed."

#####################################
# Retention
#####################################
cd "$RELEASES_DIR"
for OLD in $(ls -1dt */ | tail -n +$((KEEP_RELEASES+1))); do
  OLD_PATH="${RELEASES_DIR}/${OLD%/}"
  LOG "Pruning old release: $OLD"
  git -C "$APP_DIR" worktree remove --force "$OLD_PATH" 2>/dev/null || rm -rf "$OLD_PATH"
done
git -C "$APP_DIR" worktree prune || true

OK "Deployment complete! ✅"