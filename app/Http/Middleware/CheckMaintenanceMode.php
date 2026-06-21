<?php

namespace App\Http\Middleware;

use App\Models\Setting;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckMaintenanceMode
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $settings = Setting::values();

        if ($settings['maintenance_mode'] ?? false) {
            $isDashboard = $request->is('dashboard') || $request->is('dashboard/*');
            $isAuth = $request->is('login') || $request->is('logout') || $request->is('register');
            $isSuperAdmin = $request->user() && $request->user()->hasRole('superadmin');
            
            // Check if client IP is bypassed
            $bypassIps = array_filter(array_map('trim', explode(',', $settings['maintenance_bypass_ip'] ?? '')));
            $isBypassedIp = in_array($request->ip(), $bypassIps);

            if (!$isDashboard && !$isAuth && !$isSuperAdmin && !$isBypassedIp) {
                if ($request->expectsJson() || $request->header('X-Inertia')) {
                    abort(503, $settings['maintenance_message'] ?? 'The system is undergoing scheduled maintenance.');
                }

                return response()->view('errors.503', [
                    'message' => $settings['maintenance_message'] ?? 'Our site is currently undergoing maintenance. We will be back online shortly!'
                ], 503);
            }
        }

        return $next($request);
    }
}
