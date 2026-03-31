# Production Server Setup Guide

Follow these steps to prepare your Linux server (Ubuntu/Debian) for deployment.

## 1. Directory Structure

Run these commands as a user with `sudo` privileges (or as `root`):

```bash
# Define the app directory
APP_DIR="/var/www/Surgical_Procedure_Listings_App"

# 1. Create the base directory
sudo mkdir -p "$APP_DIR"
sudo chown -R $USER:$USER "$APP_DIR"
cd "$APP_DIR"

# 2. Clone the repository (Control Repo)
# Replace with your actual repository URL
git clone git@github.com:iarxii/Surgical_Procedure_Listings_App.git .

# 3. Create Shared Directories
mkdir -p shared/backend/storage
mkdir -p db_backups
mkdir -p releases

# 4. Set Initial Permissions
# Laravel needs write access to storage and cache
sudo chown -R www-data:www-data shared/backend/storage
sudo chmod -R 775 shared/backend/storage
```

## 2. Environment Configuration

Prepare the production environment variables:

```bash
# Create shared backend .env from example
cp backend/.env.example shared/backend/.env

# EDIT THE FILE TO ADD PRODUCTION DB DETAILS
nano shared/backend/.env
```

## 3. Nginx Configuration

Ensure your Nginx configuration points to the symlinked `current/backend/public` directory.

> [!NOTE]
> The deployment script will maintain a `current` symlink that points to the latest release.
> Your Nginx `root` should be: `/var/www/Surgical_Procedure_Listings_App/current/backend/public`

### Example Nginx Snippet:
```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/Surgical_Procedure_Listings_App/current/backend/public;

    index index.php;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        include snippets/fastcgi-php.conf;
        fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
    }
}
```

## 4. SSH Access
Ensure the user running the deployment script has SSH access to the GitHub repository (to run `git fetch` and `git worktree`).
