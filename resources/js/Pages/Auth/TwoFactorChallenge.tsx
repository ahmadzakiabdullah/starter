import InputError from '@/Components/InputError';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, useForm } from '@inertiajs/react';
import { KeyRound, ShieldCheck } from 'lucide-react';
import { FormEventHandler } from 'react';

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

            <div className="mb-6 space-y-2 text-center">
                <div className="bg-primary/10 text-primary border-primary/20 mx-auto inline-flex items-center justify-center rounded-full border p-3">
                    <ShieldCheck className="h-6 w-6" />
                </div>
                <h1 className="text-foreground text-xl font-bold tracking-tight">
                    Two-Factor Authentication
                </h1>
                <p className="text-muted-foreground mx-auto max-w-xs text-xs">
                    Please open your authenticator app and enter the 6-digit
                    verification code to complete sign-in.
                </p>
            </div>

            <form onSubmit={submit} className="space-y-4">
                <div className="space-y-1">
                    <Label htmlFor="code" className="text-xs font-semibold">
                        Verification Code
                    </Label>
                    <div className="relative">
                        <Input
                            id="code"
                            type="text"
                            name="code"
                            placeholder="e.g. 123456"
                            value={data.code}
                            maxLength={6}
                            className="h-11 pl-9 text-center font-mono text-base tracking-[0.25em]"
                            onChange={(e) =>
                                setData(
                                    'code',
                                    e.target.value.replace(/\D/g, ''),
                                )
                            }
                            required
                            autoFocus
                            autoComplete="one-time-code"
                        />
                        <KeyRound className="text-muted-foreground absolute top-3.5 left-3 h-4 w-4" />
                    </div>
                    <InputError
                        message={errors.code}
                        className="mt-1 text-[10px]"
                    />
                </div>

                <Button
                    className="h-10 w-full text-xs font-semibold"
                    disabled={processing}
                    type="submit"
                >
                    {processing ? 'Verifying...' : 'Verify & Continue'}
                </Button>
            </form>
        </GuestLayout>
    );
}
