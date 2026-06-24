<?php

namespace App\Http\Controllers;

use App\Models\Setting;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class NotificationController extends Controller
{
    public function __construct()
    {
        $this->middleware(function ($request, $next) {
            abort_unless(Setting::values()['module_notifications'] ?? true, 403, 'Notification module is disabled.');

            return $next($request);
        });
    }

    public function index(Request $request): Response
    {
        return Inertia::render('Notifications/Index', [
            'notifications' => $request->user()->notifications()
                ->latest()
                ->paginate(30)
                ->through(fn ($notification): array => $this->notificationData($notification)),
        ]);
    }

    public function markAsRead(Request $request, string $notification): RedirectResponse
    {
        $item = $request->user()->notifications()->findOrFail($notification);
        $item->markAsRead();

        return back();
    }

    public function markAllAsRead(Request $request): RedirectResponse
    {
        $request->user()->unreadNotifications->markAsRead();

        return back();
    }

    public function destroy(Request $request, string $notification): RedirectResponse
    {
        $item = $request->user()->notifications()->findOrFail($notification);
        $item->delete();

        return back()->with('success', 'Notification deleted.');
    }

    public function clearAll(Request $request): RedirectResponse
    {
        $request->user()->notifications()->delete();

        return back()->with('success', 'Notification history cleared.');
    }

    private function notificationData($notification): array
    {
        return [
            'id' => $notification->id,
            'title' => $notification->data['title'] ?? 'System notification',
            'message' => $notification->data['message'] ?? '',
            'url' => $notification->data['url'] ?? null,
            'read_at' => $notification->read_at?->toIso8601String(),
            'created_at' => $notification->created_at->toIso8601String(),
        ];
    }
}
