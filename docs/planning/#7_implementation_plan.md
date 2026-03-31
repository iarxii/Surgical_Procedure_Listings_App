# Rewrite Deployment Script for Surgical Procedure Listings App

The goal is to adapt the provided template script for the current project structure, which separates the React frontend and Laravel backend into subdirectories of the same repository.

## User Review Required
> [!IMPORTANT]
> The script assumes you will be running it from the `/var/www/Surgical_Procedure_Listings_App` directory on the production server.
> It also assumes that the server is running a typical Linux environment (Ubuntu/Debian) with Nginx and PHP-FPM.

## Proposed Changes

### [MODIFY] [deploy.bat](file:///c:/AppDev/Surgical_Procedure_Listings_App/deploy.bat)

I will restructure the script to:
1.  **Variable Optimization**: Update all paths to reflect the `/var/www/Surgical_Procedure_Listings_App` directory and the internal `backend/` and `frontend/` structure.
2.  **Shared Resources**: Set up symlinks for `.env` and `storage` specifically inside the `backend/` directory of each release.
3.  **Build Pipeline**:
    *   Install PHP dependencies in `backend/`.
    *   Install NPM dependencies and build the `frontend/`.
    *   Bundle the built frontend into the Laravel `backend/public/assets` and `backend/resources/views/app.blade.php`.
4.  **Database Management**: Ensure migrations and backups target the correct directory.
5.  **Service Reloading**: Update the PHP-FPM service name if necessary (defaults to `php8.2-fpm` as in the original, please confirm your version).

### [MODIFY] [backend/routes/web.php](file:///c:/AppDev/Surgical_Procedure_Listings_App/backend/routes/web.php)

I need to add a fallback route to serve the built `app.blade.php` for React Router to work correctly on sub-pages.

## Open Questions
- What PHP version is running on your production server? (The current script uses `php8.2-fpm`).
- Does your production Nginx config point to `/var/www/Surgical_Procedure_Listings_App/current/backend/public`?
- Should I update the branch name from `main`?

## Verification Plan

### Manual Verification
- Review the generated script for path correctness.
- Test the script structure by executing parts of it (if a local linux-like environment were available, but here I can only verify logic).
- Confirm with the user if they'd like automated checks for dependencies.
