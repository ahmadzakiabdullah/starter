<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\AuditLog;
use Illuminate\Foundation\Testing\RefreshDatabase;
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
     * Test authenticated users can view dashboard with props.
     */
    public function test_authenticated_users_can_access_dashboard_with_required_metrics(): void
    {
        $user = User::factory()->create();

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
}
