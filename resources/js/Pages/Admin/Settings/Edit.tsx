import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import InputError from '@/Components/InputError';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Switch } from '@/Components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Head, useForm, router } from '@inertiajs/react';
import * as LucideIcons from 'lucide-react';
import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import MediaSelector from '@/Components/media/MediaSelector';

const { Settings, Globe, ShieldAlert, Mail, Wrench, Loader2, Send, Trash2, RefreshCw, Server, ShieldCheck, AlertCircle } = LucideIcons;

interface SettingsProps {
    settings: {
        app_name: string;
        app_description: string;
        timezone: string;
        date_format: string;
        default_theme: string;
        default_language: string;
        email_notifications: boolean;
        enable_registration: boolean;
        min_password_length: number;
        session_lifetime: number;
        mail_driver: string;
        mail_host: string;
        mail_port: string;
        mail_username: string;
        mail_password: string;
        mail_encryption: string;
        mail_from_address: string;
        mail_from_name: string;
        maintenance_mode: boolean;
        maintenance_bypass_ip: string;
        maintenance_message: string;
        // Branding additions
        app_logo_type?: string;
        app_logo_icon?: string;
        app_logo_image?: string;
        app_favicon?: string;
    };
}

const COMMON_TIMEZONES = [
    "UTC",
    "Asia/Kuala_Lumpur",
    "Asia/Singapore",
    "Asia/Tokyo",
    "Asia/Jakarta",
    "Asia/Bangkok",
    "Europe/London",
    "Europe/Paris",
    "America/New_York",
    "America/Chicago",
    "America/Los_Angeles",
    "Australia/Sydney"
];

const PRESET_ICONS = [
    'Sparkles', 'Activity', 'Shield', 'Layers', 'Terminal', 'Code2', 
    'Cpu', 'Briefcase', 'Compass', 'Globe', 'Database', 'Bookmark',
    'Flame', 'Zap', 'Workflow', 'Heart'
];

export default function Edit({ settings }: SettingsProps) {
    const { data, setData, post, processing, errors } = useForm({
        app_name: settings.app_name ?? '',
        app_description: settings.app_description ?? '',
        timezone: settings.timezone ?? 'Asia/Kuala_Lumpur',
        date_format: settings.date_format ?? 'Y-m-d',
        default_theme: settings.default_theme ?? 'system',
        default_language: settings.default_language ?? 'en',
        email_notifications: !!settings.email_notifications,
        enable_registration: !!settings.enable_registration,
        min_password_length: settings.min_password_length ?? 8,
        session_lifetime: settings.session_lifetime ?? 120,
        mail_driver: settings.mail_driver ?? 'log',
        mail_host: settings.mail_host ?? '',
        mail_port: settings.mail_port ?? '',
        mail_username: settings.mail_username ?? '',
        mail_password: settings.mail_password ?? '',
        mail_encryption: settings.mail_encryption ?? 'tls',
        mail_from_address: settings.mail_from_address ?? '',
        mail_from_name: settings.mail_from_name ?? '',
        maintenance_mode: !!settings.maintenance_mode,
        maintenance_bypass_ip: settings.maintenance_bypass_ip ?? '',
        maintenance_message: settings.maintenance_message ?? '',
        // Branding additions
        app_logo_type: settings.app_logo_type ?? 'icon',
        app_logo_icon: settings.app_logo_icon ?? 'Sparkles',
        app_logo_image_url: settings.app_logo_image ?? '',
        app_favicon_url: settings.app_favicon ?? '',
        app_logo_file: null as File | null,
        app_favicon_file: null as File | null,
        _method: 'PATCH',
    });

    const [testingSmtp, setTestingSmtp] = useState(false);
    const [clearingCache, setClearingCache] = useState<string | null>(null);

    // Dynamic Visual Previews local state
    const [logoPreview, setLogoPreview] = useState<string | null>(settings.app_logo_image || null);
    const [faviconPreview, setFaviconPreview] = useState<string | null>(settings.app_favicon || null);

    // Media Selector Modal state
    const [mediaModalOpen, setMediaModalOpen] = useState(false);
    const [mediaSelectTarget, setMediaSelectTarget] = useState<'logo' | 'favicon' | null>(null);

    const handleLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData('app_logo_file', file);
            setLogoPreview(URL.createObjectURL(file));
        }
    };

    const handleFaviconFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData('app_favicon_file', file);
            setFaviconPreview(URL.createObjectURL(file));
        }
    };

    const submit = (event: React.FormEvent) => {
        event.preventDefault();
        post(route('settings.update'), {
            forceFormData: true,
            onSuccess: () => {
                toast.success('System settings saved successfully.');
            },
            onError: () => {
                toast.error('Failed to save settings. Please check the inputs.');
            }
        });
    };

    const handleTestSmtp = async () => {
        setTestingSmtp(true);
        try {
            const response = await axios.post(route('settings.test-smtp'), {
                mail_driver: data.mail_driver,
                mail_host: data.mail_host,
                mail_port: data.mail_port,
                mail_username: data.mail_username,
                mail_password: data.mail_password,
                mail_encryption: data.mail_encryption,
                mail_from_address: data.mail_from_address,
                mail_from_name: data.mail_from_name,
            });
            if (response.data.success) {
                toast.success(response.data.message);
            }
        } catch (error: any) {
            const errMsg = error.response?.data?.message || 'SMTP Connection failed.';
            toast.error(errMsg, { duration: 5000 });
        } finally {
            setTestingSmtp(false);
        }
    };

    const handleClearCache = (type: string) => {
        setClearingCache(type);
        router.post(route('settings.clear-cache'), { type }, {
            onSuccess: (page) => {
                const flash = page.props.flash as { success?: string };
                toast.success(flash.success || 'Cache cleared successfully.');
                setClearingCache(null);
            },
            onError: () => {
                toast.error('Failed to execute cache clearing command.');
                setClearingCache(null);
            },
            preserveScroll: true
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title="System Settings" />
            <div className="max-w-5xl mx-auto space-y-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
                            <Settings className="h-6 w-6 text-primary animate-spin-slow" />
                            System Settings
                        </h1>
                        <p className="text-sm text-muted-foreground">Configure application defaults, localization, security policies, and system utilities.</p>
                    </div>

                    {data.maintenance_mode && (
                        <div className="flex items-center gap-2 rounded-full bg-amber-500/10 border border-amber-500/25 px-4 py-1.5 text-xs font-semibold text-amber-500 animate-pulse">
                            <ShieldAlert className="h-4 w-4" />
                            Maintenance Mode Active
                        </div>
                    )}
                </div>

                <form onSubmit={submit} className="space-y-6">
                    <Tabs defaultValue="general" className="w-full">
                        <TabsList className="bg-muted/80 grid w-full grid-cols-2 md:flex md:w-auto items-center justify-start gap-1 p-1 h-auto mb-6">
                            <TabsTrigger value="general" className="flex items-center gap-2 py-2.5 px-4">
                                <Settings className="h-4 w-4" />
                                General
                            </TabsTrigger>
                            <TabsTrigger value="regional" className="flex items-center gap-2 py-2.5 px-4">
                                <Globe className="h-4 w-4" />
                                Regional
                            </TabsTrigger>
                            <TabsTrigger value="security" className="flex items-center gap-2 py-2.5 px-4">
                                <ShieldCheck className="h-4 w-4" />
                                Security
                            </TabsTrigger>
                            <TabsTrigger value="email" className="flex items-center gap-2 py-2.5 px-4">
                                <Mail className="h-4 w-4" />
                                Email (SMTP)
                            </TabsTrigger>
                            <TabsTrigger value="maintenance" className="flex items-center gap-2 py-2.5 px-4">
                                <Wrench className="h-4 w-4" />
                                System & Maintenance
                            </TabsTrigger>
                        </TabsList>

                        {/* GENERAL TAB */}
                        <TabsContent value="general" className="space-y-6 outline-none animate-in fade-in duration-200">
                            <div className="grid gap-6 lg:grid-cols-3">
                                {/* Left column: Settings inputs */}
                                <div className="lg:col-span-2 space-y-6">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Branding & Details</CardTitle>
                                            <CardDescription>Customize the application identity and primary metadata.</CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-6">
                                            <div className="space-y-2">
                                                <Label htmlFor="app_name">Application Name</Label>
                                                <Input id="app_name" value={data.app_name} onChange={(event) => setData('app_name', event.target.value)} />
                                                <InputError message={errors.app_name} />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="app_description">Application Description</Label>
                                                <Textarea id="app_description" value={data.app_description} onChange={(event) => setData('app_description', event.target.value)} />
                                                <InputError message={errors.app_description} />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="default_theme">Default Theme Preset</Label>
                                                <Select value={data.default_theme} onValueChange={(value) => setData('default_theme', value)}>
                                                    <SelectTrigger id="default_theme"><SelectValue /></SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="system">System preference</SelectItem>
                                                        <SelectItem value="light">Light</SelectItem>
                                                        <SelectItem value="dark">Dark</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <InputError message={errors.default_theme} />
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* LOGO & FAVICON CARD */}
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Logo & Favicon Customization</CardTitle>
                                            <CardDescription>Manage your visual assets. You can choose a dynamic modern icon preset or upload custom images.</CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-6">
                                            {/* Logo Type Selector */}
                                            <div className="space-y-2">
                                                <Label className="text-sm font-semibold text-muted-foreground">Logo Style Type</Label>
                                                <div className="flex items-center gap-4 mt-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => setData('app_logo_type', 'icon')}
                                                        className={`flex-1 py-3 px-4 rounded-xl border text-sm font-medium transition-all ${
                                                            data.app_logo_type === 'icon'
                                                                ? 'border-primary bg-primary/5 text-primary ring-2 ring-primary/10'
                                                                : 'border-muted bg-card hover:bg-accent text-muted-foreground'
                                                        }`}
                                                    >
                                                        Lucide Icon Preset
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setData('app_logo_type', 'image')}
                                                        className={`flex-1 py-3 px-4 rounded-xl border text-sm font-medium transition-all ${
                                                            data.app_logo_type === 'image'
                                                                ? 'border-primary bg-primary/5 text-primary ring-2 ring-primary/10'
                                                                : 'border-muted bg-card hover:bg-accent text-muted-foreground'
                                                        }`}
                                                    >
                                                        Upload Custom Image
                                                    </button>
                                                </div>
                                            </div>

                                            {/* If logo type is Icon Preset */}
                                            {data.app_logo_type === 'icon' && (
                                                <div className="space-y-3 animate-in fade-in-50 duration-200">
                                                    <Label>Choose Logo Icon Preset</Label>
                                                    <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 p-3 bg-muted/40 rounded-xl border">
                                                        {PRESET_ICONS.map((iconName) => {
                                                            const Icon = (LucideIcons as any)[iconName] || LucideIcons.Sparkles;
                                                            const isSelected = data.app_logo_icon === iconName;
                                                            return (
                                                                <button
                                                                    key={iconName}
                                                                    type="button"
                                                                    onClick={() => setData('app_logo_icon', iconName)}
                                                                    className={`flex items-center justify-center p-2.5 rounded-lg border transition-all ${
                                                                        isSelected
                                                                            ? 'border-primary bg-primary text-primary-foreground scale-110 shadow-md ring-2 ring-primary/10'
                                                                            : 'border-muted hover:border-muted-foreground/30 hover:bg-accent bg-card text-muted-foreground'
                                                                    }`}
                                                                    title={iconName}
                                                                >
                                                                    <Icon className="h-5 w-5 shrink-0" />
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            )}

                                            {/* If logo type is Custom Image */}
                                            {data.app_logo_type === 'image' && (
                                                <div className="space-y-4 animate-in fade-in-50 duration-200">
                                                    <div className="space-y-2">
                                                        <Label htmlFor="logo_file">Upload Logo Image File</Label>
                                                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                                                            <Input
                                                                id="logo_file"
                                                                type="file"
                                                                accept="image/png, image/jpeg, image/svg+xml, image/webp"
                                                                onChange={handleLogoFileChange}
                                                                className="cursor-pointer flex-1"
                                                            />
                                                            <Button
                                                                type="button"
                                                                variant="outline"
                                                                onClick={() => {
                                                                    setMediaSelectTarget('logo');
                                                                    setMediaModalOpen(true);
                                                                }}
                                                                className="flex items-center gap-1.5"
                                                            >
                                                                <LucideIcons.Image className="h-4 w-4 shrink-0" />
                                                                Select from Library
                                                            </Button>
                                                        </div>
                                                        <p className="text-xs text-muted-foreground">Supported formats: PNG, JPG, SVG, WEBP. Max size: 2MB.</p>
                                                        <InputError message={errors.app_logo_file} />
                                                    </div>

                                                    <div className="space-y-2">
                                                        <Label htmlFor="app_logo_image_url">Or Image URL</Label>
                                                        <Input
                                                            id="app_logo_image_url"
                                                            placeholder="https://example.com/logo.png"
                                                            value={data.app_logo_image_url}
                                                            onChange={(e) => {
                                                                setData('app_logo_image_url', e.target.value);
                                                                setLogoPreview(e.target.value);
                                                            }}
                                                        />
                                                        <InputError message={errors.app_logo_image_url} />
                                                    </div>
                                                </div>
                                            )}

                                            {/* Favicon Customization */}
                                            <div className="border-t pt-6 space-y-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="favicon_file" className="text-base font-semibold">Favicon Asset</Label>
                                                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                                                        <Input
                                                            id="favicon_file"
                                                            type="file"
                                                            accept="image/x-icon, image/png, image/jpeg, image/svg+xml"
                                                            onChange={handleFaviconFileChange}
                                                            className="cursor-pointer flex-1"
                                                        />
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            onClick={() => {
                                                                setMediaSelectTarget('favicon');
                                                                setMediaModalOpen(true);
                                                            }}
                                                            className="flex items-center gap-1.5"
                                                        >
                                                            <LucideIcons.Image className="h-4 w-4 shrink-0" />
                                                            Select from Library
                                                        </Button>
                                                    </div>
                                                    <p className="text-xs text-muted-foreground">Supported formats: ICO, PNG, JPG, SVG. Max size: 1MB.</p>
                                                    <InputError message={errors.app_favicon_file} />
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="app_favicon_url">Or Favicon URL</Label>
                                                    <Input
                                                        id="app_favicon_url"
                                                        placeholder="https://example.com/favicon.ico"
                                                        value={data.app_favicon_url}
                                                        onChange={(e) => {
                                                            setData('app_favicon_url', e.target.value);
                                                            setFaviconPreview(e.target.value);
                                                        }}
                                                    />
                                                    <InputError message={errors.app_favicon_url} />
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* Right column: Sticky visual preview */}
                                <div className="space-y-6">
                                    <div className="sticky top-6">
                                        <Card className="overflow-hidden border-primary/10 shadow-lg">
                                            <div className="bg-primary/5 px-4 py-3 border-b border-primary/10">
                                                <h3 className="text-sm font-semibold text-primary flex items-center gap-1.5">
                                                    <LucideIcons.Sparkles className="h-4 w-4" />
                                                    Branding Live Preview
                                                </h3>
                                            </div>
                                            <CardContent className="p-6 space-y-6 bg-muted/10">
                                                {/* Sidebar Header Preview */}
                                                <div className="space-y-2">
                                                    <Label className="text-xs text-muted-foreground uppercase tracking-wider">Sidebar Identity Preview</Label>
                                                    <div className="flex items-center gap-3 p-3 bg-card border rounded-xl shadow-sm">
                                                        {data.app_logo_type === 'image' && logoPreview ? (
                                                            <img
                                                                src={logoPreview}
                                                                className="h-8 w-8 rounded-lg object-cover border"
                                                                alt="logo preview"
                                                                onError={(e) => {
                                                                    e.currentTarget.style.display = 'none';
                                                                }}
                                                            />
                                                        ) : (
                                                            <div className="flex h-8 w-8 items-center justify-center bg-primary/10 text-primary rounded-lg">
                                                                {(() => {
                                                                    const Icon = (LucideIcons as any)[data.app_logo_icon] || LucideIcons.Sparkles;
                                                                    return <Icon className="h-5 w-5 shrink-0 animate-pulse-slow" />;
                                                                })()}
                                                            </div>
                                                        )}
                                                        <div className="flex flex-col min-w-0">
                                                            <span className="font-bold text-sm text-foreground truncate">{data.app_name || 'Laravel'}</span>
                                                            <span className="text-[10px] text-muted-foreground leading-none">v1.0.0</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* App Title Tab Preview */}
                                                <div className="space-y-2">
                                                    <Label className="text-xs text-muted-foreground uppercase tracking-wider">Browser Tab Preview</Label>
                                                    <div className="flex items-center gap-2 px-3 py-2 bg-card border rounded-xl shadow-sm text-xs font-medium text-muted-foreground select-none max-w-full truncate">
                                                        <div className="h-4 w-4 bg-muted border rounded flex items-center justify-center shrink-0">
                                                            {faviconPreview ? (
                                                                <img src={faviconPreview} className="h-3.5 w-3.5 object-contain" alt="favicon" />
                                                            ) : (
                                                                <LucideIcons.Globe className="h-3 w-3" />
                                                            )}
                                                        </div>
                                                        <span className="truncate">{data.app_name || 'Laravel'} - System Settings</span>
                                                        <LucideIcons.X className="h-3 w-3 ml-auto hover:bg-muted p-0.5 rounded cursor-pointer shrink-0" />
                                                    </div>
                                                </div>

                                                {/* Auth / Login Page Preview */}
                                                <div className="space-y-2">
                                                    <Label className="text-xs text-muted-foreground uppercase tracking-wider">Auth Page Branding Preview</Label>
                                                    <div className="p-4 bg-card border rounded-xl shadow-sm flex flex-col items-center justify-center text-center space-y-2">
                                                        <div className="inline-flex items-center justify-center p-2.5 rounded-xl bg-primary/10 border border-primary/20 scale-95">
                                                            {data.app_logo_type === 'image' && logoPreview ? (
                                                                <img src={logoPreview} className="h-7 w-7 rounded-md object-cover" alt="logo" />
                                                            ) : (
                                                                (() => {
                                                                    const Icon = (LucideIcons as any)[data.app_logo_icon] || LucideIcons.Sparkles;
                                                                    return <Icon className="h-5 w-5 text-primary shrink-0" />;
                                                                })()
                                                            )}
                                                        </div>
                                                        <span className="font-bold text-xs text-foreground leading-none">{data.app_name || 'Laravel'}</span>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>
                                </div>
                            </div>
                        </TabsContent>

                        {/* REGIONAL TAB */}
                        <TabsContent value="regional" className="space-y-6 outline-none">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Regional & Localization</CardTitle>
                                    <CardDescription>Manage regional settings, timezone clocks, date formatting, and language options.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="grid gap-6 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="timezone">Timezone</Label>
                                            <Select value={data.timezone} onValueChange={(value) => setData('timezone', value)}>
                                                <SelectTrigger id="timezone"><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                    {COMMON_TIMEZONES.map((tz) => (
                                                        <SelectItem key={tz} value={tz}>{tz}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <InputError message={errors.timezone} />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="date_format">Date Format</Label>
                                            <Select value={data.date_format} onValueChange={(value) => setData('date_format', value)}>
                                                <SelectTrigger id="date_format"><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Y-m-d">YYYY-MM-DD</SelectItem>
                                                    <SelectItem value="d/m/Y">DD/MM/YYYY</SelectItem>
                                                    <SelectItem value="m/d/Y">MM/DD/YYYY</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <InputError message={errors.date_format} />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="default_language">Default System Language</Label>
                                        <Select value={data.default_language} onValueChange={(value) => setData('default_language', value)}>
                                            <SelectTrigger id="default_language"><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="en">English</SelectItem>
                                                <SelectItem value="ms">Bahasa Melayu</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <InputError message={errors.default_language} />
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* SECURITY TAB */}
                        <TabsContent value="security" className="space-y-6 outline-none">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Security & Access Policy</CardTitle>
                                    <CardDescription>Configure authentication preferences, account controls, and registration availability.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="flex items-center justify-between rounded-lg border p-4 bg-muted/20">
                                        <div>
                                            <Label htmlFor="enable_registration" className="text-base font-semibold">Enable Public Registration</Label>
                                            <p className="text-sm text-muted-foreground">Allow new visitors to register accounts from the landing portal.</p>
                                        </div>
                                        <Switch id="enable_registration" checked={data.enable_registration} onCheckedChange={(checked) => setData('enable_registration', checked)} />
                                    </div>

                                    <div className="flex items-center justify-between rounded-lg border p-4 bg-muted/20">
                                        <div>
                                            <Label htmlFor="email_notifications" className="text-base font-semibold">System Email Alerts</Label>
                                            <p className="text-sm text-muted-foreground">Dispatch mail notifications for audit events and setting changes to superadmins.</p>
                                        </div>
                                        <Switch id="email_notifications" checked={data.email_notifications} onCheckedChange={(checked) => setData('email_notifications', checked)} />
                                    </div>

                                    <div className="grid gap-6 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="min_password_length">Minimum Password Length</Label>
                                            <Input id="min_password_length" type="number" min="4" max="32" value={data.min_password_length} onChange={(event) => setData('min_password_length', parseInt(event.target.value) || 8)} />
                                            <InputError message={errors.min_password_length} />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="session_lifetime">Session Lifetime (Minutes)</Label>
                                            <Input id="session_lifetime" type="number" min="1" max="1440" value={data.session_lifetime} onChange={(event) => setData('session_lifetime', parseInt(event.target.value) || 120)} />
                                            <InputError message={errors.session_lifetime} />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* EMAIL TAB */}
                        <TabsContent value="email" className="space-y-6 outline-none">
                            <Card>
                                <CardHeader>
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <div>
                                            <CardTitle>Email Configurations</CardTitle>
                                            <CardDescription>Setup SMTP parameters to allow sending dynamic alert emails.</CardDescription>
                                        </div>
                                        <Button type="button" variant="outline" size="sm" onClick={handleTestSmtp} disabled={testingSmtp || processing} className="flex items-center gap-2">
                                            {testingSmtp ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                                            Test SMTP Connection
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="mail_driver">Mail Driver</Label>
                                        <Select value={data.mail_driver} onValueChange={(value) => setData('mail_driver', value)}>
                                            <SelectTrigger id="mail_driver"><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="log">Log File Only (Local Testing)</SelectItem>
                                                <SelectItem value="smtp">SMTP Relay Server</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <InputError message={errors.mail_driver} />
                                    </div>

                                    {data.mail_driver === 'smtp' && (
                                        <div className="space-y-6 animate-fade-in">
                                            <div className="grid gap-6 md:grid-cols-3">
                                                <div className="space-y-2 md:col-span-2">
                                                    <Label htmlFor="mail_host">SMTP Host Address</Label>
                                                    <Input id="mail_host" placeholder="e.g. smtp.mailtrap.io" value={data.mail_host || ''} onChange={(event) => setData('mail_host', event.target.value)} />
                                                    <InputError message={errors.mail_host} />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="mail_port">SMTP Port</Label>
                                                    <Input id="mail_port" type="number" placeholder="587" value={data.mail_port || ''} onChange={(event) => setData('mail_port', event.target.value)} />
                                                    <InputError message={errors.mail_port} />
                                                </div>
                                            </div>

                                            <div className="grid gap-6 md:grid-cols-2">
                                                <div className="space-y-2">
                                                    <Label htmlFor="mail_username">SMTP Username</Label>
                                                    <Input id="mail_username" placeholder="Mail username" value={data.mail_username || ''} onChange={(event) => setData('mail_username', event.target.value)} />
                                                    <InputError message={errors.mail_username} />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="mail_password">SMTP Password</Label>
                                                    <Input id="mail_password" type="password" placeholder="••••••••" value={data.mail_password || ''} onChange={(event) => setData('mail_password', event.target.value)} />
                                                    <InputError message={errors.mail_password} />
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="mail_encryption">Security Encryption</Label>
                                                <Select value={data.mail_encryption} onValueChange={(value) => setData('mail_encryption', value)}>
                                                    <SelectTrigger id="mail_encryption"><SelectValue /></SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="none">None (Insecure)</SelectItem>
                                                        <SelectItem value="tls">TLS (Recommended)</SelectItem>
                                                        <SelectItem value="ssl">SSL</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <InputError message={errors.mail_encryption} />
                                            </div>
                                        </div>
                                    )}

                                    <div className="grid gap-6 md:grid-cols-2 border-t pt-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="mail_from_address">Sender Email Address</Label>
                                            <Input id="mail_from_address" type="email" placeholder="noreply@example.com" value={data.mail_from_address} onChange={(event) => setData('mail_from_address', event.target.value)} />
                                            <InputError message={errors.mail_from_address} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="mail_from_name">Sender Name</Label>
                                            <Input id="mail_from_name" placeholder="Laravel App" value={data.mail_from_name} onChange={(event) => setData('mail_from_name', event.target.value)} />
                                            <InputError message={errors.mail_from_name} />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* MAINTENANCE TAB */}
                        <TabsContent value="maintenance" className="space-y-6 outline-none">
                            <Card className="border-amber-500/20">
                                <CardHeader className="bg-amber-500/[0.02]">
                                    <CardTitle className="text-amber-500 flex items-center gap-2">
                                        <Server className="h-5 w-5" />
                                        Maintenance & Operations
                                    </CardTitle>
                                    <CardDescription>Activate maintenance screens and manage local system optimization parameters.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6 pt-6">
                                    <div className="flex items-center justify-between rounded-lg border border-amber-500/25 p-4 bg-amber-500/[0.03]">
                                        <div>
                                            <Label htmlFor="maintenance_mode" className="text-base font-semibold text-amber-600 dark:text-amber-500">Enable Maintenance Mode</Label>
                                            <p className="text-sm text-muted-foreground">Locks out guest visitors. Admins can bypass via active login sessions or specific IPs.</p>
                                        </div>
                                        <Switch id="maintenance_mode" checked={data.maintenance_mode} onCheckedChange={(checked) => setData('maintenance_mode', checked)} />
                                    </div>

                                    {data.maintenance_mode && (
                                        <div className="space-y-4 animate-fade-in">
                                            <div className="space-y-2">
                                                <Label htmlFor="maintenance_message">Custom Maintenance Message</Label>
                                                <Textarea id="maintenance_message" value={data.maintenance_message} onChange={(event) => setData('maintenance_message', event.target.value)} />
                                                <InputError message={errors.maintenance_message} />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="maintenance_bypass_ip">IP Address Bypass List</Label>
                                                <Input id="maintenance_bypass_ip" placeholder="e.g. 127.0.0.1, 192.168.1.1 (comma separated)" value={data.maintenance_bypass_ip} onChange={(event) => setData('maintenance_bypass_ip', event.target.value)} />
                                                <InputError message={errors.maintenance_bypass_ip} />
                                                <p className="text-xs text-muted-foreground">Add specific IP addresses that can bypass the maintenance lockouts.</p>
                                            </div>
                                        </div>
                                    )}

                                    {/* CACHE CLEARS */}
                                    <div className="border-t pt-6 space-y-4">
                                        <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">System Cache Utilities</h3>
                                        <p className="text-xs text-muted-foreground">Clear cached data files to update code changes or refresh system states.</p>
                                        
                                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                            <Button type="button" variant="outline" size="sm" onClick={() => handleClearCache('application')} disabled={clearingCache !== null} className="w-full">
                                                {clearingCache === 'application' ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Trash2 className="h-4 w-4 mr-2" />}
                                                Clear Application Cache
                                            </Button>

                                            <Button type="button" variant="outline" size="sm" onClick={() => handleClearCache('route')} disabled={clearingCache !== null} className="w-full">
                                                {clearingCache === 'route' ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <RefreshCw className="h-4 w-4 mr-2" />}
                                                Clear Route Cache
                                            </Button>

                                            <Button type="button" variant="outline" size="sm" onClick={() => handleClearCache('view')} disabled={clearingCache !== null} className="w-full">
                                                {clearingCache === 'view' ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Trash2 className="h-4 w-4 mr-2" />}
                                                Clear View Cache
                                            </Button>

                                            <Button type="button" variant="destructive" size="sm" onClick={() => handleClearCache('all')} disabled={clearingCache !== null} className="w-full">
                                                {clearingCache === 'all' ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Trash2 className="h-4 w-4 mr-2" />}
                                                Optimize & Clear All
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>

                    <div className="flex justify-end border-t pt-6">
                        <Button type="submit" disabled={processing}>{processing ? 'Saving...' : 'Save System Settings'}</Button>
                    </div>
                </form>
            </div>

            <MediaSelector
                open={mediaModalOpen}
                onOpenChange={setMediaModalOpen}
                allowedTypes={mediaSelectTarget === 'logo' || mediaSelectTarget === 'favicon' ? 'image' : 'all'}
                onSelect={(file) => {
                    if (mediaSelectTarget === 'logo') {
                        setData('app_logo_image_url', file.url);
                        setLogoPreview(file.url);
                    } else if (mediaSelectTarget === 'favicon') {
                        setData('app_favicon_url', file.url);
                        setFaviconPreview(file.url);
                    }
                }}
            />
        </AuthenticatedLayout>
    );
}
