<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Schema;

class Setting extends Model
{
    protected $fillable = ['key', 'value'];

    public static function defaults(): array
    {
        return [
            'app_name' => config('app.name'),
            'app_description' => 'A secure management portal built with Laravel, React, and Shadcn UI.',
            'timezone' => config('app.timezone'),
            'date_format' => 'Y-m-d',
            'default_theme' => 'system',
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
        ];
    }

    public static function values(): array
    {
        $values = static::defaults();

        if (! Schema::hasTable('settings')) {
            return $values;
        }

        $booleans = ['email_notifications', 'enable_registration', 'maintenance_mode'];
        $integers = ['min_password_length', 'session_lifetime'];

        foreach (static::query()->pluck('value', 'key') as $key => $value) {
            if (in_array($key, $booleans)) {
                $values[$key] = filter_var($value, FILTER_VALIDATE_BOOLEAN);
            } elseif (in_array($key, $integers)) {
                $values[$key] = (int) $value;
            } else {
                $values[$key] = $value;
            }
        }

        return $values;
    }

    public static function setMany(array $values): void
    {
        foreach ($values as $key => $value) {
            static::updateOrCreate(['key' => $key], [
                'value' => is_bool($value) ? ($value ? '1' : '0') : (string) $value,
            ]);
        }
    }
}
