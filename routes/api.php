<?php

use App\Http\Controllers\Api\AuditLogController;
use App\Http\Controllers\Api\HealthController;
use App\Http\Controllers\Api\MediaController;
use App\Http\Controllers\Api\RoleController;
use App\Http\Controllers\Api\UserController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/health', HealthController::class)->name('api.health');

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', function (Request $request) {
        return $request->user();
    })->name('api.user');

    Route::get('users', [UserController::class, 'index'])->name('api.users.index');
    Route::get('users/{id}', [UserController::class, 'show'])->name('api.users.show');
    Route::get('roles', [RoleController::class, 'index'])->name('api.roles.index');
    Route::get('roles/{id}', [RoleController::class, 'show'])->name('api.roles.show');
    Route::get('media', [MediaController::class, 'index'])->name('api.media.index');
    Route::get('media/{id}', [MediaController::class, 'show'])->name('api.media.show');
    Route::get('audit-logs', [AuditLogController::class, 'index'])->name('api.audit-logs.index');
    Route::get('audit-logs/{id}', [AuditLogController::class, 'show'])->name('api.audit-logs.show');
});
