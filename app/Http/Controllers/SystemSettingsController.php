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
use Illuminate\Http\UploadedFile;
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
            $path = $this->storeBrandingFile($request->file('app_logo_file'));
            $values['app_logo_image'] = '/storage/'.$path;
        } else {
            $values['app_logo_image'] = $request->input('app_logo_image_url') ?? ($oldValues['app_logo_image'] ?? '');
        }

        // Process favicon upload
        if ($request->hasFile('app_favicon_file')) {
            $path = $this->storeBrandingFile($request->file('app_favicon_file'));
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
            $this->redactSensitive($oldValues),
            $this->redactSensitive($values),
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
            logger()->error('SMTP connection test failed', [
                'error' => $e->getMessage(),
                'user' => $request->user()?->username,
            ]);

            return response()->json([
                'success' => false,
                'message' => 'SMTP connection test failed. Check the mail configuration and try again.',
            ], 500);
        }
    }

    /**
     * Store a branding file using an extension derived from its detected
     * MIME type instead of the client-supplied filename.
     */
    private function storeBrandingFile(UploadedFile $file): string
    {
        $extensions = [
            'image/jpeg' => 'jpg',
            'image/png' => 'png',
            'image/webp' => 'webp',
            'image/gif' => 'gif',
            'image/x-icon' => 'ico',
        ];

        $detected = (new \finfo(FILEINFO_MIME_TYPE))->file((string) $file->getRealPath());
        $extension = $detected !== false ? ($extensions[$detected] ?? null) : null;

        if ($extension === null) {
            abort(422, 'Unsupported image type.');
        }

        return $file->storeAs('branding', uniqid('branding_').'.'.$extension, 'public');
    }

    /**
     * Replace sensitive settings values with placeholders before persisting
     * them to the audit log so credentials never leak through it.
     *
     * @param  array<string, mixed>  $values
     * @return array<string, mixed>
     */
    private function redactSensitive(array $values): array
    {
        foreach (['mail_password', 'mail_username'] as $key) {
            if (array_key_exists($key, $values)) {
                $values[$key] = filled($values[$key]) ? '[REDACTED]' : '';
            }
        }

        return $values;
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
