import InputError from '@/Components/InputError';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, useForm } from '@inertiajs/react';
import React, { FormEventHandler } from 'react';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { KeyRound, ShieldCheck } from 'lucide-react';

export default function TwoFactorChallenge() {
    const { data, setData, post, processing, errors } = useForm({
        code: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('two-factor.login'));
    };

    return (
        <GuestLayout>
            <Head title="Two-Factor Verification" />

            <div className="space-y-2 mb-6 text-center">
                <div className="mx-auto inline-flex items-center justify-center p-3 rounded-full bg-primary/10 text-primary border border-primary/20">
                    <ShieldCheck className="h-6 w-6" />
                </div>
                <h1 className="text-xl font-bold tracking-tight text-foreground">
                    Two-Factor Authentication
                </h1>
                <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                    Please open your authenticator app and enter the 6-digit verification code to complete sign-in.
                </p>
            </div>

            <form onSubmit={submit} className="space-y-4">
                <div className="space-y-1">
                    <Label htmlFor="code" className="text-xs font-semibold">Verification Code</Label>
                    <div className="relative">
                        <Input
                            id="code"
                            type="text"
                            name="code"
                            placeholder="e.g. 123456"
                            value={data.code}
                            maxLength={6}
                            className="pl-9 font-mono tracking-[0.25em] text-center text-base h-11"
                            onChange={(e) => setData('code', e.target.value.replace(/\D/g, ''))}
                            required
                            autoFocus
                            autoComplete="one-time-code"
                        />
                        <KeyRound className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                    </div>
                    <InputError message={errors.code} className="mt-1 text-[10px]" />
                </div>

                <Button className="w-full text-xs font-semibold h-10" disabled={processing} type="submit">
                    {processing ? 'Verifying...' : 'Verify & Continue'}
                </Button>
            </form>
        </GuestLayout>
    );
}
