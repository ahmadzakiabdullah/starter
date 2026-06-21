import InputError from '@/Components/InputError';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import React, { FormEventHandler, useState } from 'react';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Eye, EyeOff, Lock, Mail, User } from 'lucide-react';

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        username: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Register" />

            <div className="space-y-1.5 mb-6 text-center">
                <h1 className="text-xl font-bold tracking-tight text-foreground">
                    Create an account
                </h1>
                <p className="text-xs text-muted-foreground">
                    Register a new profile to access the system dashboards.
                </p>
            </div>

            <form onSubmit={submit} className="space-y-4">
                <div className="space-y-1">
                    <Label htmlFor="name" className="text-xs font-semibold">Full Name</Label>
                    <div className="relative">
                        <Input
                            id="name"
                            type="text"
                            name="name"
                            value={data.name}
                            placeholder="John Doe"
                            className="pl-9 text-xs"
                            autoComplete="name"
                            onChange={(e) => setData('name', e.target.value)}
                            required
                        />
                        <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    </div>
                    <InputError message={errors.name} className="mt-1 text-[10px]" />
                </div>

                <div className="space-y-1">
                    <Label htmlFor="username" className="text-xs font-semibold">Username</Label>
                    <div className="relative">
                        <Input
                            id="username"
                            type="text"
                            name="username"
                            value={data.username}
                            placeholder="johndoe"
                            className="pl-9 text-xs"
                            autoComplete="username"
                            onChange={(e) => setData('username', e.target.value)}
                            required
                        />
                        <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    </div>
                    <InputError message={errors.username} className="mt-1 text-[10px]" />
                </div>

                <div className="space-y-1">
                    <Label htmlFor="email" className="text-xs font-semibold">Email Address</Label>
                    <div className="relative">
                        <Input
                            id="email"
                            type="email"
                            name="email"
                            value={data.email}
                            placeholder="john@example.com"
                            className="pl-9 text-xs"
                            autoComplete="email"
                            onChange={(e) => setData('email', e.target.value)}
                            required
                        />
                        <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    </div>
                    <InputError message={errors.email} className="mt-1 text-[10px]" />
                </div>

                <div className="space-y-1">
                    <Label htmlFor="password" className="text-xs font-semibold">Password</Label>
                    <div className="relative">
                        <Input
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            value={data.password}
                            placeholder="••••••••"
                            className="pl-9 pr-9 text-xs"
                            autoComplete="new-password"
                            onChange={(e) => setData('password', e.target.value)}
                            required
                        />
                        <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                            title={showPassword ? "Hide password" : "Show password"}
                        >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                    </div>
                    <InputError message={errors.password} className="mt-1 text-[10px]" />
                </div>

                <div className="space-y-1">
                    <Label htmlFor="password_confirmation" className="text-xs font-semibold">Confirm Password</Label>
                    <div className="relative">
                        <Input
                            id="password_confirmation"
                            type={showConfirmPassword ? 'text' : 'password'}
                            name="password_confirmation"
                            value={data.password_confirmation}
                            placeholder="••••••••"
                            className="pl-9 pr-9 text-xs"
                            autoComplete="new-password"
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                            required
                        />
                        <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                            title={showConfirmPassword ? "Hide password" : "Show password"}
                        >
                            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                    </div>
                    <InputError message={errors.password_confirmation} className="mt-1 text-[10px]" />
                </div>

                <Button className="w-full text-xs font-semibold mt-6" disabled={processing} type="submit">
                    {processing ? 'Registering...' : 'Register'}
                </Button>
            </form>

            <div className="mt-6 text-center text-xs text-muted-foreground border-t pt-4">
                Already registered?{' '}
                <Link href={route('login')} className="text-primary hover:underline font-semibold">
                    Sign in
                </Link>
            </div>
        </GuestLayout>
    );
}
