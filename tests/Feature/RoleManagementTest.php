<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class RoleManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_superadmin_can_load_roles_index_with_user_counts(): void
    {
        $superadminRole = Role::create(['name' => 'superadmin']);
        $superadmin = User::factory()->create();
        $superadmin->assignRole($superadminRole);

        $userRole = Role::create(['name' => 'user']);
        $user = User::factory()->create();
        $user->assignRole($userRole);

        $response = $this->actingAs($superadmin)
            ->get(route('roles.index'))
            ->assertStatus(200);

        $rolesData = $response->viewData('page')['props']['roles'];

        $this->assertEquals(1, collect($rolesData)->firstWhere('name', 'superadmin')['users_count']);
        $this->assertEquals(1, collect($rolesData)->firstWhere('name', 'user')['users_count']);
    }

    public function test_superadmin_can_create_custom_permission(): void
    {
        $superadminRole = Role::create(['name' => 'superadmin']);
        $superadmin = User::factory()->create();
        $superadmin->assignRole($superadminRole);

        $payload = [
            'name' => 'view-reports',
        ];

        $this->actingAs($superadmin)
            ->post(route('permissions.store'), $payload)
            ->assertRedirect()
            ->assertSessionHas('success');

        $this->assertDatabaseHas('permissions', ['name' => 'view-reports']);
        $this->assertDatabaseHas('audit_logs', ['event' => 'permission.created']);
    }

    public function test_superadmin_cannot_delete_core_permissions(): void
    {
        $superadminRole = Role::create(['name' => 'superadmin']);
        $superadmin = User::factory()->create();
        $superadmin->assignRole($superadminRole);

        $manageUsers = Permission::create(['name' => 'manage-users']);
        $customPerm = Permission::create(['name' => 'access-api']);

        // Attempt deleting system core permission
        $this->actingAs($superadmin)
            ->delete(route('permissions.destroy', $manageUsers->id))
            ->assertRedirect()
            ->assertSessionHas('error');

        $this->assertDatabaseHas('permissions', ['id' => $manageUsers->id]);

        // Delete custom permission
        $this->actingAs($superadmin)
            ->delete(route('permissions.destroy', $customPerm->id))
            ->assertRedirect()
            ->assertSessionHas('success');

        $this->assertDatabaseMissing('permissions', ['id' => $customPerm->id]);
        $this->assertDatabaseHas('audit_logs', ['event' => 'permission.deleted']);
    }

    public function test_superadmin_can_delete_a_custom_role(): void
    {
        $superadmin = User::factory()->create();
        $superadmin->assignRole(Role::create(['name' => 'superadmin']));
        $role = Role::create(['name' => 'manager']);

        $this->actingAs($superadmin)->delete(route('roles.destroy', $role))->assertRedirect()->assertSessionHas('success');

        $this->assertDatabaseMissing('roles', ['id' => $role->id]);
        $this->assertDatabaseHas('audit_logs', ['event' => 'role.deleted']);
    }
}
