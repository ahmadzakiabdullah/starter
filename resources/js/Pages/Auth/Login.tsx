import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { FormEventHandler, useState } from 'react';

export default function Login({
    status,
    canResetPassword,
}: {
    status?: string;
    canResetPassword: boolean;
}) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false as boolean,
    });

    const [showPassword, setShowPassword] = useState(false);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Log in" />

            <div className="mb-6 space-y-1.5 text-center">
                <h1 className="text-foreground text-xl font-bold tracking-tight">
                    Sign in
                </h1>
                <p className="text-muted-foreground text-xs">
                    Enter your credentials to access your administrative
                    dashboard.
                </p>
            </div>

            {status && (
                <div className="mb-4 rounded-lg border border-green-200 bg-green-50 p-2.5 text-xs font-semibold text-green-600 dark:border-green-500/20 dark:bg-green-500/10">
                    {status}
                </div>
            )}

            <form onSubmit={submit} className="space-y-4">
                <div className="space-y-1">
                    <Label htmlFor="email" className="text-xs font-semibold">
                        Email or Username
                    </Label>
                    <div className="relative">
                        <Input
                            id="email"
                            type="text"
                            name="email"
                            value={data.email}
                            placeholder="username@domain.com"
                            className="pl-9 text-xs"
                            autoComplete="username"
                            onChange={(e) => setData('email', e.target.value)}
                            required
                        />
                        <Mail className="text-muted-foreground absolute top-2.5 left-3 h-4 w-4" />
                    </div>
                    <InputError
                        message={errors.email}
                        className="mt-1 text-[10px]"
                    />
                </div>

                <div className="space-y-1">
                    <div className="flex items-center justify-between">
                        <Label
                            htmlFor="password"
                            className="text-xs font-semibold"
                        >
                            Password
                        </Label>
                        {canResetPassword && (
                            <Link
                                href={route('password.request')}
                                className="text-primary text-[10px] hover:underline"
                            >
                                Forgot password?
                            </Link>
                        )}
                    </div>
                    <div className="relative">
                        <Input
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            value={data.password}
                            placeholder="••••••••"
                            className="pr-9 pl-9 text-xs"
                            autoComplete="current-password"
                            onChange={(e) =>
                                setData('password', e.target.value)
                            }
                            required
                        />
                        <Lock className="text-muted-foreground absolute top-2.5 left-3 h-4 w-4" />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="text-muted-foreground hover:text-foreground absolute top-2.5 right-3"
                            title={
                                showPassword ? 'Hide password' : 'Show password'
                            }
                        >
                            {showPassword ? (
                                <EyeOff className="h-4 w-4" />
                            ) : (
                                <Eye className="h-4 w-4" />
                            )}
                        </button>
                    </div>
                    <InputError
                        message={errors.password}
                        className="mt-1 text-[10px]"
                    />
                </div>

                <div className="flex items-center justify-between">
                    <label className="flex cursor-pointer items-center select-none">
                        <Checkbox
                            name="remember"
                            checked={data.remember}
                            onChange={(e) =>
                                setData('remember', e.target.checked)
                            }
                        />
                        <span className="text-muted-foreground ms-2 text-xs">
                            Remember me
                        </span>
                    </label>
                </div>

                <Button
                    className="w-full text-xs font-semibold"
                    disabled={processing}
                    type="submit"
                >
                    {processing ? 'Signing in...' : 'Sign in'}
                </Button>
            </form>

            {/* Social Authentication Grid Placeholder */}
            <div className="mt-6 space-y-4">
                <div className="relative flex justify-center text-[10px] uppercase">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                    </div>
                    <span className="bg-card text-muted-foreground relative px-2.5 font-semibold">
                        Or continue with
                    </span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <Button
                        variant="outline"
                        type="button"
                        className="hover:bg-muted/50 flex h-9 w-full items-center justify-center gap-2 text-xs"
                    >
                        <svg
                            className="text-foreground h-3.5 w-3.5 shrink-0"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                        >
                            <path d="M12.24 10.285V13.4h6.887C18.2 15.614 15.645 18 12.24 18c-3.86 0-7-3.14-7-7s3.14-7 7-7c1.7 0 3.3.6 4.6 1.8l2.4-2.4C17.3 1.7 14.9 1 12.24 1a9.99 9.99 0 00-10 10 9.99 9.99 0 0010 10c5.3 0 9.76-3.84 9.76-10 0-.6-.05-1.2-.16-1.715H12.24z" />
                        </svg>
                        Google
                    </Button>
                    <Button
                        variant="outline"
                        type="button"
                        className="hover:bg-muted/50 flex h-9 w-full items-center justify-center gap-2 text-xs"
                    >
                        <svg
                            className="text-foreground h-3.5 w-3.5 shrink-0"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                        >
                            <path
                                fillRule="evenodd"
                                clipRule="evenodd"
                                d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.167 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.137 20.164 22 16.418 22 12c0-5.523-4.477-10-10-10z"
                            />
                        </svg>
                        GitHub
                    </Button>
                </div>
            </div>

            <div className="text-muted-foreground mt-6 border-t pt-4 text-center text-xs">
                Don't have an account?{' '}
                <Link
                    href={route('register')}
                    className="text-primary font-semibold hover:underline"
                >
                    Sign up
                </Link>
            </div>
        </GuestLayout>
    );
}
