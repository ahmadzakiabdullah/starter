<?php

namespace App\Http\Controllers;

use App\Http\Requests\TestSmtpRequest;
use App\Http\Requests\UpdateSettingsRequest;
use App\Models\Announcement;
use App\Models\AuditLog;
use App\Models\Setting;
use App\Models\User;
use App\Notifications\SystemSettingsUpdated;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;
use Inertia\Response;

class SystemSettingsController extends Controller
{
    public function edit(): Response
    {
        Gate::authorize('manage-system');

        return Inertia::render('Admin/Settings/Edit', [
            'settings' => Setting::values(),
            'announcements' => Announcement::latest()->get(),
        ]);
    }

    public function update(UpdateSettingsRequest $request): RedirectResponse
    {
        Gate::authorize('manage-system');

        $values = $request->validated();

        $oldValues = Setting::values();

        // Process logo image upload
        if ($request->hasFile('app_logo_file')) {
            $path = $request->file('app_logo_file')->store('branding', 'public');
            $values['app_logo_image'] = '/storage/'.$path;
        } else {
            $values['app_logo_image'] = $request->input('app_logo_image_url') ?? ($oldValues['app_logo_image'] ?? '');
        }

        // Process favicon upload
        if ($request->hasFile('app_favicon_file')) {
            $path = $request->file('app_favicon_file')->store('branding', 'public');
            $values['app_favicon'] = '/storage/'.$path;
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

    public function testSmtp(TestSmtpRequest $request)
    {
        Gate::authorize('manage-system');

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
                "Hello {$user->name},\n\nThis is a test email sent from the ".config('app.name')." Settings Panel to verify your mail SMTP configuration.\n\nConnection check: SUCCESSFUL!\n\nBest regards,\nYour Application System",
                function ($message) use ($user) {
                    $message->to($user->email)
                        ->subject('SMTP Connection Test Successful');
                }
            );

            return response()->json([
                'success' => true,
                'message' => "Test email dispatched successfully to {$user->email}.",
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'SMTP Test Failed: '.$e->getMessage(),
            ], 500);
        }
    }

    public function clearCache(Request $request): RedirectResponse
    {
        Gate::authorize('manage-system');

        $type = $request->validate([
            'type' => 'required|in:application,route,view,config,all',
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
