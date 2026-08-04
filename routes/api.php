<?php

use App\Http\Controllers\Api\AuditLogController;
use App\Http\Controllers\Api\HealthController;
use App\Http\Controllers\Api\MediaController;
use App\Http\Controllers\Api\RoleController;
use App\Http\Controllers\Api\UserController;
use App\Http\Resources\UserResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/health', HealthController::class)->name('api.health');

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', function (Request $request) {
        return new UserResource($request->user());
    })->middleware('abilities:user:read')->name('api.user');

    Route::get('users', [UserController::class, 'index'])->middleware('abilities:users:read')->name('api.users.index');
    Route::get('users/{id}', [UserController::class, 'show'])->middleware('abilities:users:read')->name('api.users.show');
    Route::get('roles', [RoleController::class, 'index'])->middleware('abilities:roles:read')->name('api.roles.index');
    Route::get('roles/{id}', [RoleController::class, 'show'])->middleware('abilities:roles:read')->name('api.roles.show');
    Route::get('media', [MediaController::class, 'index'])->middleware('abilities:media:read')->name('api.media.index');
    Route::get('media/{id}', [MediaController::class, 'show'])->middleware('abilities:media:read')->name('api.media.show');
    Route::get('audit-logs', [AuditLogController::class, 'index'])->middleware('abilities:audit-logs:read')->name('api.audit-logs.index');
    Route::get('audit-logs/{id}', [AuditLogController::class, 'show'])->middleware('abilities:audit-logs:read')->name('api.audit-logs.show');
});
