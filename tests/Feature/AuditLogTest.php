<?php

namespace Tests\Feature;

use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class AuditLogTest extends TestCase
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
}
