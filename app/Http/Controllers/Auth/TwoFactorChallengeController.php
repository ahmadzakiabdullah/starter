<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;
use PragmaRX\Google2FA\Google2FA;

class TwoFactorChallengeController extends Controller
{
    /**
     * Display the two factor challenge view.
     */
    public function create(Request $request): Response|RedirectResponse
    {
        if (!$request->session()->has('login.id')) {
            return redirect()->route('login');
        }

        return Inertia::render('Auth/TwoFactorChallenge');
    }

    /**
     * Verify the two factor code and login the user.
     */
    public function store(Request $request): RedirectResponse
    {
        if (!$request->session()->has('login.id')) {
            return redirect()->route('login');
        }

        $request->validate([
            'code' => 'required|string|size:6',
        ]);

        $user = User::findOrFail($request->session()->get('login.id'));

        $google2fa = new Google2FA();

        $isValid = $google2fa->verifyKey($user->two_factor_secret, $request->input('code'));

        if (!$isValid) {
            throw ValidationException::withMessages([
                'code' => 'The provided verification code is invalid.',
            ]);
        }

        Auth::login($user, $request->session()->get('login.remember', false));

        $request->session()->forget(['login.id', 'login.remember']);
        $request->session()->regenerate();

        return redirect()->intended(route('dashboard', absolute: false));
    }
}
