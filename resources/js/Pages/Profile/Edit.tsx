import { Button } from '@/Components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/Components/ui/dialog';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import {
    AlertTriangle,
    CheckCircle,
    Key,
    Laptop,
    Lock,
    QrCode,
    ShieldCheck,
    User,
} from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'sonner';
import ApiTokenManager from './Partials/ApiTokenManager';
import DeleteUserForm from './Partials/DeleteUserForm';
import SessionsManager from './Partials/SessionsManager';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';

interface EditProps {
    mustVerifyEmail: boolean;
    status?: string;
    twoFactorEnabled: boolean;
    twoFactorSecret: string | null;
    twoFactorQrCodeUrl: string | null;
}

interface SystemFlags {
    module_active_sessions?: boolean;
    module_api_keys?: boolean;
}

export default function Edit({
    mustVerifyEmail,
    status,
    twoFactorEnabled,
    twoFactorSecret,
    twoFactorQrCodeUrl,
}: EditProps) {
    const [activeTab, setActiveTab] = useState('profile');
    const [confirmingDisable2fa, setConfirmingDisable2fa] = useState(false);

    // 2FA forms
    const enable2faForm = useForm({});
    const confirm2faForm = useForm({
        code: '',
    });
    const disable2faForm = useForm({
        password: '',
    });

    const handleEnable2fa = () => {
        enable2faForm.post(route('profile.two-factor.enable'), {
            onSuccess: () => {
                toast.success(
                    'Scan the QR code to confirm and link Google Authenticator.',
                );
            },
        });
    };

    const handleConfirm2fa = (e: React.FormEvent) => {
        e.preventDefault();
        confirm2faForm.post(route('profile.two-factor.confirm'), {
            onSuccess: () => {
                confirm2faForm.reset();
                toast.success(
                    'Two-Factor Authentication enabled successfully.',
                );
            },
            onError: () => {
                toast.error(
                    'Incorrect code. Please check your authenticator app.',
                );
            },
        });
    };

    const handleDisable2fa = (e: React.FormEvent) => {
        e.preventDefault();
        disable2faForm.post(route('profile.two-factor.disable'), {
            onSuccess: () => {
                setConfirmingDisable2fa(false);
                disable2faForm.reset();
                toast.success('Two-Factor Authentication disabled.');
            },
            onError: () => {
                toast.error('Incorrect password.');
            },
        });
    };

    const { props: pageProps } = usePage();
    const system = pageProps.system as SystemFlags | undefined;
    const showSessions = system?.module_active_sessions !== false;
    const showApiKeys = system?.module_api_keys !== false;

    return (
        <AuthenticatedLayout>
            <Head title="Profile Settings" />

            <div className="mx-auto max-w-4xl space-y-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">
                        Account Profile Settings
                    </h1>
                    <p className="text-muted-foreground text-sm">
                        Manage your profile details, secure credentials, 2FA
                        locks, and logged sessions.
                    </p>
                </div>

                <Tabs
                    value={activeTab}
                    onValueChange={setActiveTab}
                    className="space-y-6"
                >
                    <TabsList className="bg-muted grid grid-cols-2 rounded-lg p-1 md:flex md:w-auto">
                        <TabsTrigger
                            value="profile"
                            className="flex items-center gap-1.5 rounded px-4 py-2 text-xs"
                        >
                            <User className="h-4 w-4" />
                            General Details
                        </TabsTrigger>
                        <TabsTrigger
                            value="password"
                            className="flex items-center gap-1.5 rounded px-4 py-2 text-xs"
                        >
                            <Lock className="h-4 w-4" />
                            Change Password
                        </TabsTrigger>
                        <TabsTrigger
                            value="2fa"
                            className="flex items-center gap-1.5 rounded px-4 py-2 text-xs"
                        >
                            <ShieldCheck className="h-4 w-4" />
                            Two-Factor Auth
                        </TabsTrigger>
                        {showSessions && (
                            <TabsTrigger
                                value="sessions"
                                className="flex items-center gap-1.5 rounded px-4 py-2 text-xs"
                            >
                                <Laptop className="h-4 w-4" />
                                Active Devices
                            </TabsTrigger>
                        )}
                        {showApiKeys && (
                            <TabsTrigger
                                value="api-tokens"
                                className="flex items-center gap-1.5 rounded px-4 py-2 text-xs"
                            >
                                <Key className="h-4 w-4" />
                                API Access Keys
                            </TabsTrigger>
                        )}
                    </TabsList>

                    {/* GENERAL DETAILS TAB */}
                    <TabsContent value="profile" className="space-y-6">
                        <div className="bg-card rounded-xl border p-6 shadow-xs">
                            <UpdateProfileInformationForm
                                mustVerifyEmail={mustVerifyEmail}
                                status={status}
                                className="max-w-xl"
                            />
                        </div>
                        <div className="bg-card border-destructive/20 rounded-xl border p-6 shadow-xs">
                            <DeleteUserForm className="max-w-xl" />
                        </div>
                    </TabsContent>

                    {/* PASSWORD TAB */}
                    <TabsContent value="password">
                        <div className="bg-card rounded-xl border p-6 shadow-xs">
                            <UpdatePasswordForm className="max-w-xl" />
                        </div>
                    </TabsContent>

                    {/* TWO-FACTOR AUTH TAB */}
                    <TabsContent value="2fa">
                        <div className="bg-card space-y-6 rounded-xl border p-6 shadow-xs">
                            <div>
                                <h3 className="text-foreground text-base font-bold">
                                    Two-Factor Authentication (2FA)
                                </h3>
                                <p className="text-muted-foreground mt-1 max-w-xl text-xs leading-relaxed">
                                    Adds an extra layer of defense to your
                                    profile. Once enabled, logging in requires
                                    entering a 6-digit OTP code generated by
                                    your Google Authenticator app.
                                </p>
                            </div>

                            {twoFactorEnabled ? (
                                <div className="space-y-4">
                                    <div className="flex max-w-md items-center gap-2 rounded-lg border border-green-500/20 bg-green-500/10 p-3 text-xs font-semibold text-green-500">
                                        <CheckCircle className="h-5 w-5 shrink-0" />
                                        <span>
                                            Two-factor authentication is active
                                            on your profile.
                                        </span>
                                    </div>
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() =>
                                            setConfirmingDisable2fa(true)
                                        }
                                    >
                                        Disable 2FA Lock
                                    </Button>
                                </div>
                            ) : twoFactorQrCodeUrl ? (
                                <div className="bg-muted/10 grid gap-6 rounded-xl border p-4 md:grid-cols-2">
                                    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed bg-white p-4 dark:bg-slate-950">
                                        {/* QR code rendered from a server-side inline data URI */}
                                        <img
                                            src={twoFactorQrCodeUrl}
                                            alt="Google Authenticator QR Code"
                                            className="h-44 w-44 rounded border bg-white object-contain p-1.5 shadow-xs"
                                        />
                                        <div className="text-muted-foreground bg-muted mt-2 max-w-full rounded px-2 py-1 font-mono text-[10px] font-semibold break-all select-all">
                                            Secret: {twoFactorSecret}
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="space-y-1.5">
                                            <h4 className="flex items-center gap-1 text-xs font-bold tracking-wider uppercase">
                                                <QrCode className="text-primary h-4 w-4" />
                                                Confirm Authenticator Setup
                                            </h4>
                                            <p className="text-muted-foreground text-xs leading-relaxed">
                                                1. Scan the QR code using Google
                                                Authenticator, Authy, or Duo.
                                                <br />
                                                2. Enter the generated 6-digit
                                                confirmation code below to link
                                                the device.
                                            </p>
                                        </div>

                                        <form
                                            onSubmit={handleConfirm2fa}
                                            className="max-w-xs space-y-3.5"
                                        >
                                            <div className="space-y-1">
                                                <Label
                                                    htmlFor="code"
                                                    className="text-[10px] font-bold tracking-wider uppercase"
                                                >
                                                    OTP Code
                                                </Label>
                                                <Input
                                                    id="code"
                                                    placeholder="e.g. 123456"
                                                    value={
                                                        confirm2faForm.data.code
                                                    }
                                                    onChange={(e) =>
                                                        confirm2faForm.setData(
                                                            'code',
                                                            e.target.value.replace(
                                                                /\D/g,
                                                                '',
                                                            ),
                                                        )
                                                    }
                                                    className="text-center font-mono text-sm font-semibold tracking-[0.2em]"
                                                    maxLength={6}
                                                    required
                                                />
                                                {confirm2faForm.errors.code && (
                                                    <p className="text-[10px] text-red-500">
                                                        {
                                                            confirm2faForm
                                                                .errors.code
                                                        }
                                                    </p>
                                                )}
                                            </div>
                                            <div className="flex gap-2">
                                                <Button
                                                    type="submit"
                                                    size="sm"
                                                    disabled={
                                                        confirm2faForm.processing
                                                    }
                                                >
                                                    Confirm & Save
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() =>
                                                        router.get(
                                                            route(
                                                                'profile.edit',
                                                            ),
                                                        )
                                                    }
                                                >
                                                    Cancel
                                                </Button>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="bg-muted border-muted/50 text-muted-foreground flex max-w-md items-center gap-2 rounded-lg border p-3 text-xs font-semibold">
                                        <AlertTriangle className="h-5 w-5 shrink-0" />
                                        <span>
                                            Two-factor authentication is
                                            currently disabled.
                                        </span>
                                    </div>
                                    <Button
                                        type="button"
                                        size="sm"
                                        onClick={handleEnable2fa}
                                        disabled={enable2faForm.processing}
                                    >
                                        Enable 2FA Verification
                                    </Button>
                                </div>
                            )}
                        </div>
                    </TabsContent>

                    {/* ACTIVE DEVICES SESSIONS TAB */}
                    {showSessions && (
                        <TabsContent value="sessions">
                            <SessionsManager />
                        </TabsContent>
                    )}

                    {/* API ACCESS KEYS TAB */}
                    {showApiKeys && (
                        <TabsContent value="api-tokens">
                            <ApiTokenManager />
                        </TabsContent>
                    )}
                </Tabs>
            </div>

            {/* CONFIRM DISABLE 2FA DIALOG */}
            {confirmingDisable2fa && (
                <Dialog
                    open={confirmingDisable2fa}
                    onOpenChange={() => setConfirmingDisable2fa(false)}
                >
                    <DialogContent className="sm:rounded-xl">
                        <form onSubmit={handleDisable2fa}>
                            <DialogHeader>
                                <DialogTitle className="text-destructive flex items-center gap-2">
                                    <AlertTriangle className="h-5 w-5" />
                                    Disable Two-Factor Authentication
                                </DialogTitle>
                                <DialogDescription>
                                    To secure this request, please confirm your
                                    current account password below.
                                </DialogDescription>
                            </DialogHeader>

                            <div className="my-4 space-y-1.5">
                                <Label htmlFor="disable_pwd">
                                    Current Password
                                </Label>
                                <Input
                                    id="disable_pwd"
                                    type="password"
                                    placeholder="Enter password..."
                                    value={disable2faForm.data.password}
                                    onChange={(e) =>
                                        disable2faForm.setData(
                                            'password',
                                            e.target.value,
                                        )
                                    }
                                    required
                                />
                                {disable2faForm.errors.password && (
                                    <p className="text-[10px] text-red-500">
                                        {disable2faForm.errors.password}
                                    </p>
                                )}
                            </div>

                            <DialogFooter>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={() =>
                                        setConfirmingDisable2fa(false)
                                    }
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    variant="destructive"
                                    disabled={disable2faForm.processing}
                                >
                                    Disable 2FA
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            )}
        </AuthenticatedLayout>
    );
}
