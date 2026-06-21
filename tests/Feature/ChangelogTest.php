<?php

namespace Tests\Feature;

use App\Models\AuditLog;
use App\Models\Changelog;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class ChangelogTest extends TestCase
{
    use RefreshDatabase;

    public function test_only_authenticated_users_can_access_changelogs(): void
    {
        $this->get(route('changelogs.index'))
            ->assertRedirect(route('login'));

        $user = User::factory()->create();
        $this->actingAs($user)
            ->get(route('changelogs.index'))
            ->assertStatus(200);
    }

    public function test_regular_users_cannot_manage_changelogs(): void
    {
        $user = User::factory()->create();
        $changelog = Changelog::create([
            'version' => 'v1.0.0',
            'title' => 'Initial Release',
            'release_date' => '2026-06-01',
            'is_published' => true,
            'changes' => [['type' => 'Added', 'content' => 'First feature']],
        ]);

        // Try to Create
        $this->actingAs($user)
            ->post(route('changelogs.store'), [
                'version' => 'v2.0.0',
                'title' => 'New Release',
                'release_date' => '2026-06-05',
                'is_published' => true,
                'changes' => [['type' => 'Added', 'content' => 'Another feature']],
            ])
            ->assertForbidden();

        // Try to Update
        $this->actingAs($user)
            ->put(route('changelogs.update', $changelog->id), [
                'version' => 'v1.0.1',
                'title' => 'Updated Release',
                'release_date' => '2026-06-01',
                'is_published' => true,
                'changes' => [['type' => 'Fixed', 'content' => 'Bugfix']],
            ])
            ->assertForbidden();

        // Try to Delete
        $this->actingAs($user)
            ->delete(route('changelogs.destroy', $changelog->id))
            ->assertForbidden();
    }

    public function test_superadmins_can_create_update_and_delete_changelogs(): void
    {
        $role = Role::create(['name' => 'superadmin']);
        $superadmin = User::factory()->create();
        $superadmin->assignRole($role);

        // 1. Create
        $response = $this->actingAs($superadmin)
            ->post(route('changelogs.store'), [
                'version' => '1.0.0', // test regex and standardization auto prepending 'v'
                'title' => 'First Release',
                'release_date' => '2026-06-01',
                'is_published' => true,
                'changes' => [
                    ['type' => 'Added', 'content' => 'New dynamic timelines.'],
                    ['type' => 'Fixed', 'content' => 'Cleaned console warnings.'],
                ],
            ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('changelogs', [
            'version' => 'v1.0.0', // prepended with v
            'title' => 'First Release',
        ]);

        $changelog = Changelog::where('version', 'v1.0.0')->first();
        $this->assertNotNull($changelog);

        // Verify Audit Log was recorded
        $this->assertDatabaseHas('audit_logs', [
            'event' => 'changelog.created',
            'user_id' => $superadmin->id,
            'auditable_type' => Changelog::class,
            'auditable_id' => $changelog->id,
        ]);

        // 2. Update
        $response = $this->actingAs($superadmin)
            ->put(route('changelogs.update', $changelog->id), [
                'version' => 'v1.0.1',
                'title' => 'Updated Title',
                'release_date' => '2026-06-02',
                'is_published' => true,
                'changes' => [
                    ['type' => 'Fixed', 'content' => 'Patched validation checks.'],
                ],
            ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('changelogs', [
            'id' => $changelog->id,
            'version' => 'v1.0.1',
            'title' => 'Updated Title',
        ]);

        $this->assertDatabaseHas('audit_logs', [
            'event' => 'changelog.updated',
            'user_id' => $superadmin->id,
            'auditable_id' => $changelog->id,
        ]);

        // 3. Delete
        $response = $this->actingAs($superadmin)
            ->delete(route('changelogs.destroy', $changelog->id));

        $response->assertRedirect();
        $this->assertDatabaseMissing('changelogs', ['id' => $changelog->id]);

        $this->assertDatabaseHas('audit_logs', [
            'event' => 'changelog.deleted',
            'user_id' => $superadmin->id,
        ]);
    }

    public function test_dynamic_latest_version_retrieval(): void
    {
        $log1 = Changelog::create([
            'version' => 'v1.0.0',
            'title' => 'V1',
            'release_date' => '2026-06-01',
            'is_published' => true,
            'changes' => [['type' => 'Added', 'content' => 'First release']],
        ]);

        $this->assertEquals('v1.0.0', Changelog::latestVersion());

        $log2 = Changelog::create([
            'version' => 'v1.1.0',
            'title' => 'V1.1',
            'release_date' => '2026-06-05',
            'is_published' => true,
            'changes' => [['type' => 'Added', 'content' => 'Second release']],
        ]);

        $this->assertEquals('v1.1.0', Changelog::latestVersion());

        // Unpublished version should not be considered as the latest version
        $log3 = Changelog::create([
            'version' => 'v1.2.0',
            'title' => 'V1.2 Draft',
            'release_date' => '2026-06-10',
            'is_published' => false,
            'changes' => [['type' => 'Added', 'content' => 'Unpublished release']],
        ]);

        $this->assertEquals('v1.1.0', Changelog::latestVersion());
    }
}
