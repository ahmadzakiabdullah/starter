<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class UserManagementAuthorizationTest extends TestCase
{
    use RefreshDatabase;

    public function test_manager_cannot_assign_the_superadmin_role(): void
    {
        $superadmin = Role::create(['name' => 'superadmin']);
        $manager = Role::create(['name' => 'manager']);
        $permission = Permission::create(['name' => 'manage-users']);
        $manager->givePermissionTo($permission);

        $actor = User::factory()->create();
        $actor->assignRole($manager);

        $response = $this->actingAs($actor)->post(route('users.store'), [
            'name' => 'Escalation Attempt',
            'username' => 'escalation_attempt',
            'email' => 'escalation@example.com',
            'password' => 'Password123!',
            'roles' => [$superadmin->name],
        ]);

        $response->assertForbidden();
        $this->assertDatabaseMissing('users', ['email' => 'escalation@example.com']);
    }
}
