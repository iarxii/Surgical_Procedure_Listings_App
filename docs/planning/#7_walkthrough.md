# Walkthrough: Production Deployment Setup

I have rewritten the deployment script and prepared a setup guide to move your Surgical Procedure Listings App to production.

## Key Changes

### 1. Updated Deployment Script (`deploy.bat`)
[deploy.bat](file:///c:/AppDev/Surgical_Procedure_Listings_App/deploy.bat)
- **Atomic Releases**: Uses `git worktree` to create new, independent release folders for every deployment.
- **Project Structure Support**: Specifically handles the `backend/` and `frontend/` subdirectories.
- **Build Pipeline**:
  - Builds the React frontend in `frontend/`.
  - Automatically moves built assets to `backend/public/assets`.
  - Generates `backend/resources/views/app.blade.php` from `frontend/dist/index.html`.
- **Laravel Optimization**: Installs PHP dependencies, runs migrations, and clears caches in the `backend/` directory.

### 2. Backend Fallback Route
[web.php](file:///c:/AppDev/Surgical_Procedure_Listings_App/backend/routes/web.php)
- Added a fallback route to `backend/routes/web.php` that serves the React `app.blade.php` for all URLs except those starting with `api`. This is critical for React Router functionality.

### 3. Production Setup Guide
[production_setup.md](file:///C:/Users/28523971/.gemini/antigravity/brain/b72facf5-f955-4a96-8a1d-0d3736ad3ea6/production_setup.md)
- Provided a clear set of Linux commands to initialize your server environment, including directory creation, permission setting, and Nginx configuration.

## How to Deploy

1.  **Prepare the Server**: Run the commands in [production_setup.md](file:///C:/Users/28523971/.gemini/antigravity/brain/b72facf5-f955-4a96-8a1d-0d3736ad3ea6/production_setup.md).
2.  **Edit .env**: Update your production database credentials in `/var/www/Surgical_Procedure_Listings_App/shared/backend/.env`.
3.  **Run Deployment**: Execute the script from the app root:
    ```bash
    ./deploy.bat
    ```

> [!NOTE]
> The script is configured to use `php8.2-fpm` and assumes your Nginx root is `/var/www/Surgical_Procedure_Listings_App/current/backend/public`.
