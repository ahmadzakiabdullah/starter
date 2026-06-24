<?php

use App\Http\Controllers\AnnouncementController;
use App\Http\Controllers\ApiTokenController;
use App\Http\Controllers\AuditLogController;
use App\Http\Controllers\Auth\TwoFactorChallengeController;
use App\Http\Controllers\BackupController;
use App\Http\Controllers\ChangelogController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\HealthMonitorController;
use App\Http\Controllers\LogReaderController;
use App\Http\Controllers\MediaController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\SessionController;
use App\Http\Controllers\SystemSettingsController;
use App\Http\Controllers\UserController;
use App\Models\Setting;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register') && (Setting::values()['enable_registration'] ?? true),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/dashboard', [DashboardController::class, 'index'])->middleware(['auth', 'verified'])->name('dashboard');

Route::get('two-factor-challenge', [TwoFactorChallengeController::class, 'create'])->name('two-factor.login');
Route::post('two-factor-challenge', [TwoFactorChallengeController::class, 'store']);

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    Route::post('/profile/two-factor', [ProfileController::class, 'enableTwoFactor'])->name('profile.two-factor.enable');
    Route::post('/profile/two-factor/confirm', [ProfileController::class, 'confirmTwoFactor'])->name('profile.two-factor.confirm');
    Route::post('/profile/two-factor/disable', [ProfileController::class, 'disableTwoFactor'])->name('profile.two-factor.disable');
    Route::post('/profile/sessions/logout', [ProfileController::class, 'logoutOtherDevices'])->name('profile.sessions.logout');
    Route::get('/profile/sessions', [SessionController::class, 'getActiveSessions'])->name('profile.sessions.index');
    Route::delete('/profile/sessions/{id}', [SessionController::class, 'revokeSession'])->name('profile.sessions.destroy');
    Route::delete('/profile/sessions', [SessionController::class, 'revokeOtherSessions'])->name('profile.sessions.destroy-other');
    Route::get('/profile/api-tokens', [ApiTokenController::class, 'index'])->name('profile.api-tokens.index');
    Route::post('/profile/api-tokens', [ApiTokenController::class, 'store'])->name('profile.api-tokens.store');
    Route::delete('/profile/api-tokens/{id}', [ApiTokenController::class, 'destroy'])->name('profile.api-tokens.destroy');

    // Admin CRUD routes
    Route::post('dashboard/users/bulk-destroy', [UserController::class, 'bulkDestroy'])->name('users.bulk-destroy');
    Route::patch('dashboard/users/{user}/toggle-verification', [UserController::class, 'toggleVerification'])->name('users.toggle-verification');
    Route::resource('dashboard/users', UserController::class)->names('users');
    Route::resource('dashboard/roles', RoleController::class)->names('roles');
    Route::post('dashboard/permissions', [RoleController::class, 'storePermission'])->name('permissions.store');
    Route::delete('dashboard/permissions/{permission}', [RoleController::class, 'destroyPermission'])->name('permissions.destroy');
    Route::get('dashboard/audit-logs', [AuditLogController::class, 'index'])->name('audit-logs.index');
    Route::post('dashboard/audit-logs/purge', [AuditLogController::class, 'purge'])->name('audit-logs.purge');
    Route::get('dashboard/settings', [SystemSettingsController::class, 'edit'])->name('settings.edit');
    Route::patch('dashboard/settings', [SystemSettingsController::class, 'update'])->name('settings.update');
    Route::post('dashboard/settings/test-smtp', [SystemSettingsController::class, 'testSmtp'])->name('settings.test-smtp');
    Route::post('dashboard/settings/clear-cache', [SystemSettingsController::class, 'clearCache'])->name('settings.clear-cache');

    // Announcement admin management routes
    Route::post('dashboard/announcements', [AnnouncementController::class, 'store'])->name('announcements.store');
    Route::patch('dashboard/announcements/{announcement}', [AnnouncementController::class, 'update'])->name('announcements.update');
    Route::patch('dashboard/announcements/{announcement}/toggle', [AnnouncementController::class, 'toggle'])->name('announcements.toggle');
    Route::delete('dashboard/announcements/{announcement}', [AnnouncementController::class, 'destroy'])->name('announcements.destroy');
    Route::get('dashboard/notifications', [NotificationController::class, 'index'])->name('notifications.index');
    Route::patch('dashboard/notifications/read-all', [NotificationController::class, 'markAllAsRead'])->name('notifications.read-all');
    Route::patch('dashboard/notifications/{notification}/read', [NotificationController::class, 'markAsRead'])->name('notifications.read');
    Route::delete('dashboard/notifications/clear-all', [NotificationController::class, 'clearAll'])->name('notifications.clear-all');
    Route::delete('dashboard/notifications/{notification}', [NotificationController::class, 'destroy'])->name('notifications.destroy');

    // Changelogs / Versioning Timeline
    Route::get('dashboard/changelogs', [ChangelogController::class, 'index'])->name('changelogs.index');
    Route::post('dashboard/changelogs', [ChangelogController::class, 'store'])->name('changelogs.store');
    Route::put('dashboard/changelogs/{changelog}', [ChangelogController::class, 'update'])->name('changelogs.update');
    Route::delete('dashboard/changelogs/{changelog}', [ChangelogController::class, 'destroy'])->name('changelogs.destroy');

    // System Diagnostics & Admin Expansion Modules
    Route::get('dashboard/backups', [BackupController::class, 'index'])->name('backups.index');
    Route::post('dashboard/backups', [BackupController::class, 'create'])->name('backups.create');
    Route::get('dashboard/backups/{filename}/download', [BackupController::class, 'download'])->name('backups.download');
    Route::delete('dashboard/backups/{filename}', [BackupController::class, 'destroy'])->name('backups.destroy');

    Route::get('dashboard/logs', [LogReaderController::class, 'index'])->name('logs.index');
    Route::get('dashboard/logs/download', [LogReaderController::class, 'download'])->name('logs.download');
    Route::delete('dashboard/logs', [LogReaderController::class, 'destroy'])->name('logs.destroy');

    // Media Manager
    Route::get('dashboard/media', [MediaController::class, 'index'])->name('media.index');
    Route::post('dashboard/media/upload', [MediaController::class, 'upload'])->name('media.upload');
    Route::patch('dashboard/media/{media}/rename', [MediaController::class, 'rename'])->name('media.rename');
    Route::delete('dashboard/media/{media}', [MediaController::class, 'destroy'])->name('media.destroy');
    Route::post('dashboard/media/bulk-destroy', [MediaController::class, 'bulkDestroy'])->name('media.bulk-destroy');

    Route::get('dashboard/health', [HealthMonitorController::class, 'index'])->name('health.index');
});

require __DIR__.'/auth.php';
