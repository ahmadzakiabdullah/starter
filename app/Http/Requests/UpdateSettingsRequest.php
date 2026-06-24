<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateSettingsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('manage-system') ?? false;
    }

    public function rules(): array
    {
        return [
            'app_name' => ['required', 'string', 'max:100'],
            'app_description' => ['nullable', 'string', 'max:500'],
            'default_theme' => ['required', 'in:system,light,dark'],
            'system_font' => ['required', 'in:inter,geist,roboto,poppins,montserrat,pt-sans,overpass-mono'],
            'timezone' => ['required', 'timezone'],
            'date_format' => ['required', 'in:Y-m-d,d/m/Y,m/d/Y'],
            'default_language' => ['required', 'in:en,ms'],
            'email_notifications' => ['required', 'boolean'],
            'enable_registration' => ['required', 'boolean'],
            'min_password_length' => ['required', 'integer', 'min:4', 'max:32'],
            'session_lifetime' => ['required', 'integer', 'min:1', 'max:1440'],
            'module_notifications' => ['required', 'boolean'],
            'module_active_sessions' => ['required', 'boolean'],
            'module_theme_presets' => ['required', 'boolean'],
            'module_announcements' => ['required', 'boolean'],
            'module_telemetry' => ['required', 'boolean'],
            'module_api_keys' => ['required', 'boolean'],
            'mail_driver' => ['required', 'in:log,smtp'],
            'mail_host' => ['nullable', 'required_if:mail_driver,smtp', 'string'],
            'mail_port' => ['nullable', 'required_if:mail_driver,smtp', 'integer', 'min:1', 'max:65535'],
            'mail_username' => ['nullable', 'string'],
            'mail_password' => ['nullable', 'string'],
            'mail_encryption' => ['required', 'in:none,ssl,tls'],
            'mail_from_address' => ['required', 'email'],
            'mail_from_name' => ['required', 'string', 'max:100'],
            'maintenance_mode' => ['required', 'boolean'],
            'maintenance_bypass_ip' => ['nullable', 'string'],
            'maintenance_message' => ['required', 'string', 'max:500'],
            'app_logo_type' => ['required', 'in:icon,image'],
            'app_logo_icon' => ['required_if:app_logo_type,icon', 'string'],
            'app_logo_image_url' => ['nullable', 'string'],
            'app_favicon_url' => ['nullable', 'string'],
            'app_logo_file' => ['nullable', 'file', 'image', 'max:2048'],
            'app_favicon_file' => ['nullable', 'file', 'mimes:ico,png,jpg,jpeg,svg', 'max:1048'],
        ];
    }
}
