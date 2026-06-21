<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class UserManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_superadmin_can_toggle_user_email_verification(): void
    {
        $superadminRole = Role::create(['name' => 'superadmin']);
        $superadmin = User::factory()->create();
        $superadmin->assignRole($superadminRole);

        $user = User::factory()->create(['email_verified_at' => null]);

        $this->actingAs($superadmin)
            ->patch(route('users.toggle-verification', $user->id))
            ->assertRedirect();

        $this->assertNotNull($user->refresh()->email_verified_at);
        $this->assertDatabaseHas('audit_logs', ['event' => 'user.verification.toggled']);

        // Toggle back to unverified
        $this->actingAs($superadmin)
            ->patch(route('users.toggle-verification', $user->id))
            ->assertRedirect();

        $this->assertNull($user->refresh()->email_verified_at);
    }

    public function test_superadmin_can_bulk_delete_users_but_cannot_delete_self(): void
    {
        $superadminRole = Role::create(['name' => 'superadmin']);
        $userRole = Role::create(['name' => 'user']);
        $superadmin = User::factory()->create();
        $superadmin->assignRole($superadminRole);

        $users = User::factory()->count(3)->create();
        foreach ($users as $u) {
            $u->assignRole($userRole);
        }

        $ids = $users->pluck('id')->all();

        // Safe bulk delete
        $this->actingAs($superadmin)
            ->post(route('users.bulk-destroy'), ['ids' => $ids])
            ->assertRedirect()
            ->assertSessionHas('success');

        foreach ($ids as $id) {
            $this->assertDatabaseMissing('users', ['id' => $id]);
        }

        // Try deleting self
        $this->actingAs($superadmin)
            ->post(route('users.bulk-destroy'), ['ids' => [$superadmin->id]])
            ->assertRedirect()
            ->assertSessionHas('error');

        $this->assertDatabaseHas('users', ['id' => $superadmin->id]);
    }

    public function test_index_filters_and_sorts_correctly(): void
    {
        $superadminRole = Role::create(['name' => 'superadmin']);
        $superadmin = User::factory()->create();
        $superadmin->assignRole($superadminRole);

        $userA = User::factory()->create(['name' => 'Alpha User', 'email_verified_at' => now(), 'created_at' => now()->subDays(2)]);
        $userB = User::factory()->create(['name' => 'Omega User', 'email_verified_at' => null, 'created_at' => now()]);

        // Filter: Verified
        $response = $this->actingAs($superadmin)
            ->get(route('users.index', ['status' => 'verified']))
            ->assertStatus(200);
            
        $usersData = $response->viewData('page')['props']['users']['data'];
        $this->assertTrue(collect($usersData)->contains('id', $userA->id));
        $this->assertFalse(collect($usersData)->contains('id', $userB->id));

        // Filter: Unverified
        $response = $this->actingAs($superadmin)
            ->get(route('users.index', ['status' => 'unverified']))
            ->assertStatus(200);

        $usersData = $response->viewData('page')['props']['users']['data'];
        $this->assertFalse(collect($usersData)->contains('id', $userA->id));
        $this->assertTrue(collect($usersData)->contains('id', $userB->id));
    }
}
