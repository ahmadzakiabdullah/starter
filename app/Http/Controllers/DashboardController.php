<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\Setting;
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
        $isStaff = $request->user()->hasAnyRole(['superadmin', 'admin', 'manager']);
        $moduleTelemetry = Setting::values()['module_telemetry'] ?? true;

        $stats = [
            'total_users' => $isStaff ? User::count() : null,
            'total_roles' => $isStaff ? Role::count() : null,
            'total_backups' => $isStaff ? $this->countBackups() : null,
            'unread_notifications' => $request->user()->unreadNotifications()->count(),
        ];

        $recentActivity = $isStaff ? $this->getRecentActivity() : [];

        $telemetry = ['cpu_percent' => null, 'ram_percent' => null, 'disk_percent' => null, 'caches' => ['config' => false, 'routes' => false, 'debug' => false]];

        if ($isStaff && $moduleTelemetry) {
            $metrics = $this->telemetry->getMetrics();
            $telemetry = [
                'cpu_percent' => $metrics['cpu_percent'],
                'ram_percent' => $metrics['ram']['percent'],
                'disk_percent' => $metrics['disk']['percent'],
                'caches' => [
                    'config' => app()->configurationIsCached(),
                    'routes' => app()->routesAreCached(),
                    'debug' => config('app.debug', false),
                ],
            ];
        }

        return Inertia::render('Dashboard', [
            'stats' => $stats,
            'recentActivity' => $recentActivity,
            'telemetry' => $telemetry,
        ]);
    }

    /**
     * Count the backup archives on disk.
     */
    private function countBackups(): int
    {
        $backupDir = storage_path('app/backups');

        if (! file_exists($backupDir)) {
            return 0;
        }

        return count(glob($backupDir.'/*.{sql,sqlite}', GLOB_BRACE));
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
