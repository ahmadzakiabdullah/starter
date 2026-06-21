# Laravel + Inertia.js (React + TypeScript) Starter Kit

This starter kit is a premium administration portal application built using a combination of Laravel 11/12, Inertia.js, React (TypeScript), Tailwind CSS v4, and Shadcn UI. It provides a solid, modular foundation for building enterprise web applications.

---

## 🚀 Current Status & System Modules

The system is fully developed, compiled, and features the following modules:

### 1. 📂 Media Manager - Release Version `v2.0.0`
* **Centralized Media Library:** An interactive dashboard panel to upload, search, and filter system file assets.
* **Virtual Folder Support:** Organize files logically into virtual directories without modifying the physical disk file structure.
* **Drag-and-Drop Uploader:** Seamless dropzone area for fast file uploads of up to 10MB.
* **Bulk Actions:** Ability to select multiple files and delete them simultaneously in a single batch.
* **MediaSelector Dialog Modal:** A reusable React dialog component to pick media library assets from any form input page.

### 2. ⚙️ System & Branding Settings
* **Live Branding Preview:** A real-time sticky card simulating how branding inputs (App Name, Logo type - Lucide Icon vs Custom Image, Favicon) look in the sidebar, browser tab, and login screen before saving.
* **Layout Centering:** The entire system settings page is centered (`mx-auto max-w-5xl`) to maximize visual appearance on wide viewports.
* **Top Header Action Bar:** Relocated the *Save Settings* submit button to the top-right header section using the `form="settings-form"` reference, providing quick action without scrolling to the bottom.
* **System Cache Utilities:** Quick action buttons to clear application cache, route cache, view cache, and run full system optimization.
* **SMTP Configuration & Connection Testing:** Setup SMTP relay credentials with a **Test SMTP Connection** button to verify email parameters instantly.

### 3. 👥 User & Access Role Management (Users & Roles CRUD)
* **Profiles & Client Access:** Account registrations, profile updates, custom avatar replacements, and profile deletions.
* **Roles & Permissions Control:** Manage system roles (`Superadmin`, `Admin`, `Manager`, `User`) utilizing interactive selection controls.
* **Profile CSV Export:** Utility to export selected user profiles into structured CSV files.
* **Two-Factor Authentication (2FA):** Integrated 2FA controls for enhanced user account security.

### 4. 📈 Dashboard, Telemetry & Audit Logs
* **Core Metrics Grid:** Visual metric cards showing total user profiles, administrators, email verification statuses, and system pending tasks.
* **System Notifications:** A notification center with actions to mark notifications as read or clear all logs.
* **System Telemetry Widget:** Real-time percentage bars for host CPU, RAM, and Disk storage capacity utilization.
* **Activity Audit Logs:** Comprehensive event tracker recording user interactions along with before/after state diff snapshots and client IP addresses.

### 5. 🛠️ Diagnostics & Backups (System Backups & Logs)
* **Log Reader Dashboard:** Read Laravel file logs directly in the admin panel without manual access to physical log directories.
* **Backup Manager:** Generate database and filesystem backup archives, download zip assets, and delete old archive files.
* **Health Monitor Panel:** Monitor database connection stability, cache stores, and server states.

### 6. 📜 Versioning Changelogs Timeline
* **Accordion Changelogs UI:** Clean timeline layout utilizing Radix Accordion components. The latest release notes are expanded by default while older updates are collapsed automatically to conserve scrolling space.

---

## 🛠️ Installation & Setup

Follow these steps to set up and run the project locally on your system:

### 1. Clone the Repository & Install Dependencies
```bash
# Install PHP dependencies (Composer)
composer install

# Install Frontend dependencies (NPM)
npm install
```

### 2. Configure Environment variables (.env)
Copy `.env.example` to `.env` and configure your database parameters (MySQL is default):
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=laravel
DB_USERNAME=root
DB_PASSWORD=
```

### 3. Generate Application Key & Run Migrations
```bash
# Generate APP_KEY
php artisan key:generate

# Run database migrations and seed default data (Users, Roles & Changelogs)
php artisan migrate:fresh --seed
```

### 4. Start the Local Server Processes
```bash
# Run Laravel development server (Terminal 1)
php artisan serve

# Run Vite Hot Dev server (Terminal 2)
npm run dev
```

The application will be accessible at: `http://127.0.0.1:8000` (or your local alias `http://laravel.test/`).

---

## 🎨 Coding Conventions & Architecture

Please refer to **[PROJECT_MAP.md](PROJECT_MAP.md)** to inspect directory structures, full database schema tables, file-naming rules, and TypeScript import path aliases (`@/`).
