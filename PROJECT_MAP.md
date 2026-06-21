# Project Map & Development Conventions

This document serves as the primary reference map for AI agents and developers working on this Laravel + Inertia.js (React + TypeScript) codebase. It outlines the tech stack, directory structure, database schema, and coding conventions to ensure consistency and minimize context token consumption.

---

## 🚀 Tech Stack & Environment

- **Backend:** Laravel 11/12 (PHP 8.2+)
- **Frontend Bridge:** Inertia.js (Monolithic React adapter)
- **Frontend Library:** React 18 & TypeScript (compiled via Vite)
- **Styling:** Tailwind CSS v4 & Shadcn UI (using [themes.css](file:///d:/www/laravel/resources/css/themes.css) design presets)
- **Database:** MySQL
  - Host: `127.0.0.1:3306`
  - Database Name: `laravel`
  - Username: `root`
  - Password: `` (empty)
- **Local Domain:** `http://laravel.test/` (handled via Laragon)
- **AI Tooling:** Laravel MCP (`laravel/mcp` package installed at `v0.8.1`)

---

## 📁 Core Codebase Directory Structure

### 1. Backend (PHP / Laravel)
- **[routes/web.php](file:///d:/www/laravel/routes/web.php):** Web routing definitions mapping requests to Inertia page renders (includes `/dashboard/media` routes).
- **[app/Http/Controllers/](file:///d:/www/laravel/app/Http/Controllers/):** Laravel controllers processing business logic (e.g. `MediaController.php` processing file operations).
- **[app/Models/](file:///d:/www/laravel/app/Models/):** Eloquent models representing database tables (e.g. `Media.php` with URL and size formatting accessors).
- **[database/migrations/](file:///d:/www/laravel/database/migrations/):** Table schema migration definitions.
- **[database/seeders/](file:///d:/www/laravel/database/seeders/DatabaseSeeder.php):** Seeder definitions for initial user, role, and changelog setups.

### 2. Frontend (TypeScript / React)
- **[resources/views/app.blade.php](file:///d:/www/laravel/resources/views/app.blade.php):** Blade entry layout loading Google Fonts and executing Vite client injections.
- **[resources/js/app.tsx](file:///d:/www/laravel/resources/js/app.tsx):** Frontend entry bootstrap setting up the Inertia App, next-themes, and theme customizers.
- **[resources/js/Pages/](file:///d:/www/laravel/resources/js/Pages/):** Page-level views rendered by controllers (e.g., `Dashboard.tsx`, `Admin/Media/Index.tsx` for media manager, `Admin/Settings/Edit.tsx`).
- **[resources/js/Components/](file:///d:/www/laravel/resources/js/Components/):** Reusable component layouts.
  - **[Components/ui/](file:///d:/www/laravel/resources/js/Components/ui/):** Raw Shadcn UI components.
  - **[Components/layout/](file:///d:/www/laravel/resources/js/Components/layout/):** Shell structural components (Sidebar, Header, Search).
  - **[Components/media/MediaSelector.tsx](file:///d:/www/laravel/resources/js/Components/media/MediaSelector.tsx):** Reusable modal selector dialog for picking media assets in forms.
- **[resources/js/lib/utils.ts](file:///d:/www/laravel/resources/js/lib/utils.ts):** Helper utilities (`cn` class merger and avatar helpers).
- **[resources/css/app.css](file:///d:/www/laravel/resources/css/app.css):** Global styles loading Tailwind v4, custom theme variables, and Radix animation layers.

---

## 🗄️ Database Schema Reference

### 1. `users` Table
Stores registered users with hashed password credentials:
- `id` (BigInt, Primary Key, Auto-Increment)
- `name` (String)
- `email` (String, Unique)
- `email_verified_at` (Timestamp, Nullable)
- `password` (String)
- `remember_token` (String, Nullable)
- `timestamps` (`created_at`, `updated_at`)

### 2. `sessions` Table
Handles user active session states:
- `id` (String, Primary Key)
- `user_id` (BigInt, Nullable, Index)
- `ip_address` (String, Nullable)
- `user_agent` (Text, Nullable)
- `payload` (LongText)
- `last_activity` (Integer, Index)

### 3. `media` Table
Stores uploaded file metadata:
- `id` (BigInt, Primary Key, Auto-Increment)
- `name` (String) - Original filename
- `file_name` (String) - Hashed unique disk filename
- `mime_type` (String) - Asset MIME type (e.g. `image/png`)
- `path` (String) - File storage path (e.g. `media/file.png`)
- `size` (BigInt) - File size in bytes
- `folder` (String, Nullable) - Virtual folder name
- `disk` (String) - Disk storage type (default: `public`)
- `timestamps` (`created_at`, `updated_at`)

---

## 🎨 Coding Conventions & Path Mapping

### 1. Path Aliasing
TypeScript and Vite are configured to resolve path aliases via the `@/` prefix pointing to `resources/js/`.
- Correct import format: `import { Button } from "@/Components/ui/button";`
- Case flexibility: Symlink rules mapped in `tsconfig.json` allow aliases for both lowercase `@/components/*` and uppercase `@/Components/*` paths.

### 2. File Naming Rules
- **React Components / Pages:** `PascalCase` (e.g., `Dashboard.tsx`, `AuthenticatedLayout.tsx`).
- **Hooks:** `camelCase` starting with `use` (e.g., `use-mobile.ts`).
- **Controllers:** `PascalCase` ending with `Controller` (e.g., `ProfileController.php`).
- **Models:** Singular `PascalCase` (e.g., `User.php`).

### 3. State Management & Theme Config
- Page-specific initial state is passed down as **Props** from Laravel Controllers through Inertia.
- Global theme values (radius, color presets, scale, layout type) are governed by **`ActiveThemeProvider`** in `resources/js/Components/active-theme.tsx`, which synchronizes state directly with `document.body` attributes and cookies.
