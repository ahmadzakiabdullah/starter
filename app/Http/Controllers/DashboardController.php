<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\User;
use App\Services\TelemetryService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Role;

class DashboardController extends Controller
{
    public function __construct(
        private readonly TelemetryService $telemetry,
    ) {}

    /**
     * Display the application dashboard.
     */
    public function index(Request $request): Response
    {
        $stats = $this->getAdminStats($request);
        $recentActivity = $this->getRecentActivity();
        $metrics = $this->telemetry->getMetrics();

        return Inertia::render('Dashboard', [
            'stats' => $stats,
            'recentActivity' => $recentActivity,
            'telemetry' => [
                'cpu_percent' => $metrics['cpu_percent'],
                'ram_percent' => $metrics['ram']['percent'],
                'disk_percent' => $metrics['disk']['percent'],
                'caches' => [
                    'config' => app()->configurationIsCached(),
                    'routes' => app()->routesAreCached(),
                    'debug' => config('app.debug', false),
                ],
            ],
        ]);
    }

    /**
     * Gather system wide statistics.
     */
    private function getAdminStats(Request $request): array
    {
        $backupDir = storage_path('app/backups');
        $backupsCount = 0;
        if (file_exists($backupDir)) {
            $backupsCount = count(glob($backupDir.'/*.{sql,sqlite}', GLOB_BRACE));
        }

        return [
            'total_users' => User::count(),
            'total_roles' => Role::count(),
            'total_backups' => $backupsCount,
            'unread_notifications' => $request->user()->unreadNotifications()->count(),
        ];
    }

    /**
     * Get the latest 5 audit log entries.
     */
    private function getRecentActivity(): array
    {
        return AuditLog::with('user')
            ->latest()
            ->take(5)
            ->get()
            ->map(function ($log) {
                return [
                    'id' => $log->id,
                    'event' => $log->event,
                    'description' => $log->description,
                    'actor' => $log->user ? $log->user->name : 'System',
                    'created_at' => $log->created_at->diffForHumans(),
                ];
            })
            ->toArray();
    }
}
