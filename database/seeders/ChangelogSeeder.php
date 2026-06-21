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
    }
}
