<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\AuditLogController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\SystemSettingsController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register') && (\App\Models\Setting::values()['enable_registration'] ?? true),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

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
    Route::get('dashboard/notifications', [NotificationController::class, 'index'])->name('notifications.index');
    Route::patch('dashboard/notifications/read-all', [NotificationController::class, 'markAllAsRead'])->name('notifications.read-all');
    Route::patch('dashboard/notifications/{notification}/read', [NotificationController::class, 'markAsRead'])->name('notifications.read');

    // Changelogs / Versioning Timeline
    Route::get('dashboard/changelogs', [\App\Http\Controllers\ChangelogController::class, 'index'])->name('changelogs.index');
    Route::post('dashboard/changelogs', [\App\Http\Controllers\ChangelogController::class, 'store'])->name('changelogs.store');
    Route::put('dashboard/changelogs/{changelog}', [\App\Http\Controllers\ChangelogController::class, 'update'])->name('changelogs.update');
    Route::delete('dashboard/changelogs/{changelog}', [\App\Http\Controllers\ChangelogController::class, 'destroy'])->name('changelogs.destroy');
});

require __DIR__.'/auth.php';
