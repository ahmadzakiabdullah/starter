import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link, router, usePage } from '@inertiajs/react';
import React, { useState } from 'react';
import { toast } from 'sonner';
import { 
    User, 
    Lock, 
    ShieldCheck, 
    Laptop, 
    Smartphone, 
    AlertTriangle, 
    CheckCircle, 
    QrCode, 
    LogOut,
    Eye,
    EyeOff,
    Key
} from 'lucide-react';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';
import SessionsManager from './Partials/SessionsManager';
import ApiTokenManager from './Partials/ApiTokenManager';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/Components/ui/dialog';

interface SessionItem {
    id: string;
    ip_address: string | null;
    browser: string;
    platform: string;
    is_current: boolean;
    last_active: string;
}

interface EditProps {
    mustVerifyEmail: boolean;
    status?: string;
    sessions: SessionItem[];
    twoFactorEnabled: boolean;
    twoFactorSecret: string | null;
    twoFactorQrCodeUrl: string | null;
}

export default function Edit({
    mustVerifyEmail,
    status,
    sessions,
    twoFactorEnabled,
    twoFactorSecret,
    twoFactorQrCodeUrl
}: EditProps) {
    const [activeTab, setActiveTab] = useState('profile');
    const [confirmingDisable2fa, setConfirmingDisable2fa] = useState(false);

    // 2FA forms
    const enable2faForm = useForm({});
    const confirm2faForm = useForm({
        code: ''
    });
    const disable2faForm = useForm({
        password: ''
    });

    const handleEnable2fa = () => {
        enable2faForm.post(route('profile.two-factor.enable'), {
            onSuccess: () => {
                toast.success('Scan the QR code to confirm and link Google Authenticator.');
            }
        });
    };

    const handleConfirm2fa = (e: React.FormEvent) => {
        e.preventDefault();
        confirm2faForm.post(route('profile.two-factor.confirm'), {
            onSuccess: () => {
                confirm2faForm.reset();
                toast.success('Two-Factor Authentication enabled successfully.');
            },
            onError: () => {
                toast.error('Incorrect code. Please check your authenticator app.');
            }
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
            }
        });
    };

    const { props: pageProps } = usePage();
    const system = pageProps.system as any;
    const showSessions = system?.module_active_sessions !== false;
    const showApiKeys = system?.module_api_keys !== false;

    return (
        <AuthenticatedLayout>
            <Head title="Profile Settings" />

            <div className="max-w-4xl mx-auto space-y-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Account Profile Settings</h1>
                    <p className="text-sm text-muted-foreground">
                        Manage your profile details, secure credentials, 2FA locks, and logged sessions.
                    </p>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                    <TabsList className="grid grid-cols-2 md:flex md:w-auto bg-muted p-1 rounded-lg">
                        <TabsTrigger value="profile" className="flex items-center gap-1.5 text-xs py-2 px-4 rounded">
                            <User className="h-4 w-4" />
                            General Details
                        </TabsTrigger>
                        <TabsTrigger value="password" className="flex items-center gap-1.5 text-xs py-2 px-4 rounded">
                            <Lock className="h-4 w-4" />
                            Change Password
                        </TabsTrigger>
                        <TabsTrigger value="2fa" className="flex items-center gap-1.5 text-xs py-2 px-4 rounded">
                            <ShieldCheck className="h-4 w-4" />
                            Two-Factor Auth
                        </TabsTrigger>
                        {showSessions && (
                            <TabsTrigger value="sessions" className="flex items-center gap-1.5 text-xs py-2 px-4 rounded">
                                <Laptop className="h-4 w-4" />
                                Active Devices
                            </TabsTrigger>
                        )}
                        {showApiKeys && (
                            <TabsTrigger value="api-tokens" className="flex items-center gap-1.5 text-xs py-2 px-4 rounded">
                                <Key className="h-4 w-4" />
                                API Access Keys
                            </TabsTrigger>
                        )}
                    </TabsList>

                    {/* GENERAL DETAILS TAB */}
                    <TabsContent value="profile" className="space-y-6">
                        <div className="bg-card p-6 border rounded-xl shadow-xs">
                            <UpdateProfileInformationForm
                                mustVerifyEmail={mustVerifyEmail}
                                status={status}
                                className="max-w-xl"
                            />
                        </div>
                        <div className="bg-card p-6 border border-destructive/20 rounded-xl shadow-xs">
                            <DeleteUserForm className="max-w-xl" />
                        </div>
                    </TabsContent>

                    {/* PASSWORD TAB */}
                    <TabsContent value="password">
                        <div className="bg-card p-6 border rounded-xl shadow-xs">
                            <UpdatePasswordForm className="max-w-xl" />
                        </div>
                    </TabsContent>

                    {/* TWO-FACTOR AUTH TAB */}
                    <TabsContent value="2fa">
                        <div className="bg-card p-6 border rounded-xl shadow-xs space-y-6">
                            <div>
                                <h3 className="text-base font-bold text-foreground">Two-Factor Authentication (2FA)</h3>
                                <p className="text-xs text-muted-foreground mt-1 leading-relaxed max-w-xl">
                                    Adds an extra layer of defense to your profile. Once enabled, logging in requires entering a 6-digit OTP code generated by your Google Authenticator app.
                                </p>
                            </div>

                            {twoFactorEnabled ? (
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/20 text-green-500 text-xs font-semibold rounded-lg max-w-md">
                                        <CheckCircle className="h-5 w-5 shrink-0" />
                                        <span>Two-factor authentication is active on your profile.</span>
                                    </div>
                                    <Button 
                                        variant="destructive" 
                                        size="sm"
                                        onClick={() => setConfirmingDisable2fa(true)}
                                    >
                                        Disable 2FA Lock
                                    </Button>
                                </div>
                            ) : twoFactorQrCodeUrl ? (
                                <div className="grid gap-6 md:grid-cols-2 border rounded-xl p-4 bg-muted/10">
                                    <div className="flex flex-col items-center justify-center bg-white dark:bg-slate-950 p-4 border border-dashed rounded-lg">
                                        {/* Render QR code via Google APIs / QRServer client side */}
                                        <img 
                                            src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(twoFactorQrCodeUrl)}`} 
                                            alt="Google Authenticator QR Code"
                                            className="h-44 w-44 object-contain shadow-xs border rounded p-1.5 bg-white"
                                        />
                                        <div className="text-[10px] font-mono text-muted-foreground mt-2 break-all bg-muted py-1 px-2 rounded select-all font-semibold max-w-full">
                                            Secret: {twoFactorSecret}
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="space-y-1.5">
                                            <h4 className="text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                                                <QrCode className="h-4 w-4 text-primary" />
                                                Confirm Authenticator Setup
                                            </h4>
                                            <p className="text-xs text-muted-foreground leading-relaxed">
                                                1. Scan the QR code using Google Authenticator, Authy, or Duo.<br />
                                                2. Enter the generated 6-digit confirmation code below to link the device.
                                            </p>
                                        </div>

                                        <form onSubmit={handleConfirm2fa} className="space-y-3.5 max-w-xs">
                                            <div className="space-y-1">
                                                <Label htmlFor="code" className="text-[10px] font-bold uppercase tracking-wider">OTP Code</Label>
                                                <Input
                                                    id="code"
                                                    placeholder="e.g. 123456"
                                                    value={confirm2faForm.data.code}
                                                    onChange={e => confirm2faForm.setData('code', e.target.value.replace(/\D/g, ''))}
                                                    className="font-mono text-center tracking-[0.2em] font-semibold text-sm"
                                                    maxLength={6}
                                                    required
                                                />
                                                {confirm2faForm.errors.code && (
                                                    <p className="text-red-500 text-[10px]">{confirm2faForm.errors.code}</p>
                                                )}
                                            </div>
                                            <div className="flex gap-2">
                                                <Button type="submit" size="sm" disabled={confirm2faForm.processing}>
                                                    Confirm & Save
                                                </Button>
                                                <Button 
                                                    type="button" 
                                                    variant="outline" 
                                                    size="sm"
                                                    onClick={() => router.get(route('profile.edit'))}
                                                >
                                                    Cancel
                                                </Button>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 p-3 bg-muted border border-muted/50 text-muted-foreground text-xs font-semibold rounded-lg max-w-md">
                                        <AlertTriangle className="h-5 w-5 shrink-0" />
                                        <span>Two-factor authentication is currently disabled.</span>
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
                <Dialog open={confirmingDisable2fa} onOpenChange={() => setConfirmingDisable2fa(false)}>
                    <DialogContent className="sm:rounded-xl">
                        <form onSubmit={handleDisable2fa}>
                            <DialogHeader>
                                <DialogTitle className="flex items-center gap-2 text-destructive">
                                    <AlertTriangle className="h-5 w-5" />
                                    Disable Two-Factor Authentication
                                </DialogTitle>
                                <DialogDescription>
                                    To secure this request, please confirm your current account password below.
                                </DialogDescription>
                            </DialogHeader>

                            <div className="my-4 space-y-1.5">
                                <Label htmlFor="disable_pwd">Current Password</Label>
                                <Input
                                    id="disable_pwd"
                                    type="password"
                                    placeholder="Enter password..."
                                    value={disable2faForm.data.password}
                                    onChange={e => disable2faForm.setData('password', e.target.value)}
                                    required
                                />
                                {disable2faForm.errors.password && (
                                    <p className="text-red-500 text-[10px]">{disable2faForm.errors.password}</p>
                                )}
                            </div>

                            <DialogFooter>
                                <Button type="button" variant="ghost" onClick={() => setConfirmingDisable2fa(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit" variant="destructive" disabled={disable2faForm.processing}>
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
