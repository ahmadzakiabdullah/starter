<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\Announcement;
use App\Models\Setting;
use App\Models\User;
use App\Notifications\SystemSettingsUpdated;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;
use Inertia\Response;

class SystemSettingsController extends Controller
{
    public function edit(): Response
    {
        abort_unless(request()->user()->hasRole('superadmin'), 403);

        return Inertia::render('Admin/Settings/Edit', [
            'settings' => Setting::values(),
            'announcements' => Announcement::latest()->get(),
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        abort_unless($request->user()->hasRole('superadmin'), 403);

        $values = $request->validate([
            // General
            'app_name' => 'required|string|max:100',
            'app_description' => 'nullable|string|max:500',
            'default_theme' => 'required|in:system,light,dark',

            // Regional
            'timezone' => 'required|timezone',
            'date_format' => 'required|in:Y-m-d,d/m/Y,m/d/Y',
            'default_language' => 'required|in:en,ms',

            // Security
            'email_notifications' => 'required|boolean',
            'enable_registration' => 'required|boolean',
            'min_password_length' => 'required|integer|min:4|max:32',
            'session_lifetime' => 'required|integer|min:1|max:1440',

            // SMTP
            'mail_driver' => 'required|in:log,smtp',
            'mail_host' => 'nullable|required_if:mail_driver,smtp|string',
            'mail_port' => 'nullable|required_if:mail_driver,smtp|integer|min:1|max:65535',
            'mail_username' => 'nullable|string',
            'mail_password' => 'nullable|string',
            'mail_encryption' => 'required|in:none,ssl,tls',
            'mail_from_address' => 'required|email',
            'mail_from_name' => 'required|string|max:100',

            // Maintenance
            'maintenance_mode' => 'required|boolean',
            'maintenance_bypass_ip' => 'nullable|string',
            'maintenance_message' => 'required|string|max:500',

            // Branding
            'app_logo_type' => 'required|in:icon,image',
            'app_logo_icon' => 'required_if:app_logo_type,icon|string',
            'app_logo_image_url' => 'nullable|string',
            'app_favicon_url' => 'nullable|string',
            'app_logo_file' => 'nullable|file|image|max:2048',
            'app_favicon_file' => 'nullable|file|mimes:ico,png,jpg,jpeg,svg|max:1048',
        ]);

        $oldValues = Setting::values();

        // Process logo image upload
        if ($request->hasFile('app_logo_file')) {
            $path = $request->file('app_logo_file')->store('branding', 'public');
            $values['app_logo_image'] = '/storage/' . $path;
        } else {
            $values['app_logo_image'] = $request->input('app_logo_image_url') ?? ($oldValues['app_logo_image'] ?? '');
        }

        // Process favicon upload
        if ($request->hasFile('app_favicon_file')) {
            $path = $request->file('app_favicon_file')->store('branding', 'public');
            $values['app_favicon'] = '/storage/' . $path;
        } else {
            $values['app_favicon'] = $request->input('app_favicon_url') ?? ($oldValues['app_favicon'] ?? '');
        }

        // Clean up fields that do not go into the database
        unset($values['app_logo_file']);
        unset($values['app_favicon_file']);
        unset($values['app_logo_image_url']);
        unset($values['app_favicon_url']);

        Setting::setMany($values);

        AuditLog::record(
            $request->user(),
            'system.settings.updated',
            null,
            'Updated system settings.',
            $oldValues,
            $values,
        );

        User::role('superadmin')->each(function (User $user) use ($request): void {
            $user->notify(new SystemSettingsUpdated($request->user()->name));
        });

        return back()->with('success', 'System settings updated successfully.');
    }

    public function testSmtp(Request $request)
    {
        abort_unless($request->user()->hasRole('superadmin'), 403);

        $request->validate([
            'mail_driver' => 'required|in:log,smtp',
            'mail_host' => 'nullable|required_if:mail_driver,smtp|string',
            'mail_port' => 'nullable|required_if:mail_driver,smtp|integer|min:1|max:65535',
            'mail_username' => 'nullable|string',
            'mail_password' => 'nullable|string',
            'mail_encryption' => 'required|in:none,ssl,tls',
            'mail_from_address' => 'required|email',
            'mail_from_name' => 'required|string',
        ]);

        try {
            // Apply runtime configurations
            if ($request->mail_driver === 'smtp') {
                config([
                    'mail.default' => 'smtp',
                    'mail.mailers.smtp.host' => $request->mail_host,
                    'mail.mailers.smtp.port' => (int) $request->mail_port,
                    'mail.mailers.smtp.username' => $request->mail_username,
                    'mail.mailers.smtp.password' => $request->mail_password,
                    'mail.mailers.smtp.encryption' => $request->mail_encryption === 'none' ? null : $request->mail_encryption,
                    'mail.from.address' => $request->mail_from_address,
                    'mail.from.name' => $request->mail_from_name,
                ]);
            } else {
                config(['mail.default' => 'log']);
            }

            $user = $request->user();
            
            // Dispatch test email
            Mail::raw(
                "Hello {$user->name},\n\nThis is a test email sent from the " . config('app.name') . " Settings Panel to verify your mail SMTP configuration.\n\nConnection check: SUCCESSFUL!\n\nBest regards,\nYour Application System",
                function ($message) use ($user) {
                    $message->to($user->email)
                        ->subject("SMTP Connection Test Successful");
                }
            );

            return response()->json([
                'success' => true,
                'message' => "Test email dispatched successfully to {$user->email}."
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'SMTP Test Failed: ' . $e->getMessage()
            ], 500);
        }
    }

    public function clearCache(Request $request): RedirectResponse
    {
        abort_unless($request->user()->hasRole('superadmin'), 403);

        $type = $request->validate([
            'type' => 'required|in:application,route,view,config,all'
        ])['type'];

        switch ($type) {
            case 'application':
                Artisan::call('cache:clear');
                $message = 'Application cache cleared successfully.';
                break;
            case 'route':
                Artisan::call('route:clear');
                $message = 'Routes cache cleared successfully.';
                break;
            case 'view':
                Artisan::call('view:clear');
                $message = 'Compiled views cache cleared successfully.';
                break;
            case 'config':
                Artisan::call('config:clear');
                $message = 'Configuration cache cleared successfully.';
                break;
            default:
                Artisan::call('optimize:clear');
                $message = 'All system cache and optimization caches cleared.';
                break;
        }

        AuditLog::record(
            $request->user(),
            'system.cache.cleared',
            null,
            "Cleared system cache: {$type}.",
            [],
            ['type' => $type]
        );

        return back()->with('success', $message);
    }
}
