<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use PragmaRX\Google2FA\Google2FA;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class SystemSecurityTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        // Create superadmin role required by routes
        if (!Role::where('name', 'superadmin')->exists()) {
            Role::create(['name' => 'superadmin']);
        }
    }

    private function createSuperadmin(): User
    {
        $user = User::factory()->create([
            'password' => Hash::make('password'),
        ]);
        $user->assignRole('superadmin');
        return $user;
    }

    private function createRegularUser(): User
    {
        return User::factory()->create([
            'password' => Hash::make('password'),
        ]);
    }

    /**
     * Test Authorization Gates for System Diagnostics modules.
     */
    public function test_non_superadmin_users_cannot_access_diagnostics(): void
    {
        $regularUser = $this->createRegularUser();

        $this->actingAs($regularUser)->get(route('health.index'))->assertForbidden();
        $this->actingAs($regularUser)->get(route('backups.index'))->assertForbidden();
        $this->actingAs($regularUser)->post(route('backups.create'))->assertForbidden();
        $this->actingAs($regularUser)->get(route('logs.index'))->assertForbidden();
    }

    /**
     * Test Server Health Monitor page load.
     */
    public function test_superadmin_can_access_health_monitor(): void
    {
        $admin = $this->createSuperadmin();

        $response = $this->actingAs($admin)
            ->get(route('health.index'))
            ->assertStatus(200);

        $response->assertInertia(fn ($page) => $page
            ->component('Admin/Health/Index')
            ->has('systemStats')
            ->has('laravelStats')
            ->has('dbStats')
        );
    }

    /**
     * Test Database Backup Manager: Index, Create, and Delete.
     */
    public function test_database_backup_flow(): void
    {
        $admin = $this->createSuperadmin();

        // 1. View Index
        $response = $this->actingAs($admin)
            ->get(route('backups.index'))
            ->assertStatus(200);

        $response->assertInertia(fn ($page) => $page
            ->component('Admin/Backups/Index')
            ->has('backups')
        );

        // 2. Trigger backup on in-memory SQLite (expect failure redirect)
        $this->actingAs($admin)
            ->post(route('backups.create'))
            ->assertRedirect()
            ->assertSessionHas('error');

        // 3. Manually create a dummy backup file to test index, download, and delete
        $backupDir = storage_path('app/backups');
        if (!file_exists($backupDir)) {
            mkdir($backupDir, 0755, true);
        }

        $backupFilename = 'backup_test_file.sql';
        $backupFilepath = $backupDir . '/' . $backupFilename;
        file_put_contents($backupFilepath, '-- Dummy SQL Backup content');

        try {
            // Verify it shows up in index list
            $response = $this->actingAs($admin)
                ->get(route('backups.index'))
                ->assertStatus(200);

            $backups = $response->viewData('page')['props']['backups'];
            $this->assertNotEmpty($backups);
            $this->assertEquals($backupFilename, $backups[0]['filename']);

            // Assert download works
            $this->actingAs($admin)
                ->get(route('backups.download', $backupFilename))
                ->assertStatus(200);

            // Assert delete works
            $this->actingAs($admin)
                ->delete(route('backups.destroy', $backupFilename))
                ->assertRedirect()
                ->assertSessionHas('success');

            $this->assertFileDoesNotExist($backupFilepath);
        } finally {
            if (file_exists($backupFilepath)) {
                unlink($backupFilepath);
            }
        }
    }

    /**
     * Test Laravel Log Reader.
     */
    public function test_log_reader_flow(): void
    {
        $admin = $this->createSuperadmin();

        // 1. Create a dummy log entry
        $logPath = storage_path('logs/laravel.log');
        $originalLogContent = file_exists($logPath) ? file_get_contents($logPath) : '';

        $dummyLog = "[2026-06-21 12:00:00] local.ERROR: This is a test error message. {\"exception\":\"[object] (Exception(code: 0))\"}\n[stacktrace]\n#0 {main}\n";
        file_put_contents($logPath, $dummyLog);

        try {
            // 2. View Log Reader
            $response = $this->actingAs($admin)
                ->get(route('logs.index'))
                ->assertStatus(200);

            $response->assertInertia(fn ($page) => $page
                ->component('Admin/Logs/Index')
                ->has('logs')
                ->has('logSize')
            );

            $pageLogs = $response->viewData('page')['props']['logs'];
            $this->assertNotEmpty($pageLogs);
            $this->assertEquals('ERROR', $pageLogs[0]['level']);
            $this->assertEquals('This is a test error message. {"exception":"[object] (Exception(code: 0))"}', $pageLogs[0]['message']);
            $this->assertStringContainsString('#0 {main}', $pageLogs[0]['stack']);

            // 3. Clear logs
            $this->actingAs($admin)
                ->delete(route('logs.destroy'))
                ->assertRedirect()
                ->assertSessionHas('success');

            $this->assertEquals('', file_get_contents($logPath));

        } finally {
            // Restore original log file
            if ($originalLogContent !== '') {
                file_put_contents($logPath, $originalLogContent);
            } else {
                if (file_exists($logPath)) {
                    unlink($logPath);
                }
            }
        }
    }

    /**
     * Test 2FA Settings Setup Flow.
     */
    public function test_enable_confirm_disable_two_factor(): void
    {
        $user = $this->createRegularUser();

        // 1. Enable 2FA (Generates secret and QR URL and stores them in session)
        $response = $this->actingAs($user)
            ->post(route('profile.two-factor.enable'))
            ->assertRedirect();

        $session = session();
        $this->assertTrue($session->has('two_factor_secret'));
        $this->assertTrue($session->has('two_factor_qr'));

        $secret = $session->get('two_factor_secret');

        // 2. Submit wrong OTP code (expect validation error)
        $this->actingAs($user)
            ->post(route('profile.two-factor.confirm'), ['code' => '000000'])
            ->assertRedirect()
            ->assertSessionHasErrors('code');

        $user->refresh();
        $this->assertNull($user->two_factor_secret);

        // 3. Submit valid OTP code
        $google2fa = new Google2FA();
        $validCode = $google2fa->getCurrentOtp($secret);

        $this->actingAs($user)
            ->post(route('profile.two-factor.confirm'), ['code' => $validCode])
            ->assertRedirect()
            ->assertSessionHas('success');

        $user->refresh();
        $this->assertEquals($secret, $user->two_factor_secret);

        // 4. Disable 2FA with incorrect password
        $this->actingAs($user)
            ->post(route('profile.two-factor.disable'), ['password' => 'wrong-password'])
            ->assertRedirect()
            ->assertSessionHasErrors('password');

        $user->refresh();
        $this->assertNotNull($user->two_factor_secret);

        // 5. Disable 2FA with correct password
        $this->actingAs($user)
            ->post(route('profile.two-factor.disable'), ['password' => 'password'])
            ->assertRedirect()
            ->assertSessionHas('success');

        $user->refresh();
        $this->assertNull($user->two_factor_secret);
    }

    /**
     * Test Login flow with 2FA enabled.
     */
    public function test_login_intercept_and_two_factor_challenge(): void
    {
        $google2fa = new Google2FA();
        $secret = $google2fa->generateSecretKey();

        // Create user with 2FA enabled
        $user = User::factory()->create([
            'email' => '2fa-user@example.com',
            'password' => Hash::make('password'),
            'two_factor_secret' => $secret,
        ]);

        // 1. Submit login credentials (should redirect to 2FA challenge instead of completing login)
        $response = $this->post(route('login'), [
            'email' => '2fa-user@example.com',
            'password' => 'password',
        ]);

        $response->assertRedirect(route('two-factor.login'));
        $this->assertFalse(auth()->check());
        $this->assertEquals($user->id, session('login.id'));

        // 2. Access 2FA challenge page
        $this->get(route('two-factor.login'))
            ->assertStatus(200)
            ->assertInertia(fn ($page) => $page->component('Auth/TwoFactorChallenge'));

        // 3. Submit wrong OTP code
        $this->post(route('two-factor.login'), ['code' => '000000'])
            ->assertSessionHasErrors('code');
        $this->assertFalse(auth()->check());

        // 4. Submit correct OTP code
        $validCode = $google2fa->getCurrentOtp($secret);

        $this->post(route('two-factor.login'), ['code' => $validCode])
            ->assertRedirect(route('dashboard'));

        $this->assertTrue(auth()->check());
        $this->assertEquals($user->id, auth()->id());
    }

    /**
     * Test session revocation of other devices with wrong password.
     */
    public function test_logout_other_devices_with_wrong_password(): void
    {
        $user = $this->createRegularUser();

        $activeSessionId = null;

        // Register DB query listener to capture session ID and seed database
        DB::listen(function ($query) use ($user, &$activeSessionId) {
            if ($activeSessionId === null && request()->hasSession()) {
                $activeSessionId = request()->session()->getId();
                DB::table('sessions')->updateOrInsert(
                    ['id' => $activeSessionId],
                    [
                        'user_id' => $user->id,
                        'ip_address' => '127.0.0.1',
                        'user_agent' => 'Chrome/Windows',
                        'payload' => 'payload1',
                        'last_activity' => time(),
                    ]
                );
            }
        });

        // Populate sessions table with other sessions
        DB::table('sessions')->insert([
            [
                'id' => 'other-session-id-1',
                'user_id' => $user->id,
                'ip_address' => '192.168.1.5',
                'user_agent' => 'Safari/iOS',
                'payload' => 'payload2',
                'last_activity' => time() - 3600,
            ],
            [
                'id' => 'other-session-id-2',
                'user_id' => $user->id,
                'ip_address' => '10.0.0.8',
                'user_agent' => 'Firefox/Linux',
                'payload' => 'payload3',
                'last_activity' => time() - 7200,
            ]
        ]);

        // Submit request to revoke other sessions with wrong password
        $this->actingAs($user)
            ->post(route('profile.sessions.logout'), ['password' => 'wrong-password'])
            ->assertRedirect()
            ->assertSessionHasErrors('password');

        // Since it failed, all sessions (including the active one created by DB::listen) should remain (total 3)
        $this->assertEquals(3, DB::table('sessions')->where('user_id', $user->id)->count());
    }

    /**
     * Test session revocation of other devices successfully.
     */
    public function test_logout_other_devices_successfully(): void
    {
        $user = $this->createRegularUser();

        $activeSessionId = null;

        // Register DB query listener to capture session ID and seed database
        DB::listen(function ($query) use ($user, &$activeSessionId) {
            if ($activeSessionId === null && request()->hasSession()) {
                $activeSessionId = request()->session()->getId();
                DB::table('sessions')->updateOrInsert(
                    ['id' => $activeSessionId],
                    [
                        'user_id' => $user->id,
                        'ip_address' => '127.0.0.1',
                        'user_agent' => 'Chrome/Windows',
                        'payload' => 'payload1',
                        'last_activity' => time(),
                    ]
                );
            }
        });

        // Populate sessions table with other sessions
        DB::table('sessions')->insert([
            [
                'id' => 'other-session-id-1',
                'user_id' => $user->id,
                'ip_address' => '192.168.1.5',
                'user_agent' => 'Safari/iOS',
                'payload' => 'payload2',
                'last_activity' => time() - 3600,
            ],
            [
                'id' => 'other-session-id-2',
                'user_id' => $user->id,
                'ip_address' => '10.0.0.8',
                'user_agent' => 'Firefox/Linux',
                'payload' => 'payload3',
                'last_activity' => time() - 7200,
            ]
        ]);

        // Submit request with correct password
        $this->actingAs($user)
            ->post(route('profile.sessions.logout'), ['password' => 'password'])
            ->assertRedirect()
            ->assertSessionHas('success');

        // Only the active session should remain (total 1)
        $this->assertEquals(1, DB::table('sessions')->where('user_id', $user->id)->count());
        $this->assertNotNull($activeSessionId);
        $this->assertDatabaseHas('sessions', [
            'id' => $activeSessionId,
            'user_id' => $user->id,
        ]);
        $this->assertDatabaseMissing('sessions', [
            'id' => 'other-session-id-1',
        ]);
    }
}
