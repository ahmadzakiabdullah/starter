<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

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

        // Create users
        $user1 = User::updateOrCreate(
            ['email' => 'ahmadzaki@utem.edu.my'],
            [
                'name' => 'Ahmad Zaki Abdullah',
                'username' => 'ahmadzaki',
                'password' => Hash::make('password'),
            ]
        );
        $user1->assignRole($superadmin);

        $user2 = User::updateOrCreate(
            ['email' => 'dev@test.com'],
            [
                'name' => 'Developer',
                'username' => 'developer',
                'password' => Hash::make('password'),
            ]
        );
        $user2->assignRole($userRole);

        $this->call(ChangelogSeeder::class);
    }
}
