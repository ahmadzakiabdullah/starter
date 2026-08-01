<?php

namespace Tests\Feature;

use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class AuditLogControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_only_manage_roles_permission_can_access_audit_logs(): void
    {
        $role = Role::create(['name' => 'superadmin']);
        $superadmin = User::factory()->create(['name' => 'Super Admin', 'username' => 'superadmin']);
        $superadmin->assignRole($role);

        $regularUser = User::factory()->create();

        $this->actingAs($regularUser)
            ->get(route('audit-logs.index'))
            ->assertForbidden();

        $this->actingAs($superadmin)
            ->get(route('audit-logs.index'))
            ->assertStatus(200);
    }

    public function test_searching_and_filtering_audit_logs(): void
    {
        $role = Role::create(['name' => 'superadmin']);
        $superadmin = User::factory()->create(['name' => 'Admin User', 'username' => 'admin']);
        $superadmin->assignRole($role);

        $logA = AuditLog::create([
            'event' => 'user.created',
            'description' => 'Created user tommy',
            'user_id' => $superadmin->id,
        ]);
        $logA->created_at = now()->subDays(5);
        $logA->save(['timestamps' => false]);

        $logB = AuditLog::create([
            'event' => 'role.created',
            'description' => 'Created role manager',
            'user_id' => $superadmin->id,
        ]);
        $logB->created_at = now();
        $logB->save(['timestamps' => false]);

        $logC = AuditLog::create([
            'event' => 'user.deleted',
            'description' => 'Deleted user john',
            'user_id' => $superadmin->id,
        ]);
        $logC->created_at = now()->addDays(5);
        $logC->save(['timestamps' => false]);

        // Search: 'tommy'
        $response = $this->actingAs($superadmin)
            ->get(route('audit-logs.index', ['search' => 'tommy']))
            ->assertStatus(200);

        $logsData = $response->viewData('page')['props']['logs']['data'];
        $this->assertTrue(collect($logsData)->contains('id', $logA->id));
        $this->assertFalse(collect($logsData)->contains('id', $logB->id));

        // Event filter: 'role.created'
        $response = $this->actingAs($superadmin)
            ->get(route('audit-logs.index', ['event' => 'role.created']))
            ->assertStatus(200);

        $logsData = $response->viewData('page')['props']['logs']['data'];
        $this->assertFalse(collect($logsData)->contains('id', $logA->id));
        $this->assertTrue(collect($logsData)->contains('id', $logB->id));

        // Date range: from today
        $response = $this->actingAs($superadmin)
            ->get(route('audit-logs.index', ['date_from' => now()->toDateString()]))
            ->assertStatus(200);

        $logsData = $response->viewData('page')['props']['logs']['data'];
        $this->assertFalse(collect($logsData)->contains('id', $logA->id));
        $this->assertTrue(collect($logsData)->contains('id', $logB->id));
        $this->assertTrue(collect($logsData)->contains('id', $logC->id));

        // Date range: to today
        $response = $this->actingAs($superadmin)
            ->get(route('audit-logs.index', ['date_to' => now()->toDateString()]))
            ->assertStatus(200);

        $logsData = $response->viewData('page')['props']['logs']['data'];
        $this->assertTrue(collect($logsData)->contains('id', $logA->id));
        $this->assertTrue(collect($logsData)->contains('id', $logB->id));
        $this->assertFalse(collect($logsData)->contains('id', $logC->id));
    }

    public function test_per_page_pagination_limits(): void
    {
        $role = Role::create(['name' => 'superadmin']);
        $superadmin = User::factory()->create();
        $superadmin->assignRole($role);

        // Default (25)
        $response = $this->actingAs($superadmin)
            ->get(route('audit-logs.index'))
            ->assertStatus(200);

        $this->assertEquals(25, $response->viewData('page')['props']['logs']['per_page']);

        // Valid custom limit (50)
        $response = $this->actingAs($superadmin)
            ->get(route('audit-logs.index', ['per_page' => 50]))
            ->assertStatus(200);

        $this->assertEquals(50, $response->viewData('page')['props']['logs']['per_page']);

        // Invalid limit falls back to 25
        $response = $this->actingAs($superadmin)
            ->get(route('audit-logs.index', ['per_page' => 999]))
            ->assertStatus(200);

        $this->assertEquals(25, $response->viewData('page')['props']['logs']['per_page']);
    }

    public function test_index_returns_valid_inertia_response_structure(): void
    {
        $role = Role::create(['name' => 'superadmin']);
        $superadmin = User::factory()->create();
        $superadmin->assignRole($role);

        AuditLog::create([
            'event' => 'user.created',
            'description' => 'Created user tommy',
            'user_id' => $superadmin->id,
        ]);

        $this->actingAs($superadmin)
            ->get(route('audit-logs.index', ['search' => 'tommy']))
            ->assertInertia(fn (Assert $page) => $page
                ->component('Admin/AuditLogs/Index')
                ->has('logs.data', 1)
                ->has('logs.data.0', fn (Assert $page) => $page
                    ->has('id')
                    ->has('event')
                    ->has('description')
                    ->has('actor')
                    ->has('created_at')
                    ->has('old_values')
                    ->has('new_values')
                    ->has('ip_address')
                    ->has('user_agent')
                    ->has('auditable_type')
                    ->has('auditable_id')
                )
                ->has('events')
                ->has('filters', fn (Assert $page) => $page
                    ->where('search', 'tommy')
                    ->where('event', null)
                    ->where('date_from', null)
                    ->where('date_to', null)
                    ->where('per_page', '25')
                )
            );
    }

    public function test_purging_old_audit_logs(): void
    {
        $role = Role::create(['name' => 'superadmin']);
        $superadmin = User::factory()->create(['name' => 'Admin User', 'username' => 'admin']);
        $superadmin->assignRole($role);

        // Record older than 30 days
        $oldLog = AuditLog::create([
            'event' => 'user.created',
            'description' => 'Old record',
        ]);
        $oldLog->created_at = now()->subDays(35);
        $oldLog->save(['timestamps' => false]);

        // Record newer than 30 days
        $newLog = AuditLog::create([
            'event' => 'user.created',
            'description' => 'New record',
        ]);
        $newLog->created_at = now()->subDays(10);
        $newLog->save(['timestamps' => false]);

        // Non-admin cannot purge
        $regularUser = User::factory()->create();
        $this->actingAs($regularUser)
            ->post(route('audit-logs.purge'), ['days' => 30])
            ->assertForbidden();

        // Superadmin purges logs older than 30 days
        $this->actingAs($superadmin)
            ->post(route('audit-logs.purge'), ['days' => 30])
            ->assertRedirect()
            ->assertSessionHas('success');

        $this->assertDatabaseMissing('audit_logs', ['id' => $oldLog->id]);
        $this->assertDatabaseHas('audit_logs', ['id' => $newLog->id]);

        // Verify that a purge record itself has been logged!
        $this->assertDatabaseHas('audit_logs', [
            'event' => 'audit_log.purged',
            'user_id' => $superadmin->id,
        ]);
    }

    public function test_purge_validates_days_input(): void
    {
        $role = Role::create(['name' => 'superadmin']);
        $superadmin = User::factory()->create();
        $superadmin->assignRole($role);

        // Invalid days value
        $this->actingAs($superadmin)
            ->post(route('audit-logs.purge'), ['days' => 15])
            ->assertSessionHasErrors('days');

        // Missing days value
        $this->actingAs($superadmin)
            ->post(route('audit-logs.purge'), [])
            ->assertSessionHasErrors('days');

        // Valid days value
        $this->actingAs($superadmin)
            ->post(route('audit-logs.purge'), ['days' => 60])
            ->assertSessionDoesntHaveErrors('days')
            ->assertRedirect();
    }
}
