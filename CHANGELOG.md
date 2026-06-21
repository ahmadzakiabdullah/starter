# Changelog

All notable changes to this Laravel + Inertia (React + TypeScript) project will be documented in this file.

---

## [2.0.0] - 2026-06-21

### Added
- **Centralized Media Manager Dashboard**: Introduced a media assets portal equipped with virtual folder categorizations, asset search/filter capabilities, metadata side-panel inspectors, and click-to-copy URL link actions.
- **Drag-and-Drop Dropzones**: Integrated HTML5 native drag-and-drop file upload interfaces for both the main dashboard and selector modals.
- **Reusable MediaSelector React Dialog**: Built a modal popover to select media library assets from any form input page.
- **System Settings Integration**: Added "Select from Library" actions to branding file input pickers, allowing admins to pick system logos and favicons directly from the media library database.
- **Bulk Delete Operations**: Enabled checkboxes for files and a bulk delete button to clear multiple assets in a single batch.

### Improved
- **Accordion Changelogs UI**: Refactored the System Versioning & Changelog timeline list to collapse older releases inside Radix Accordions, improving visual clarity and reducing required scrolling space.
- **Settings Page Centering & Action Bar**: Added container centering (`mx-auto`) to the Settings edit view and relocated the "Save Settings" submit button to the top-right header section.

### Fixed
- **Recharts Container Warnings**: Wrapped the Recharts ResponsiveContainer in an `isMounted` hook check and specified `width`, `height`, and `minWidth` attributes to eliminate dimension computation warnings on client page hydration.
- **Dashboard Avatar 404 Errors**: Replaced non-existent local avatar paths (`/images/avatars/*.png`) inside the chat widget and team members modules with active, stable public profile generation URLs from the Dicebear API.
- **Media Router Collision**: Fixed an issue where the Inertia link calls to `/dashboard/media` returned raw JSON by verifying the `X-Inertia` request header context.

## [1.9.0] - 2026-06-21

### Added
- **Dynamic Favicon Asset**: Support for custom favicon configuration rendering directly in the browser tab from DB settings.
- **Logo Style Customizer**: Toggle group choosing between 16 modern Lucide icon presets and custom uploaded image files.
- **Real-time Live Preview Panel**: Sticky layout card simulating how branding inputs look in the sidebar, browser tab, and login screens before saving.
- **FormData Upload Support**: Configured Inertia client forms to support file attachments utilizing POST method mapping for PATCH settings endpoint.

### Improved
- **Settings Layout Structure**: Upgraded settings page tab panel with animation fades, responsive grid splits, custom icons, and visual guides.

## [1.0.0] - 2026-06-20

### Added
- **Laravel Project Base**: Initialized a clean Laravel 11/12 project.
- **Authentication System (Laravel Breeze)**:
  - Installed Laravel Breeze with the **Inertia.js + React + TypeScript** stack.
  - Provided default pages for login, registration, profile settings, and password resets in [resources/js/Pages/Auth](file:///d:/www/laravel/resources/js/Pages/Auth).
- **Tailwind CSS v4 Styling**:
  - Configured the Tailwind CSS v4 compiler natively using `@tailwindcss/vite` in **[vite.config.js](file:///d:/www/laravel/vite.config.js)**.
  - Updated **[app.css](file:///d:/www/laravel/resources/css/app.css)** with `@import "tailwindcss";`.
- **Shadcn UI Components Setup**:
  - Created the **[components.json](file:///d:/www/laravel/components.json)** configuration file to map React components aliases.
  - Added the `cn` utility function (Tailwind class merger) and avatar helper in **[utils.ts](file:///d:/www/laravel/resources/js/lib/utils.ts)**.
  - Copied and prepared **58+ Shadcn UI components** ready for use in **[Components/ui](file:///d:/www/laravel/resources/js/Components/ui)**.
- **Database (SQLite)**:
  - Configured SQLite as the initial local database.
  - Ran initial migrations (Users, Sessions, Jobs, Cache).
- **Laravel MCP Package**:
  - Installed the official **`laravel/mcp`** (v0.8.1) package to provide Model Context Protocol support, allowing AI agents/clients to interact with the application's data, tools, and resources.
- **AI-Optimized Project Map**:
  - Created **[PROJECT_MAP.md](file:///d:/www/laravel/PROJECT_MAP.md)** in the root directory to store database schemas, tech stack specifications, file-naming conventions, and path mappings. This serves as a lightweight context reference for AI models to dramatically reduce token consumption.

### Configured
- Added `axios` utility mapping on the window object in **[bootstrap.ts](file:///d:/www/laravel/resources/js/bootstrap.ts)**.
- Verified that the local development URL **`http://laravel.test/`** is fully operational for the Inertia login flow.

### Fixed & Optimized
- **Primary Layout Styling**:
  - Copied the theme design presets **[themes.css](file:///d:/www/laravel/resources/css/themes.css)** from the Next.js project to preserve the premium color palettes and styling.
  - Integrated color variables, fonts, custom dark variant (`dark` media variant), scrollbars, and Radix animation layers in **[app.css](file:///d:/www/laravel/resources/css/app.css)**.
  - Installed the **`tailwindcss-animate`** dependency to ensure smooth UI transitions.
- **Google Fonts Integration**:
  - Updated the layout template **[app.blade.php](file:///d:/www/laravel/resources/views/app.blade.php)** to import 11 Google Fonts (Inter, Poppins, Outfit, etc.) to match the original Shadcn UI Kit design.
- **Responsive Layout Adjustments**:
  - Validated and refined the sidebar's responsive auto-collapse behavior (`useIsTablet` hook below the 1200px breakpoint) and the toggle trigger in the site header.
- **Sidebar Menu Simplification**:
  - Cleared out the complex default menu and preserved a single **"Home"** item pointing to `/dashboard`.
  - Configured the menu item to use the **`LayoutDashboard`** icon from `lucide-react`.
- **Database Seeder Configuration**:
  - Configured **[DatabaseSeeder.php](file:///d:/www/laravel/database/seeders/DatabaseSeeder.php)** using `updateOrCreate` to seed the default users `ahmadzaki@utem.edu.my` (and `dev@test.com`) with hashed passwords. This prevents user data from being lost when running fresh migrations (`migrate:fresh`).
- **Database Migration to MySQL**:
  - Configured **[.env](file:///d:/www/laravel/.env)** to use a MySQL connection with the `laravel` database and `root` credentials.
  - Ran the migrations and seeders on the new MySQL database.
