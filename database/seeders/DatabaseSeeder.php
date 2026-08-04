<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Never seed development credentials on production without an explicit override.
        if (app()->environment('production') && ! (bool) env('SEED_ADMIN_ALLOW_IN_PRODUCTION', false)) {
            $this->command?->warn('Skipping user seeding in production. Set SEED_ADMIN_ALLOW_IN_PRODUCTION=true to force.');

            $this->call(ChangelogSeeder::class);

            return;
        }

        // Reset cached roles and permissions
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        // Create permissions
        $permissions = [
            'manage-users',
            'manage-roles',
            'manage-settings',
            'view-dashboard',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission]);
        }

        // Create roles and assign permissions
        $superadmin = Role::firstOrCreate(['name' => 'superadmin']);

        $admin = Role::firstOrCreate(['name' => 'admin']);
        $admin->syncPermissions(['manage-users', 'manage-roles', 'view-dashboard']);

        $manager = Role::firstOrCreate(['name' => 'manager']);
        $manager->syncPermissions(['manage-users', 'view-dashboard']);

        $userRole = Role::firstOrCreate(['name' => 'user']);
        $userRole->syncPermissions(['view-dashboard']);

        // Development accounts. Override the password via SEED_ADMIN_PASSWORD
        // (or SEED_DEV_PASSWORD) — never rely on the default outside local.
        $adminPassword = env('SEED_ADMIN_PASSWORD', 'password');
        $devPassword = env('SEED_DEV_PASSWORD', 'password');

        $user1 = User::updateOrCreate(
            ['email' => 'ahmadzaki@utem.edu.my'],
            [
                'name' => 'Ahmad Zaki Abdullah',
                'username' => 'ahmadzaki',
                'password' => Hash::make($adminPassword),
            ]
        );
        $user1->assignRole($superadmin);

        $user2 = User::updateOrCreate(
            ['email' => 'dev@test.com'],
            [
                'name' => 'Developer',
                'username' => 'developer',
                'password' => Hash::make($devPassword),
            ]
        );
        $user2->assignRole($userRole);

        $this->call(ChangelogSeeder::class);
    }
}
