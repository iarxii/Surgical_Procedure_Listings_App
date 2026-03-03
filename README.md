# Surgical Procedure Listing App

A React + Laravel web application for clinicians and administrators to search, map, and verify surgical procedures against **ICD-10-CM** and **ICD-11** codes, with integrated Treatment Time Guarantee (TTG) SLA tracking.

## Table of Contents
- [Features](#features)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Artisan Commands](#artisan-commands)
- [Project Structure](#project-structure)
- [External APIs](#external-apis)
- [Documentation](#documentation)

---

## Features

### Procedure Search & Code Mapping
- **Dual-Code Mapping** — Side-by-side ICD-10-CM (NIH API) and ICD-11 (WHO API) results
- **Code-Based Search** — Selecting from the Authorized List searches by ICD code (main category + sub-codes), not just by name
- **Text Search** — Free-text search from the search bar queries both APIs in real-time
- **Primary Match Card** — Standalone card showing the procedure's local ICD codes, enriched descriptions, and verification badges

### Authorized Procedure List
- **258 procedures** imported from the Master TTG spreadsheet, grouped by surgical speciality
- **Verified/unverified filter** — filter to show only procedures with verified ICD mappings
- **Speciality filter** — dropdown to filter by surgical speciality
- **Verification badges** — ICD-10 ✓ and ICD-11 ✓ badges indicating external API verification status

### TTG SLA Tracking
- Treatment Time Guarantees displayed in days
- 1st Alert (70%) and 2nd Alert (90%) threshold indicators
- Level of Care and Post-Care Setting metadata

### Mapping Verification System
- Automated batch verification of local ICD codes against external APIs
- Data normalization pipeline handles multiple patterns:
  - **Compound Codes**: splits on `,` or `;`
  - **OR Operators**: splits on `/` (e.g., `K85/K86.2` → `K85`, `K86.2`) and strips `.x` wildcards
  - **Ranges**: expands `-` operators (e.g., `C76-C80` → `C76, C77, C78, C79, C80`)
  - **Pattern Extraction**: computes category-level main codes
  - **Enrichment**: fetches clinical descriptions from NIH
- Per-procedure verification timestamps for both ICD-10 and ICD-11

### Other
- **Theme system** — Dark/light mode toggle with 6 color themes (Indigo, Ocean, Sunset, Forest, Rose, Slate)
- **Comments** — Per-procedure comment system for team collaboration
- **Dashboard** — Overview statistics page

---

## Architecture

| Layer | Technology | Details |
|---|---|---|
| **Frontend** | React 19 + Vite | SPA with TailwindCSS v4, React Router v7, Lucide icons |
| **Backend** | Laravel 12 | REST API with Eloquent ORM |
| **Database** | MySQL 8+ | Procedures, ICD codes, comments, verification timestamps |
| **ICD-10 API** | NIH ClinicalTables | Public API, no auth required |
| **ICD-11 API** | WHO ICD API v2 | OAuth2 Client Credentials, requires API registration |

```
Frontend (localhost:5173)          Backend (localhost:8085)
┌──────────────────────┐          ┌──────────────────────┐
│  React SPA           │───API──▶│  Laravel REST API     │
│  - SearchInput       │          │  - SearchController   │
│  - AuthorizedProcs   │          │  - ProcedureController│
│  - DualCodeDisplay   │          │  - CodeSearchService  │
│  - Dashboard         │          │  - VerificationSvc    │
└──────────────────────┘          └──────┬───────┬───────┘
                                         │       │
                                    ┌────▼──┐ ┌──▼─────┐
                                    │ MySQL │ │NIH/WHO │
                                    │  DB   │ │  APIs  │
                                    └───────┘ └────────┘
```

---

## Prerequisites

| Requirement | Version |
|---|---|
| [Node.js](https://nodejs.org/) | v18+ |
| [PHP](https://www.php.net/) | v8.2+ |
| [Composer](https://getcomposer.org/) | v2+ |
| [MySQL](https://www.mysql.com/) | v8.0+ |
| WHO API Credentials | Register at [icd.who.int/icdapi](https://icd.who.int/icdapi) |

---

## Getting Started

### 1. Clone the Repository
```bash
git clone <repository-url>
cd Surgical_Procedure_Listings_App
```

### 2. Automated Setup (Windows Recommended)
Run the `setup.bat` script from the project root. This automates the installation of dependencies, environment setup, database migrations, and ICD code normalization/verification.
```cmd
setup.bat
```
*(Note: The script will pause after generating the `.env` file so you can configure database and API credentials).*

### 3. Manual Setup (Alternative)

**Backend Setup**
```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
```

Configure your `.env` file:
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=surgical_app
DB_USERNAME=root
DB_PASSWORD=

WHO_API_CLIENT_ID=your_client_id_here
WHO_API_CLIENT_SECRET=your_client_secret_here
```

Run migrations and seed the database:
```bash
php artisan migrate --seed
```

**Normalize & Verify ICD Codes**
After seeding, run these commands to normalize compound codes, enrich descriptions, and verify mappings:
```bash
php artisan procedures:normalize-codes --enrich
php artisan procedures:verify-mappings --delay=150
```

**Frontend Setup**
```bash
cd frontend
npm install
```

### 4. Launch Development Servers
**Option A — Use the startup script (recommended):**
```bash
# From the project root
start_dev.bat
```
This launches the backend API server and frontend dev server in separate terminal windows.

**Option B — Manual start:**
```bash
# Terminal 1: Backend API
cd backend
php artisan serve --port=8085

# Terminal 2: Frontend
cd frontend
npm run dev -- --host
```

### 5. Open the App
- **Frontend**: http://localhost:5173
- **Backend API**: http://127.0.0.1:8085

---

## Artisan Commands

| Command | Description |
|---|---|
| `php artisan migrate --seed` | Run migrations and import procedures from Master TTGs |
| `php artisan procedures:normalize-codes` | Split compound ICD codes, compute main codes, remove invalid entries |
| `php artisan procedures:normalize-codes --enrich` | Same as above + fetch descriptions from NIH API |
| `php artisan procedures:normalize-codes --dry-run` | Preview changes without modifying the database |
| `php artisan procedures:verify-mappings` | Verify all local ICD codes against NIH/WHO APIs |
| `php artisan procedures:verify-mappings --delay=200` | Same with 200ms delay between API calls (rate limiting) |
| `php artisan procedures:verify-mappings --verbose-debug` | Detailed per-code verification output |

---

## Project Structure

```
Surgical_Procedure_Listings_App/
├── backend/                        # Laravel API
│   ├── app/
│   │   ├── Console/Commands/       # Artisan commands
│   │   │   ├── NormalizeCodesCommand.php
│   │   │   └── VerifyMappingsCommand.php
│   │   ├── Http/Controllers/
│   │   │   ├── SearchController.php
│   │   │   ├── ProcedureController.php
│   │   │   ├── DashboardController.php
│   │   │   └── CommentController.php
│   │   ├── Models/
│   │   │   ├── Procedure.php
│   │   │   ├── IcdCode.php
│   │   │   └── Comment.php
│   │   └── Services/
│   │       ├── CodeSearchService.php        # NIH/WHO API search logic
│   │       ├── MappingVerificationService.php  # Verification engine
│   │       └── WhoIcdAuthService.php        # WHO OAuth2 token management
│   ├── database/
│   │   ├── migrations/
│   │   └── seeders/DatabaseSeeder.php       # Imports from master_ttgs.json
│   └── routes/api.php
├── frontend/                       # React SPA
│   └── src/
│       ├── components/
│       │   ├── SearchInput.jsx
│       │   ├── DualCodeDisplay.jsx
│       │   ├── AuthorizedProcedures.jsx
│       │   ├── Dashboard.jsx
│       │   ├── Comments.jsx
│       │   └── ThemeToggle.jsx
│       ├── context/ThemeContext.jsx
│       └── App.jsx
├── docs/                           # Documentation
│   ├── Architecture.md
│   ├── Surgical_Procedure_Listing_App_Overview.md
│   ├── Understanding ICD Codes.docx
│   ├── mapping_system_analysis.md.resolved
│   ├── Master_v4 TTGs.xlsx         # Source data
│   └── planning/                   # Implementation plans
├── setup.bat                       # Automated setup script
├── start_dev.bat                   # Dev server launcher
└── README.md
```

---

## External APIs

### NIH ClinicalTables API (ICD-10-CM)
- **Endpoint**: `https://clinicaltables.nlm.nih.gov/api/icd10cm/v3/search`
- **Auth**: None required (public)
- **Usage**: Searches by ICD-10 code or procedure name; returns matching codes with descriptions
- **Docs**: [clinicaltables.nlm.nih.gov](https://clinicaltables.nlm.nih.gov/apidoc/icd10cm/v3/doc.html)

### WHO ICD-11 API
- **Endpoint**: `https://id.who.int/icd/release/11/2024-01/mms/search`
- **Auth**: OAuth2 Client Credentials (Bearer token, cached ~55 minutes)
- **Usage**: Free-text and code search; returns ICD-11 codes with clinical descriptions
- **Registration**: [icd.who.int/icdapi](https://icd.who.int/icdapi)

---

## Documentation

| Document | Description |
|---|---|
| [Architecture.md](docs/Architecture.md) | System architecture, database schema, and API flow diagrams |
| [App Overview](docs/Surgical_Procedure_Listing_App_Overview.md) | High-level design document |
| [ICD Code Reference](docs/Understanding%20ICD%20Codes.docx) | How ICD-10 and ICD-11 codes are structured |
| [Mapping System Analysis](docs/mapping_system_analysis.md.resolved) | Deep-dive into the mapping/verification pipeline, constraints, and improvement strategies |
| [Master TTGs](docs/Master_v4%20TTGs.xlsx) | Source Excel with procedure definitions and ICD-10 codes |
| [Planning Docs](docs/planning/) | Implementation plans for each feature iteration |
