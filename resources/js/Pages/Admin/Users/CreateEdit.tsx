import React, { useRef, useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { AvatarInitials } from '@/Components/ui/avatar-initials';
import { ArrowLeft, Check, Key, Mail, Shield, User, UserCheck, Eye, EyeOff, Sparkles, Copy } from 'lucide-react';
import InputError from '@/Components/InputError';
import { toast } from 'sonner';

interface Role {
    id: number;
    name: string;
}

interface User {
    id: number;
    name: string;
    username: string;
    email: string;
    avatar: string | null;
    roles: Role[];
}

interface CreateEditProps {
    user?: User;
    roles: Role[];
}

export default function CreateEdit({ user, roles }: CreateEditProps) {
    const isEdit = !!user;
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.avatar || null);
    
    const [showPassword, setShowPassword] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState<{ score: number; label: string; colorClass: string; barWidth: string }>({
        score: 0,
        label: '',
        colorClass: 'bg-zinc-200',
        barWidth: 'w-0'
    });

    const { data, setData, post, processing, errors } = useForm({
        _method: isEdit ? 'PUT' : 'POST',
        name: user?.name || '',
        username: user?.username || '',
        email: user?.email || '',
        password: '',
        roles: user ? user.roles.map((r) => r.name) : ['user'],
        avatar: null as File | null,
        remove_avatar: false,
    });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData('avatar', file);
            setData('remove_avatar', false);
            setAvatarPreview(URL.createObjectURL(file));
        }
    };

    const triggerFileSelect = () => {
        fileInputRef.current?.click();
    };

    const handleRemoveAvatar = () => {
        setData('avatar', null);
        setData('remove_avatar', true);
        setAvatarPreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleRoleToggle = (roleName: string) => {
        const currentRoles = [...data.roles];
        const index = currentRoles.indexOf(roleName);
        if (index > -1) {
            if (currentRoles.length > 1) {
                currentRoles.splice(index, 1);
            }
        } else {
            currentRoles.push(roleName);
        }
        setData('roles', currentRoles);
    };

    const checkPasswordStrength = (pwd: string) => {
        if (!pwd) {
            setPasswordStrength({ score: 0, label: '', colorClass: 'bg-zinc-200', barWidth: 'w-0' });
            return;
        }
        let score = 0;
        if (pwd.length >= 8) score++;
        if (/[A-Z]/.test(pwd)) score++;
        if (/[0-9]/.test(pwd)) score++;
        if (/[^A-Za-z0-9]/.test(pwd)) score++;

        let label = 'Weak';
        let colorClass = 'bg-red-500';
        let barWidth = 'w-1/4';
        
        if (score >= 4) {
            label = 'Strong';
            colorClass = 'bg-green-500';
            barWidth = 'w-full';
        } else if (score >= 2) {
            label = 'Medium';
            colorClass = 'bg-amber-500';
            barWidth = 'w-2/3';
        }

        setPasswordStrength({ score, label, colorClass, barWidth });
    };

    const handleGeneratePassword = () => {
        const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+~`|}{[]:;?><,./-=";
        let pwd = "";
        
        pwd += "ABCDEFGHIJKLMNOPQRSTUVWXYZ"[Math.floor(Math.random() * 26)];
        pwd += "abcdefghijklmnopqrstuvwxyz"[Math.floor(Math.random() * 26)];
        pwd += "0123456789"[Math.floor(Math.random() * 10)];
        pwd += "!@#$%^&*()"[Math.floor(Math.random() * 10)];
        
        for (let i = 0; i < 8; i++) {
            pwd += chars[Math.floor(Math.random() * chars.length)];
        }
        pwd = pwd.split('').sort(() => 0.5 - Math.random()).join('');
        
        setData('password', pwd);
        setShowPassword(true);
        checkPasswordStrength(pwd);

        navigator.clipboard.writeText(pwd);
        toast.success('Generated secure password copied to clipboard!');
    };

    const handleCopyPassword = () => {
        if (data.password) {
            navigator.clipboard.writeText(data.password);
            toast.success('Password copied to clipboard!');
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (isEdit) {
            post(route('users.update', user.id), {
                onSuccess: () => toast.success('User updated successfully.'),
                onError: () => toast.error('Failed to update user. Please check the inputs.')
            });
        } else {
            post(route('users.store'), {
                onSuccess: () => toast.success('User created successfully.'),
                onError: () => toast.error('Failed to create user. Please check the inputs.')
            });
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title={isEdit ? 'Edit User' : 'Create User'} />

            <div className="mx-auto max-w-4xl space-y-6">
                <div className="flex items-center justify-between">
                    <Link
                        href={route('users.index')}
                        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to User Management
                    </Link>
                </div>

                <form onSubmit={handleSubmit} className="grid gap-6 md:grid-cols-3">
                    {/* Left Column: Avatar Management */}
                    <Card className="h-fit shadow-sm bg-card/60 backdrop-blur-md">
                        <CardHeader className="text-center">
                            <CardTitle className="text-lg">Profile Avatar</CardTitle>
                            <CardDescription>Upload a custom image or use name-based initials fallback.</CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col items-center gap-4">
                            <div className="relative group">
                                <AvatarInitials
                                    name={data.name || 'User Preview'}
                                    avatarUrl={avatarPreview}
                                    size="xl"
                                    className="h-28 w-28 text-3xl shadow-md border-4 border-background"
                                />
                            </div>

                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                accept="image/*"
                                className="hidden"
                            />

                            <div className="flex flex-col gap-2 w-full">
                                <Button type="button" variant="outline" onClick={triggerFileSelect} className="w-full">
                                    Upload Image
                                </Button>
                                {avatarPreview && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        onClick={handleRemoveAvatar}
                                        className="text-destructive hover:bg-destructive/5 hover:text-destructive w-full"
                                    >
                                        Remove Avatar
                                    </Button>
                                )}
                            </div>
                            <InputError message={errors.avatar} className="text-center" />
                        </CardContent>
                    </Card>

                    {/* Right Column: User Details and Roles */}
                    <div className="md:col-span-2 space-y-6">
                        <Card className="shadow-sm">
                            <CardHeader>
                                <CardTitle>{isEdit ? 'Update Profile Details' : 'Create User Profile'}</CardTitle>
                                <CardDescription>Enter the user's name, email, credentials, and select access levels.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Name Input */}
                                <div className="grid gap-2">
                                    <Label htmlFor="name" className="flex items-center gap-1.5">
                                        <User className="h-4 w-4 text-muted-foreground" />
                                        Full Name
                                    </Label>
                                    <Input
                                        id="name"
                                        placeholder="e.g. Ahmad Zaki"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        required
                                    />
                                    <InputError message={errors.name} />
                                </div>

                                {/* Username & Email Grid */}
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="grid gap-2">
                                        <Label htmlFor="username" className="flex items-center gap-1.5">
                                            <UserCheck className="h-4 w-4 text-muted-foreground" />
                                            Username
                                        </Label>
                                        <Input
                                            id="username"
                                            placeholder="e.g. ahmadzaki"
                                            value={data.username}
                                            onChange={(e) => setData('username', e.target.value.toLowerCase().replace(/[^a-z0-9_.-]/g, ''))}
                                            required
                                        />
                                        <InputError message={errors.username} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="email" className="flex items-center gap-1.5">
                                            <Mail className="h-4 w-4 text-muted-foreground" />
                                            Email Address
                                        </Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="ahmadzaki@example.com"
                                            value={data.email}
                                            onChange={(e) => setData('email', e.target.value)}
                                            required
                                        />
                                        <InputError message={errors.email} />
                                    </div>
                                </div>

                                {/* Password Input with Generator & Strength Meter */}
                                <div className="grid gap-2">
                                    <Label htmlFor="password" className="flex items-center gap-1.5">
                                        <Key className="h-4 w-4 text-muted-foreground" />
                                        Password {isEdit && <span className="text-xs text-muted-foreground font-normal">(Leave blank to keep current)</span>}
                                    </Label>
                                    <div className="flex gap-2">
                                        <div className="relative flex-1">
                                            <Input
                                                id="password"
                                                type={showPassword ? 'text' : 'password'}
                                                placeholder={isEdit ? '••••••••' : 'Enter password'}
                                                value={data.password}
                                                onChange={(e) => {
                                                    setData('password', e.target.value);
                                                    checkPasswordStrength(e.target.value);
                                                }}
                                                required={!isEdit}
                                                className="pr-10"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 top-3.5 text-muted-foreground hover:text-foreground focus:outline-none"
                                            >
                                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </button>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={handleGeneratePassword}
                                            className="flex items-center gap-1 shrink-0"
                                            title="Auto-generate secure password and copy to clipboard"
                                        >
                                            <Sparkles className="h-4 w-4 text-amber-500" />
                                            Generate
                                        </Button>
                                        {data.password && (
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="icon"
                                                onClick={handleCopyPassword}
                                                className="shrink-0"
                                                title="Copy password to clipboard"
                                            >
                                                <Copy className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>
                                    
                                    {/* Password Strength Indicator */}
                                    {data.password && (
                                        <div className="space-y-1.5 mt-1 animate-fade-in">
                                            <div className="flex items-center justify-between text-xs">
                                                <span className="text-muted-foreground">Password strength:</span>
                                                <span className="font-semibold text-foreground">{passwordStrength.label}</span>
                                            </div>
                                            <div className="h-1.5 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                                                <div className={`h-full ${passwordStrength.colorClass} ${passwordStrength.barWidth} transition-all duration-300`} />
                                            </div>
                                            <p className="text-[10px] text-muted-foreground">
                                                Tip: Use uppercase letters, numbers, and special characters for a stronger password.
                                            </p>
                                        </div>
                                    )}
                                    <InputError message={errors.password} />
                                </div>
                            </CardContent>
                        </Card>

                        {/* System Access Roles */}
                        <Card className="shadow-sm">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Shield className="h-5 w-5 text-primary" />
                                    Assigned Roles
                                </CardTitle>
                                <CardDescription>Select one or more permission roles to grant system access levels.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid gap-3 sm:grid-cols-2">
                                    {roles.map((role) => {
                                        const isChecked = data.roles.includes(role.name);
                                        return (
                                            <div
                                                key={role.id}
                                                onClick={() => handleRoleToggle(role.name)}
                                                className={`flex items-center justify-between p-3.5 rounded-lg border cursor-pointer select-none transition-all duration-200 ${
                                                    isChecked
                                                        ? 'bg-primary/5 border-primary/40 shadow-sm'
                                                        : 'border-muted hover:bg-muted/40'
                                                }`}
                                            >
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-semibold capitalize text-foreground">
                                                        {role.name}
                                                    </span>
                                                    <span className="text-xs text-muted-foreground">
                                                        {role.name === 'superadmin' && 'Full administrative access bypass.'}
                                                        {role.name === 'admin' && 'Create/edit users and manage system roles.'}
                                                        {role.name === 'manager' && 'Manage user profiles and view dashboard.'}
                                                        {role.name === 'user' && 'Dashboard view only access levels.'}
                                                    </span>
                                                </div>
                                                <div
                                                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors ${
                                                        isChecked ? 'bg-primary border-primary text-white' : 'border-input'
                                                    }`}
                                                >
                                                    {isChecked && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                                <InputError message={errors.roles} className="mt-4" />
                            </CardContent>
                        </Card>

                        {/* Action Buttons */}
                        <div className="flex justify-end gap-3">
                            <Button type="button" variant="outline" asChild>
                                <Link href={route('users.index')}>Cancel</Link>
                            </Button>
                            <Button type="submit" disabled={processing} className="shadow-sm">
                                {processing ? 'Saving...' : isEdit ? 'Save Changes' : 'Create User'}
                            </Button>
                        </div>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
