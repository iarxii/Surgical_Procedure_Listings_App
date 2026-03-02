# Surgical Procedure Listing App

This project is a React and Laravel-based web application designed to help clinicians and administrators view, search, and map surgical procedures against ICD-10-CM and ICD-11 codes. It also incorporates Treatment Time Guarantees (TTGs) metrics for clinical SLA tracking.

## Table of Contents
- [Features](#features)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Documentation](#documentation)

## Features
*   **Procedure Search**: Quickly look up surgical procedures by name or clinical specialty.
*   **Dual-Code Mapping**: Side-by-side comparison of **ICD-10-CM** (via NIH API) and **ICD-11** (via WHO API) codes.
*   **TTG SLA Tracking**: View the expected Treatment Time Guarantees in days, including 70% minimum thresholds and 90% alert thresholds.
*   **Local Caching**: Fast retrieval of previously searched codes and native seed data from the Master TTG definitions.

## Architecture
The platform is built on a modern decoupled architecture:
*   **Frontend**: React (SPA) styled with TailwindCSS.
*   **Backend**: Laravel REST API.
*   **Database**: MySQL for local procedure and TTG caching.
*   **External APIs**: NIH Clinical Table Service and WHO ICD-11 REST API.

*For more in-depth diagrams and schema details, see [docs/Architecture.md](docs/Architecture.md).*

## Prerequisites
Before you begin, ensure you have the following installed on your machine:
*   [Node.js](https://nodejs.org/) (v16 or higher)
*   [PHP](https://www.php.net/) (v8.2 or higher)
*   [Composer](https://getcomposer.org/)
*   [MySQL](https://www.mysql.com/) (v8.0 or higher)
*   WHO API Credentials (Account and App registered at [WHO API Portal](https://icd.who.int/icdapi))

## Getting Started

### 1. Clone the Repository
```bash
git clone <repository-url>
cd Surgical_Procedure_Listings_App
```

### 2. Backend (Laravel) Setup
```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
```
Update your `.env` with your database credentials and your WHO API credentials:
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=surgical_app
DB_USERNAME=root
DB_PASSWORD=

WHO_API_CLIENT_ID=your_client_id
WHO_API_CLIENT_SECRET=your_client_secret
```
Run the migrations and seed the database (this will import the Master TTG data):
```bash
php artisan migrate --seed
php artisan serve
```

### 3. Frontend (React) Setup
```bash
cd frontend
npm install
npm run dev
```

## Documentation
*   [High-Level Design Overview](docs/Surgical_Procedure_Listing_App_Overview.md)
*   [Architecture Details](docs/Architecture.md)
*   [Master TTGs (Excel Source)](docs/Master_v4\ TTGs.xlsx)
