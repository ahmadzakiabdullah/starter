<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class AuditLogController extends Controller
{
    public function index(Request $request): Response
    {
        Gate::authorize('manage-roles');

        $query = AuditLog::query()->with('user:id,name,username');

        // Search filter
        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('description', 'like', "%{$search}%")
                  ->orWhere('event', 'like', "%{$search}%")
                  ->orWhereHas('user', function ($uq) use ($search) {
                      $uq->where('name', 'like', "%{$search}%")
                        ->orWhere('username', 'like', "%{$search}%");
                  });
            });
        }

        // Event filter
        if ($request->filled('event') && $request->input('event') !== 'all') {
            $query->where('event', $request->input('event'));
        }

        // Date from filter
        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->input('date_from'));
        }

        // Date to filter
        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->input('date_to'));
        }

        $logs = $query->latest()->paginate(25)->withQueryString()->through(fn (AuditLog $log): array => [
            'id' => $log->id,
            'event' => $log->event,
            'description' => $log->description,
            'actor' => $log->user ? [
                'name' => $log->user->name,
                'username' => $log->user->username,
            ] : null,
            'created_at' => $log->created_at->toIso8601String(),
            'old_values' => $log->old_values,
            'new_values' => $log->new_values,
            'ip_address' => $log->ip_address,
            'user_agent' => $log->user_agent,
            'auditable_type' => $log->auditable_type ? class_basename($log->auditable_type) : null,
            'auditable_id' => $log->auditable_id,
        ]);

        $events = AuditLog::query()->distinct()->orderBy('event')->pluck('event')->all();

        return Inertia::render('Admin/AuditLogs/Index', [
            'logs' => $logs,
            'events' => $events,
            'filters' => [
                'search' => $request->input('search'),
                'event' => $request->input('event'),
                'date_from' => $request->input('date_from'),
                'date_to' => $request->input('date_to'),
            ]
        ]);
    }

    public function purge(Request $request)
    {
        Gate::authorize('manage-roles');

        $request->validate([
            'days' => 'required|integer|in:30,60,90'
        ]);

        $days = (int) $request->input('days');
        $cutoffDate = now()->subDays($days);

        $deletedCount = AuditLog::query()
            ->where('created_at', '<', $cutoffDate)
            ->delete();

        AuditLog::record(
            $request->user(),
            'audit_log.purged',
            null,
            "Purged {$deletedCount} audit log records older than {$days} days.",
            [],
            ['days' => $days, 'deleted_count' => $deletedCount]
        );

        return back()->with('success', "Successfully purged {$deletedCount} old audit log records.");
    }
}
