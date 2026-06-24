<?php

namespace Tests\Feature;

use App\Models\Announcement;
use App\Models\AuditLog;
use App\Models\Changelog;
use App\Models\Media;
use App\Models\Setting;
use App\Models\User;
use App\Services\AuditService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Tests\TestCase;

class ModelBehaviorTest extends TestCase
{
    use RefreshDatabase;

    public function test_settings_cast_values_encrypt_sensitive_data_and_bust_cache(): void
    {
        Setting::setMany([
            'enable_registration' => false,
            'session_lifetime' => 240,
            'mail_username' => 'mailer',
            'mail_password' => 'secret',
        ]);

        $values = Setting::values();

        $this->assertFalse($values['enable_registration']);
        $this->assertSame(240, $values['session_lifetime']);
        $this->assertSame('mailer', $values['mail_username']);
        $this->assertSame('secret', $values['mail_password']);
        $this->assertDatabaseMissing('settings', ['key' => 'mail_password', 'value' => 'secret']);
    }

    public function test_active_announcement_respects_schedule_and_active_state(): void
    {
        Announcement::factory()->create(['title' => 'Expired', 'ends_at' => now()->subMinute()]);
        Announcement::factory()->create(['title' => 'Draft', 'is_active' => false]);
        $active = Announcement::factory()->create(['title' => 'Visible']);

        $this->assertTrue(Announcement::active()->is($active));
    }

    public function test_audit_service_records_actor_subject_and_values(): void
    {
        $actor = User::factory()->create();
        $subject = Changelog::factory()->create();

        app(AuditService::class)->record($actor, 'changelog.updated', $subject, 'Updated changelog.', ['title' => 'Old'], ['title' => 'New']);

        $log = AuditLog::firstOrFail();
        $this->assertSame($actor->id, $log->user_id);
        $this->assertSame(Changelog::class, $log->auditable_type);
        $this->assertSame(['title' => 'New'], $log->new_values);
    }

    public function test_media_formats_file_size(): void
    {
        $media = Media::factory()->make(['size' => 1_536]);

        $this->assertSame('1.5 KB', $media->formatted_size);
    }

    public function test_changelog_latest_version_ignores_unpublished_entries(): void
    {
        Changelog::factory()->create(['version' => 'v1.0.0', 'release_date' => '2026-01-01']);
        Changelog::factory()->create(['version' => 'v2.0.0', 'release_date' => '2026-02-01', 'is_published' => false]);
        Changelog::factory()->create(['version' => 'v1.1.0', 'release_date' => '2026-03-01']);
        Cache::forget('changelog.latest_version');

        $this->assertSame('v1.1.0', Changelog::latestVersion());
    }
}
