<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Setting;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class SystemSettingsTest extends TestCase
{
    use RefreshDatabase;

    public function test_only_superadmins_can_update_system_settings(): void
    {
        $superadminRole = Role::create(['name' => 'superadmin']);
        $superadmin = User::factory()->create();
        $superadmin->assignRole($superadminRole);
        $regularUser = User::factory()->create();

        $payload = [
            'app_name' => 'Operations Portal',
            'app_description' => 'A customized operations management portal.',
            'default_theme' => 'dark',
            'timezone' => 'Asia/Kuala_Lumpur',
            'date_format' => 'd/m/Y',
            'default_language' => 'ms',
            'email_notifications' => true,
            'enable_registration' => false,
            'min_password_length' => 10,
            'session_lifetime' => 240,
            'mail_driver' => 'smtp',
            'mail_host' => 'smtp.test.io',
            'mail_port' => 1025,
            'mail_username' => 'testuser',
            'mail_password' => 'secretpass',
            'mail_encryption' => 'tls',
            'mail_from_address' => 'sender@test.io',
            'mail_from_name' => 'Sender System',
            'maintenance_mode' => true,
            'maintenance_bypass_ip' => '127.0.0.1, 192.168.1.1',
            'maintenance_message' => 'Custom offline banner',
            'app_logo_type' => 'icon',
            'app_logo_icon' => 'Sparkles',
        ];

        $this->actingAs($regularUser)
            ->patch(route('settings.update'), $payload)
            ->assertForbidden();

        $this->actingAs($superadmin)
            ->patch(route('settings.update'), $payload)
            ->assertSessionHas('success');

        $this->assertDatabaseHas('settings', ['key' => 'app_name', 'value' => 'Operations Portal']);
        $this->assertDatabaseHas('settings', ['key' => 'min_password_length', 'value' => '10']);
        $this->assertDatabaseHas('settings', ['key' => 'maintenance_mode', 'value' => '1']);
        $this->assertDatabaseHas('audit_logs', ['event' => 'system.settings.updated']);
        $this->assertDatabaseCount('notifications', 1);
    }

    public function test_registration_can_be_disabled_via_settings(): void
    {
        $role = Role::create(['name' => 'user']);

        // 1. Initially registration is enabled by default
        $this->get(route('register'))->assertStatus(200);

        // 2. Set registration to false
        Setting::setMany(['enable_registration' => false]);

        // 3. Register page should now return 404
        $this->get(route('register'))->assertStatus(404);

        // 4. Register post request should also return 404
        $this->post(route('register'), [
            'name' => 'John Doe',
            'username' => 'johndoe',
            'email' => 'john@example.com',
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!',
        ])->assertStatus(404);
    }

    public function test_smtp_connection_test_endpoint(): void
    {
        $superadminRole = Role::create(['name' => 'superadmin']);
        $superadmin = User::factory()->create();
        $superadmin->assignRole($superadminRole);
        $regularUser = User::factory()->create();

        $payload = [
            'mail_driver' => 'log',
            'mail_encryption' => 'none',
            'mail_from_address' => 'system@laravel.test',
            'mail_from_name' => 'Test mailer',
        ];

        $this->actingAs($regularUser)
            ->postJson(route('settings.test-smtp'), $payload)
            ->assertForbidden();

        $this->actingAs($superadmin)
            ->postJson(route('settings.test-smtp'), $payload)
            ->assertJson(['success' => true]);
    }

    public function test_cache_clearing_endpoints(): void
    {
        $superadminRole = Role::create(['name' => 'superadmin']);
        $superadmin = User::factory()->create();
        $superadmin->assignRole($superadminRole);
        $regularUser = User::factory()->create();

        $this->actingAs($regularUser)
            ->post(route('settings.clear-cache'), ['type' => 'all'])
            ->assertForbidden();

        $this->actingAs($superadmin)
            ->post(route('settings.clear-cache'), ['type' => 'application'])
            ->assertRedirect()
            ->assertSessionHas('success');
    }
}
