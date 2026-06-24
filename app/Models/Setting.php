<?php

namespace App\Models;

use Illuminate\Contracts\Encryption\DecryptException;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Schema;

class Setting extends Model
{
    protected $fillable = ['key', 'value'];

    /**
     * Cache key for system settings.
     */
    private static string $cacheKey = 'system.settings';

    /**
     * Settings keys that contain sensitive data and must be encrypted at rest.
     */
    private static array $encrypted = ['mail_password', 'mail_username'];

    public static function defaults(): array
    {
        return [
            'app_name' => config('app.name'),
            'app_description' => 'A secure management portal built with Laravel, React, and Shadcn UI.',
            'timezone' => config('app.timezone'),
            'date_format' => 'Y-m-d',
            'default_theme' => 'system',
            'system_font' => 'inter',
            'default_language' => 'en',
            'email_notifications' => true,
            'enable_registration' => true,
            'min_password_length' => 8,
            'session_lifetime' => 120,
            'mail_driver' => 'log',
            'mail_host' => 'smtp.mailtrap.io',
            'mail_port' => '2525',
            'mail_username' => '',
            'mail_password' => '',
            'mail_encryption' => 'tls',
            'mail_from_address' => 'noreply@laravel.test',
            'mail_from_name' => 'Laravel Portal',
            'maintenance_mode' => false,
            'maintenance_bypass_ip' => '',
            'maintenance_message' => 'Our site is currently undergoing maintenance. We will be back online shortly!',
            'app_logo_type' => 'icon',
            'app_logo_icon' => 'Sparkles',
            'app_logo_image' => '',
            'app_favicon' => '',
            'module_notifications' => true,
            'module_active_sessions' => true,
            'module_theme_presets' => true,
            'module_announcements' => true,
            'module_telemetry' => true,
            'module_api_keys' => true,
        ];
    }

    /**
     * Get all settings values with caching (60 second TTL).
     * Called on every request by middleware — cache prevents repeated DB queries.
     */
    public static function values(): array
    {
        if (! Schema::hasTable('settings')) {
            return static::defaults();
        }

        return Cache::remember(static::$cacheKey, 60, function () {
            $values = static::defaults();

            $booleans = [
                'email_notifications', 'enable_registration', 'maintenance_mode',
                'module_notifications', 'module_active_sessions', 'module_theme_presets',
                'module_announcements', 'module_telemetry', 'module_api_keys',
            ];
            $integers = ['min_password_length', 'session_lifetime'];

            foreach (static::query()->pluck('value', 'key') as $key => $value) {
                if (in_array($key, $booleans)) {
                    $values[$key] = filter_var($value, FILTER_VALIDATE_BOOLEAN);
                } elseif (in_array($key, $integers)) {
                    $values[$key] = (int) $value;
                } elseif (in_array($key, static::$encrypted)) {
                    $values[$key] = static::decryptValue($value);
                } else {
                    $values[$key] = $value;
                }
            }

            return $values;
        });
    }

    /**
     * Persist settings and bust the cache so the next request picks up changes.
     * Sensitive fields are encrypted before storage.
     */
    public static function setMany(array $values): void
    {
        foreach ($values as $key => $value) {
            $storeValue = is_bool($value) ? ($value ? '1' : '0') : (string) $value;

            // Encrypt sensitive fields before persisting
            if (in_array($key, static::$encrypted) && $storeValue !== '') {
                $storeValue = Crypt::encryptString($storeValue);
            }

            static::updateOrCreate(['key' => $key], [
                'value' => $storeValue,
            ]);
        }

        Cache::forget(static::$cacheKey);
    }

    /**
     * Safely decrypt a value. Falls back to raw value if decryption fails
     * (e.g. legacy plaintext data from before encryption was added).
     */
    private static function decryptValue(string $value): string
    {
        if ($value === '') {
            return '';
        }

        try {
            return Crypt::decryptString($value);
        } catch (DecryptException) {
            // Gracefully handle legacy plaintext values
            return $value;
        }
    }
}
