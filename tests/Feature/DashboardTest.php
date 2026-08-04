<?php

namespace Tests\Feature;

use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class DashboardTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test guests are redirected from dashboard.
     */
    public function test_guests_are_redirected_to_login(): void
    {
        $this->get(route('dashboard'))
            ->assertRedirect(route('login'));
    }

    /**
     * Test staff (superadmin) users can view full dashboard metrics.
     */
    public function test_staff_users_can_access_dashboard_with_required_metrics(): void
    {
        $role = Role::create(['name' => 'superadmin', 'guard_name' => 'web']);
        $user = User::factory()->create();
        $user->assignRole($role);

        // Create a dummy audit log to ensure recentActivity is not empty
        AuditLog::create([
            'user_id' => $user->id,
            'event' => 'user.logged_in',
            'description' => 'User logged in to panel',
        ]);

        $response = $this->actingAs($user)
            ->get(route('dashboard'))
            ->assertStatus(200);

        $response->assertInertia(fn ($page) => $page
            ->component('Dashboard')
            ->has('stats')
            ->has('recentActivity')
            ->has('telemetry')
        );

        $viewProps = $response->viewData('page')['props'];

        // Assert stats structural layout keys
        $this->assertArrayHasKey('total_users', $viewProps['stats']);
        $this->assertArrayHasKey('total_roles', $viewProps['stats']);
        $this->assertArrayHasKey('total_backups', $viewProps['stats']);
        $this->assertArrayHasKey('unread_notifications', $viewProps['stats']);

        // Assert recentActivity contents
        $this->assertNotEmpty($viewProps['recentActivity']);
        $this->assertEquals('user.logged_in', $viewProps['recentActivity'][0]['event']);
        $this->assertEquals($user->name, $viewProps['recentActivity'][0]['actor']);

        // Assert telemetry structural layout keys
        $this->assertArrayHasKey('cpu_percent', $viewProps['telemetry']);
        $this->assertArrayHasKey('ram_percent', $viewProps['telemetry']);
        $this->assertArrayHasKey('disk_percent', $viewProps['telemetry']);
        $this->assertArrayHasKey('caches', $viewProps['telemetry']);
    }

    /**
     * Test regular users are not exposed to admin-only metrics.
     */
    public function test_regular_users_do_not_receive_admin_metrics(): void
    {
        $user = User::factory()->create();

        AuditLog::create([
            'user_id' => $user->id,
            'event' => 'user.logged_in',
            'description' => 'User logged in to panel',
        ]);

        $response = $this->actingAs($user)
            ->get(route('dashboard'))
            ->assertStatus(200);

        $viewProps = $response->viewData('page')['props'];

        // Admin-only counts must not be exposed to regular users
        $this->assertNull($viewProps['stats']['total_users']);
        $this->assertNull($viewProps['stats']['total_roles']);
        $this->assertNull($viewProps['stats']['total_backups']);
        $this->assertEmpty($viewProps['recentActivity']);
        $this->assertNull($viewProps['telemetry']['cpu_percent']);
        $this->assertNull($viewProps['telemetry']['ram_percent']);
        $this->assertNull($viewProps['telemetry']['disk_percent']);
    }
}
