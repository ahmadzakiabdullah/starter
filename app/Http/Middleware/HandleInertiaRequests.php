<?php

namespace App\Http\Middleware;

use App\Models\Setting;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user() ? [
                    'id' => $request->user()->id,
                    'name' => $request->user()->name,
                    'username' => $request->user()->username,
                    'email' => $request->user()->email,
                    'avatar' => $request->user()->avatar,
                    'roles' => $request->user()->getRoleNames(),
                    'permissions' => $request->user()->getAllPermissions()->pluck('name'),
                ] : null,
            ],
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
            ],
            'notifications' => fn () => $request->user() ? [
                'unread_count' => $request->user()->unreadNotifications()->count(),
                'items' => $request->user()->notifications()
                    ->latest()
                    ->limit(5)
                    ->get()
                    ->map(fn ($notification): array => [
                        'id' => $notification->id,
                        'title' => $notification->data['title'] ?? 'System notification',
                        'message' => $notification->data['message'] ?? '',
                        'url' => $notification->data['url'] ?? null,
                        'read_at' => $notification->read_at?->toIso8601String(),
                        'created_at' => $notification->created_at->toIso8601String(),
                    ]),
            ] : ['unread_count' => 0, 'items' => []],
            'system' => fn () => Setting::values(),
            'app_version' => fn () => \App\Models\Changelog::latestVersion(),
            'active_announcement' => fn () => \App\Models\Announcement::active(),
        ];
    }
}
