<?php

namespace App\Providers;

use App\Models\AuditLog;
use Illuminate\Auth\Events\Login;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;

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
        Vite::prefetch(concurrency: 3);

        // Implicitly grant "superadmin" role all permissions
        Gate::before(function ($user, $ability) {
            return $user->hasRole('superadmin') ? true : null;
        });

        Event::listen(Login::class, function (Login $event): void {
            AuditLog::record($event->user, 'auth.login', $event->user, 'User signed in.');
        });

        // Load dynamic settings
        if (\Illuminate\Support\Facades\Schema::hasTable('settings')) {
            try {
                $settings = \App\Models\Setting::values();

                // 1. Dynamic password validation defaults
                $minLength = $settings['min_password_length'] ?? 8;
                \Illuminate\Validation\Rules\Password::defaults(function () use ($minLength) {
                    return \Illuminate\Validation\Rules\Password::min($minLength);
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
}
