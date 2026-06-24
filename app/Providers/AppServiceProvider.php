<?php

namespace App\Providers;

use App\Models\Announcement;
use App\Models\AuditLog;
use App\Models\Changelog;
use App\Models\Media;
use App\Models\Setting;
use App\Models\User;
use App\Policies\AnnouncementPolicy;
use App\Policies\ChangelogPolicy;
use App\Policies\MediaPolicy;
use App\Policies\RolePolicy;
use App\Policies\SettingsPolicy;
use App\Policies\UserPolicy;
use Illuminate\Auth\Events\Login;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;
use Spatie\Permission\Models\Role;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->removeStaleViteHotFile();

        Vite::prefetch(concurrency: 3);

        // Implicitly grant "superadmin" role all permissions
        Gate::before(function ($user, $ability) {
            return $user->hasRole('superadmin') ? true : null;
        });

        Gate::policy(User::class, UserPolicy::class);
        Gate::policy(Role::class, RolePolicy::class);
        Gate::policy(Media::class, MediaPolicy::class);
        Gate::policy(Announcement::class, AnnouncementPolicy::class);
        Gate::policy(Changelog::class, ChangelogPolicy::class);
        Gate::policy(Setting::class, SettingsPolicy::class);

        Gate::define('manage-users', fn (User $user): bool => $user->can('viewAny', User::class));
        Gate::define('manage-roles', fn (User $user): bool => $user->can('viewAny', Role::class));
        Gate::define('manage-system', fn (User $user): bool => $user->can('viewAny', Setting::class));
        Gate::define('manage-announcements', fn (User $user): bool => $user->can('viewAny', Announcement::class));
        Gate::define('manage-changelog', fn (User $user): bool => $user->can('viewAny', Changelog::class));
        Gate::define('manage-media', fn (User $user): bool => $user->can('viewAny', Media::class));

        Event::listen(Login::class, function (Login $event): void {
            AuditLog::record($event->user, 'auth.login', $event->user, 'User signed in.');
        });

        // Load dynamic settings
        if (Schema::hasTable('settings')) {
            try {
                $settings = Setting::values();

                // 1. Dynamic password validation defaults
                $minLength = $settings['min_password_length'] ?? 8;
                Password::defaults(function () use ($minLength) {
                    return Password::min($minLength);
                });

                // 2. Dynamic session timeout
                config(['session.lifetime' => (int) ($settings['session_lifetime'] ?? 120)]);

                // 3. Dynamic mailer overrides
                if (($settings['mail_driver'] ?? 'log') === 'smtp') {
                    config([
                        'mail.default' => 'smtp',
                        'mail.mailers.smtp.host' => $settings['mail_host'] ?? '',
                        'mail.mailers.smtp.port' => (int) ($settings['mail_port'] ?? 587),
                        'mail.mailers.smtp.username' => $settings['mail_username'] ?? '',
                        'mail.mailers.smtp.password' => $settings['mail_password'] ?? '',
                        'mail.mailers.smtp.encryption' => $settings['mail_encryption'] ?? 'tls',
                        'mail.from.address' => $settings['mail_from_address'] ?? 'noreply@laravel.test',
                        'mail.from.name' => $settings['mail_from_name'] ?? 'Laravel Application',
                    ]);
                } else {
                    config(['mail.default' => 'log']);
                }
            } catch (\Exception $e) {
                // Prevent boot locking during migrations or local setups
            }
        }
    }

    /**
     * Remove Vite's hot-file marker when its development server is no longer
     * reachable, such as after Windows shuts down while `npm run dev` is open.
     */
    private function removeStaleViteHotFile(): void
    {
        if (! app()->environment('local')) {
            return;
        }

        $hotFile = public_path('hot');

        if (! is_file($hotFile)) {
            return;
        }

        $url = trim((string) file_get_contents($hotFile));
        $parts = parse_url($url);
        $host = isset($parts['host']) ? trim($parts['host'], '[]') : null;

        if ($host === null || $host === '') {
            @unlink($hotFile);

            return;
        }

        $port = (int) ($parts['port'] ?? (($parts['scheme'] ?? 'http') === 'https' ? 443 : 80));
        $address = filter_var($host, FILTER_VALIDATE_IP, FILTER_FLAG_IPV6)
            ? "tcp://[{$host}]:{$port}"
            : "tcp://{$host}:{$port}";
        $connection = @stream_socket_client($address, $errorNumber, $errorMessage, 0.2);

        if (is_resource($connection)) {
            fclose($connection);

            return;
        }

        @unlink($hotFile);
    }
}
