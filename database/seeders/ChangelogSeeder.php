<?php

namespace Database\Seeders;

use App\Models\Changelog;
use Illuminate\Database\Seeder;

class ChangelogSeeder extends Seeder
{
    public function run(): void
    {
        // Truncate existing logs to avoid duplicates during multiple seeds
        Changelog::truncate();

        Changelog::create([
            'version' => 'v1.0.0',
            'title' => 'Initial System Launch',
            'description' => 'Established core architecture of the administrator dashboard panel, layout structures, and role permissions configuration.',
            'release_date' => '2026-06-01',
            'is_published' => true,
            'changes' => [
                ['type' => 'Added', 'content' => 'Laravel, Inertia React, and Tailwind CSS base architecture setup.'],
                ['type' => 'Added', 'content' => 'Secure admin session authenticated page layout structure.'],
                ['type' => 'Added', 'content' => 'Spatie Roles & Permissions base models registration.'],
            ],
        ]);

        Changelog::create([
            'version' => 'v1.1.0',
            'title' => 'Settings Module Upgrade',
            'description' => 'Upgraded administrative settings screen with a tabbed layout, SMTP test emails, cache cleaning shortcuts, and a custom maintenance screen.',
            'release_date' => '2026-06-05',
            'is_published' => true,
            'changes' => [
                ['type' => 'Added', 'content' => 'SMTP test connection trigger sending a mock verification message.'],
                ['type' => 'Added', 'content' => 'Maintenance mode check middleware locking non-superadmin users out during updates.'],
                ['type' => 'Improved', 'content' => 'Reorganized settings inputs into structured layout tabs (General, Regional, Security, SMTP, System Maintenance).'],
                ['type' => 'Improved', 'content' => 'Added application view, route, config, and cache clearing commands.'],
            ],
        ]);

        Changelog::create([
            'version' => 'v1.2.0',
            'title' => 'User Management Polish',
            'description' => 'Polished the user management module with real-time statistics cards, verified column switches, client CSV outputs, and secure credential tools.',
            'release_date' => '2026-06-10',
            'is_published' => true,
            'changes' => [
                ['type' => 'Added', 'content' => 'Batch export list utility generating a client-side CSV spreadsheet file download.'],
                ['type' => 'Added', 'content' => 'Live quick email verification toggle column directly in user rows.'],
                ['type' => 'Added', 'content' => 'Interactive password generator and color-graded safety strength helper bar.'],
                ['type' => 'Improved', 'content' => 'User details statistics cards indicating total verified and pending registrations.'],
            ],
        ]);

        Changelog::create([
            'version' => 'v1.3.0',
            'title' => 'Role & Permission Matrix',
            'description' => 'Created an interactive visual permission-to-role assignment matrix, clickable member lists, and custom capability scope editor.',
            'release_date' => '2026-06-15',
            'is_published' => true,
            'changes' => [
                ['type' => 'Added', 'content' => 'Permission Matrix Grid indicating exactly which capabilities belong to which roles.'],
                ['type' => 'Added', 'content' => 'Dynamic custom permission tag scopes creator and custom delete filters.'],
                ['type' => 'Improved', 'content' => 'Role members list redirects filtering the Users list by role name.'],
                ['type' => 'Fixed', 'content' => 'Bypassed system permission deletions for core keys like manage-users and manage-roles.'],
            ],
        ]);

        Changelog::create([
            'version' => 'v1.4.0',
            'title' => 'Audit Logs Compliance & Purge',
            'description' => 'Expanded log details with browser agent mappings, side-by-side properties change tracking, and automated log purging rules.',
            'release_date' => '2026-06-20',
            'is_published' => true,
            'changes' => [
                ['type' => 'Added', 'content' => 'Details drawer dialog with custom metadata mapping (browser User Agent, subject models, client IP address).'],
                ['type' => 'Added', 'content' => 'Visual green/red diff comparator displaying exactly which model properties were modified.'],
                ['type' => 'Added', 'content' => 'Chronological search query inputs for actor names, target logs and date ranges.'],
                ['type' => 'Added', 'content' => 'Safe logs purging tool for superadmins with automated trail logging checks.'],
            ],
        ]);

        Changelog::create([
            'version' => 'v1.5.0',
            'title' => 'System Versioning & Changelog',
            'description' => 'Created the system versioning and development progress tracking module with layout badges and release managers.',
            'release_date' => '2026-06-21',
            'is_published' => true,
            'changes' => [
                ['type' => 'Added', 'content' => 'Dynamic versioning system showing current release badge on navigation sidebar.'],
                ['type' => 'Added', 'content' => 'Interactive admin release builder form with categorized bullet points addition.'],
                ['type' => 'Added', 'content' => 'Chronological timeline layout visualization cards.'],
            ],
        ]);

        Changelog::create([
            'version' => 'v1.6.0',
            'title' => 'Authentication Module Polish',
            'description' => 'Polished the guest authentication screens (Login and Register) with premium glassmorphism layouts, glowing backdrop effects, double password visibility toggles, and social login buttons.',
            'release_date' => '2026-06-21',
            'is_published' => true,
            'changes' => [
                ['type' => 'Added', 'content' => 'Double password visibility show/hide toggles in register and login forms.'],
                ['type' => 'Added', 'content' => 'Social sign-in grid layout placeholders for Google and GitHub accounts.'],
                ['type' => 'Improved', 'content' => 'Upgraded GuestLayout with glassmorphic cards and soft glowing background blur blobs.'],
            ],
        ]);

        Changelog::create([
            'version' => 'v1.7.0',
            'title' => 'Notifications Module Polish',
            'description' => 'Polished the system notifications dashboard with visual categories, unread filtering tabs, individual trash tools, and bulk cleanup controls.',
            'release_date' => '2026-06-21',
            'is_published' => true,
            'changes' => [
                ['type' => 'Added', 'content' => 'Dynamic tab filtering separating unread alerts from historical logs.'],
                ['type' => 'Added', 'content' => 'Contextual icons and color-coded status badges for security, settings, and profile updates.'],
                ['type' => 'Added', 'content' => 'Single row trash deletion and bulk clear notifications panel.'],
                ['type' => 'Improved', 'content' => 'Synchronized dropdown header widget with live count indicators.'],
            ],
        ]);

        Changelog::create([
            'version' => 'v1.8.0',
            'title' => 'System Administration Expansion Pack',
            'description' => 'Introduced premium administration features: Two-Factor Authentication, browser device session manager, custom portable database backup utility, visual log reader, and an OS-aware server health monitor.',
            'release_date' => '2026-06-21',
            'is_published' => true,
            'changes' => [
                ['type' => 'Added', 'content' => 'Two-Factor Authentication (2FA) with secure OTP QR code activation.'],
                ['type' => 'Added', 'content' => 'Active browser sessions list with direct remote device logout capabilities.'],
                ['type' => 'Added', 'content' => 'Custom portable Database Backup Manager supporting downloads and deletions.'],
                ['type' => 'Added', 'content' => 'Laravel System Log Reader with memory-safe reading and expandable stack traces.'],
                ['type' => 'Added', 'content' => 'OS-Aware Server Health Monitor with progress gauges checking CPU, RAM, disk, database, and Laravel caches.'],
            ],
        ]);

        Changelog::create([
            'version' => 'v1.9.0',
            'title' => 'Dynamic Branding Customizer',
            'description' => 'Introduced dynamic branding settings allowing administrators to customize the system logo style (Lucide preset vs uploaded custom image) and favicon directly from the settings panel, complete with an interactive real-time preview card.',
            'release_date' => '2026-06-21',
            'is_published' => true,
            'changes' => [
                ['type' => 'Added', 'content' => 'Dynamic favicon asset rendering directly in the browser tab from DB settings.'],
                ['type' => 'Added', 'content' => 'Logo Style customizer choosing between 16 Lucide icon presets and custom uploaded image files.'],
                ['type' => 'Added', 'content' => 'Sticky Real-time Branding Live Preview Panel inside system settings.'],
                ['type' => 'Added', 'content' => 'Support for file uploads (FormData) using Inertia POST method overriding with PATCH.'],
                ['type' => 'Improved', 'content' => 'Enhanced settings page layouts with animations, responsive visual splits, and custom icons.'],
            ],
        ]);

        Changelog::create([
            'version' => 'v2.0.0',
            'title' => 'Media Manager & Reusable Asset Library',
            'description' => 'Designed and launched the centralized Media Library module, enabling administrators to drag-and-drop uploads, organize files inside virtual folders, rename, delete files in bulk, and select uploaded assets directly inside System Settings via an interactive selector dialog modal.',
            'release_date' => '2026-06-21',
            'is_published' => true,
            'changes' => [
                ['type' => 'Added', 'content' => 'Central Media Manager dashboard featuring HTML5 drag-and-drop file upload zones.'],
                ['type' => 'Added', 'content' => 'Virtual folders penapisan for easy grouping of branding and avatar files.'],
                ['type' => 'Added', 'content' => 'Reusable MediaSelector React modal component for selecting library assets.'],
                ['type' => 'Added', 'content' => 'Select from Media Manager buttons in Logo/Favicon settings with live preview links.'],
                ['type' => 'Added', 'content' => 'Multi-file selection checkboxes enabling bulk delete operations.'],
                ['type' => 'Added', 'content' => 'Database migrations for storage file tracking.'],
            ],
        ]);

        Changelog::create([
            'version' => 'v2.1.0',
            'title' => 'System Premium Features Expansion',
            'description' => 'Upgraded the system with 5 premium modules: Active Browser Sessions monitor, multi-theme and custom color switcher dropdown, admin-managed global broadcast banners, dynamic Recharts CPU/RAM telemetry graphs, and Sanctum API Access Keys manager.',
            'release_date' => '2026-06-21',
            'is_published' => true,
            'changes' => [
                ['type' => 'Added', 'content' => 'Active Sessions Monitor with readable device details and remote revoke tools.'],
                ['type' => 'Added', 'content' => 'Multi-theme dropdown switcher rendering themes and color presets.'],
                ['type' => 'Added', 'content' => 'Global Announcement Broadcast Banner with admin settings CRUD panel.'],
                ['type' => 'Added', 'content' => 'Live Telecharts plotting memory and processor load with simulation loops.'],
                ['type' => 'Added', 'content' => 'API Access Keys Manager generating and revoking Sanctum tokens.'],
                ['type' => 'Fixed', 'content' => 'Stitched User Account navigation link in user sidebar dropdown.'],
            ],
        ]);

        Changelog::create([
            'version' => 'v2.2.0',
            'title' => 'Feature Flags & Access Matrix Control',
            'description' => 'Introduced dashboard-level feature flags control matrix enabling dynamic toggle control for 6 main system modules, responsive interface element hiding, constructor middleware protections, and user verification toggles.',
            'release_date' => '2026-06-21',
            'is_published' => true,
            'changes' => [
                ['type' => 'Added', 'content' => 'Feature Flags & Module Management panel dynamically toggling 6 system features.'],
                ['type' => 'Added', 'content' => 'Constructor-level middleware checking active status of individual modules.'],
                ['type' => 'Added', 'content' => 'Responsive UI element hiding and fallbacks for disabled modules.'],
                ['type' => 'Added', 'content' => 'User verification email_verified_at switch inside create/edit forms.'],
                ['type' => 'Changed', 'content' => 'Settings page layout width restriction removal.'],
                ['type' => 'Fixed', 'content' => 'Route Model Binding query columns for user listings.'],
                ['type' => 'Fixed', 'content' => 'Prevention of self-deverification account lockouts.'],
            ],
        ]);
    }
}
