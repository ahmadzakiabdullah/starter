<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProfileUpdateRequest;
use Carbon\Carbon;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Inertia\Response;
use PragmaRX\Google2FA\Google2FA;

class ProfileController extends Controller
{
    /**
     * Display the user's profile form.
     */
    public function edit(Request $request): Response
    {
        $sessions = DB::table('sessions')
            ->where('user_id', $request->user()->id)
            ->orderBy('last_activity', 'desc')
            ->get()
            ->map(function ($session) use ($request) {
                $ua = $session->user_agent;
                $browser = 'Unknown Browser';
                $platform = 'Unknown OS';

                if (preg_match('/Chrome/i', $ua)) {
                    $browser = 'Chrome';
                } elseif (preg_match('/Firefox/i', $ua)) {
                    $browser = 'Firefox';
                } elseif (preg_match('/Safari/i', $ua) && ! preg_match('/Chrome/i', $ua)) {
                    $browser = 'Safari';
                } elseif (preg_match('/Edge/i', $ua)) {
                    $browser = 'Edge';
                }

                if (preg_match('/Windows/i', $ua)) {
                    $platform = 'Windows';
                } elseif (preg_match('/Macintosh|Mac OS X/i', $ua)) {
                    $platform = 'macOS';
                } elseif (preg_match('/Linux/i', $ua)) {
                    $platform = 'Linux';
                } elseif (preg_match('/iPhone|iPad|iPod/i', $ua)) {
                    $platform = 'iOS';
                } elseif (preg_match('/Android/i', $ua)) {
                    $platform = 'Android';
                }

                return [
                    'id' => $session->id,
                    'ip_address' => $session->ip_address,
                    'browser' => $browser,
                    'platform' => $platform,
                    'is_current' => $session->id === $request->session()->getId(),
                    'last_active' => Carbon::createFromTimestamp($session->last_activity)->diffForHumans(),
                ];
            });

        return Inertia::render('Profile/Edit', [
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
            'status' => session('status'),
            'sessions' => $sessions,
            'twoFactorEnabled' => ! empty($request->user()->two_factor_secret),
            'twoFactorSecret' => session('two_factor_secret'),
            'twoFactorQrCodeUrl' => session('two_factor_qr'),
        ]);
    }

    /**
     * Enable Two-Factor Authentication.
     */
    public function enableTwoFactor(Request $request): RedirectResponse
    {
        $google2fa = new Google2FA;
        $secret = $google2fa->generateSecretKey();

        $qrUrl = $google2fa->getQRCodeUrl(
            config('app.name'),
            $request->user()->email,
            $secret
        );

        $request->session()->put('two_factor_secret', $secret);
        $request->session()->put('two_factor_qr', $qrUrl);

        return back();
    }

    /**
     * Confirm and finalize enabling Two-Factor Authentication.
     */
    public function confirmTwoFactor(Request $request): RedirectResponse
    {
        $request->validate([
            'code' => 'required|string|size:6',
        ]);

        $secret = $request->session()->get('two_factor_secret');

        if (! $secret) {
            return back()->withErrors(['code' => '2FA activation session expired. Please try again.']);
        }

        $google2fa = new Google2FA;
        $isValid = $google2fa->verifyKey($secret, $request->input('code'));

        if (! $isValid) {
            return back()->withErrors(['code' => 'The verification code is incorrect.']);
        }

        $user = $request->user();
        $user->two_factor_secret = $secret;
        $user->save();

        $request->session()->forget(['two_factor_secret', 'two_factor_qr']);

        return back()->with('success', 'Two-Factor Authentication has been successfully enabled.');
    }

    /**
     * Disable Two-Factor Authentication.
     */
    public function disableTwoFactor(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();
        $user->two_factor_secret = null;
        $user->save();

        return back()->with('success', 'Two-Factor Authentication has been disabled.');
    }

    /**
     * Log out of other devices/sessions.
     */
    public function logoutOtherDevices(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        DB::table('sessions')
            ->where('user_id', $request->user()->id)
            ->where('id', '!=', $request->session()->getId())
            ->delete();

        return back()->with('success', 'Logged out of other devices successfully.');
    }

    /**
     * Update the user's profile information.
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $request->user()->fill($request->validated());

        if ($request->user()->isDirty('email')) {
            $request->user()->email_verified_at = null;
        }

        $request->user()->save();

        return Redirect::route('profile.edit');
    }

    /**
     * Delete the user's account.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return Redirect::to('/');
    }
}
