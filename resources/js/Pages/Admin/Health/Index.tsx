import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/Components/ui/card';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, usePage } from '@inertiajs/react';
import {
    Activity,
    AlertTriangle,
    CheckCircle2,
    Database,
    RefreshCw,
    Server,
    Settings,
    XCircle,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface SystemMetric {
    total?: string;
    used?: string;
    free?: string;
    percent?: number;
    usage?: number;
}

interface SystemStats {
    cpu: { usage: number };
    ram: SystemMetric;
    disk: SystemMetric;
    info: {
        os: string;
        php_version: string;
        laravel_version: string;
        server_ip: string;
        server_time: string;
    };
}

interface LaravelStats {
    environment: string;
    debug_mode: boolean;
    queue_connection: string;
    pending_jobs: number;
    caches: {
        config: boolean;
        routes: boolean;
        events: boolean;
    };
}

interface DbStats {
    driver: string;
    database_name: string;
    table_count: number;
    size: string;
    size_bytes: number;
    status: string;
}

interface HealthPageProps {
    systemStats: SystemStats;
    laravelStats: LaravelStats;
    dbStats: DbStats;
}

function RadialProgress({
    value,
    label,
    colorClass = 'text-primary',
    subtext,
}: {
    value: number;
    label: string;
    colorClass?: string;
    subtext?: string;
}) {
    const radius = 36;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (value / 100) * circumference;

    return (
        <div className="bg-card hover:border-primary/30 flex flex-col items-center justify-center rounded-2xl border p-6 shadow-xs transition-all duration-300">
            <div className="relative h-28 w-28">
                <svg className="h-full w-full -rotate-90 transform">
                    <circle
                        cx="56"
                        cy="56"
                        r={radius}
                        className="text-muted/15 stroke-current"
                        strokeWidth="7"
                        fill="transparent"
                    />
                    <circle
                        cx="56"
                        cy="56"
                        r={radius}
                        className={`${colorClass} stroke-current transition-all duration-500 ease-out`}
                        strokeWidth="7"
                        fill="transparent"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                    />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-foreground text-2xl font-bold tracking-tight">
                        {value}%
                    </span>
                    {subtext && (
                        <span className="text-muted-foreground mt-0.5 text-[10px]">
                            {subtext}
                        </span>
                    )}
                </div>
            </div>
            <span className="text-muted-foreground mt-4 text-xs font-bold tracking-wider uppercase">
                {label}
            </span>
        </div>
    );
}

export default function Index({
    systemStats,
    laravelStats,
    dbStats,
}: HealthPageProps) {
    const [isRefreshing, setIsRefreshing] = useState(false);
    const { flash } = usePage().props as any;

    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
        }
        if (flash?.error) {
            toast.error(flash.error);
        }
    }, [flash]);

    const handleRefresh = () => {
        setIsRefreshing(true);
        router.reload({
            only: ['systemStats', 'laravelStats', 'dbStats'],
            onFinish: () => {
                setIsRefreshing(false);
                toast.success('System metrics updated successfully.');
            },
        });
    };

    const getCpuColor = (val: number) => {
        if (val < 50) return 'text-emerald-500';
        if (val < 80) return 'text-amber-500';
        return 'text-rose-500';
    };

    const getRamColor = (val: number) => {
        if (val < 65) return 'text-emerald-500';
        if (val < 85) return 'text-amber-500';
        return 'text-rose-500';
    };

    const getDiskColor = (val: number) => {
        if (val < 70) return 'text-emerald-500';
        if (val < 90) return 'text-amber-500';
        return 'text-rose-500';
    };

    return (
        <AuthenticatedLayout>
            <Head title="Server Health & Diagnostics" />

            <div className="mx-auto max-w-4xl space-y-6">
                {/* Header Banner */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
                            <Activity className="text-primary h-6 w-6" />
                            Server Health Monitor
                        </h1>
                        <p className="text-muted-foreground text-sm">
                            Real-time host system diagnostics, hardware
                            utilization, database statistics, and framework
                            configuration states.
                        </p>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleRefresh}
                        disabled={isRefreshing}
                        className="flex shrink-0 items-center gap-1.5 self-start sm:self-auto"
                    >
                        <RefreshCw
                            className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`}
                        />
                        Refresh Metrics
                    </Button>
                </div>

                {/* Core Metrics Radial Gauges */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <RadialProgress
                        value={systemStats.cpu.usage}
                        label="CPU Utilization"
                        colorClass={getCpuColor(systemStats.cpu.usage)}
                        subtext="Active Load"
                    />
                    <RadialProgress
                        value={systemStats.ram.percent ?? 0}
                        label="Memory (RAM) Usage"
                        colorClass={getRamColor(systemStats.ram.percent ?? 0)}
                        subtext={`${systemStats.ram.used} / ${systemStats.ram.total}`}
                    />
                    <RadialProgress
                        value={systemStats.disk.percent ?? 0}
                        label="Disk Space Usage"
                        colorClass={getDiskColor(systemStats.disk.percent ?? 0)}
                        subtext={`${systemStats.disk.used} / ${systemStats.disk.total}`}
                    />
                </div>

                {/* Main Content Layout */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    {/* Hardware & OS Specifications */}
                    <Card className="shadow-xs transition-all duration-300 hover:shadow-sm">
                        <CardHeader className="border-b border-dashed pb-3">
                            <CardTitle className="flex items-center gap-2 text-sm font-bold">
                                <Server className="text-primary h-4 w-4" />
                                Host System & Hardware
                            </CardTitle>
                            <CardDescription className="text-xs">
                                Specifications of the hosting server environment
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3.5 pt-4 text-xs">
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground font-medium">
                                    Operating System
                                </span>
                                <span className="text-foreground font-mono font-semibold">
                                    {systemStats.info.os}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground font-medium">
                                    PHP Version
                                </span>
                                <span className="text-foreground font-mono font-semibold">
                                    {systemStats.info.php_version}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground font-medium">
                                    Server IP Address
                                </span>
                                <span className="text-foreground font-mono font-semibold">
                                    {systemStats.info.server_ip}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground font-medium">
                                    Free Memory (RAM)
                                </span>
                                <span className="font-mono font-semibold text-emerald-500">
                                    {systemStats.ram.free}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground font-medium">
                                    Free Storage Space
                                </span>
                                <span className="font-mono font-semibold text-emerald-500">
                                    {systemStats.disk.free}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground font-medium">
                                    Server System Time
                                </span>
                                <span className="text-muted-foreground font-mono font-semibold">
                                    {systemStats.info.server_time}
                                </span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Laravel Performance Checklist */}
                    <Card className="shadow-xs transition-all duration-300 hover:shadow-sm">
                        <CardHeader className="border-b border-dashed pb-3">
                            <CardTitle className="flex items-center gap-2 text-sm font-bold">
                                <Settings className="text-primary h-4 w-4" />
                                Laravel Optimizer Status
                            </CardTitle>
                            <CardDescription className="text-xs">
                                Framework cache status and security mode
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3.5 pt-4 text-xs">
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground font-medium">
                                    App Environment
                                </span>
                                <Badge
                                    variant="outline"
                                    className="font-semibold capitalize"
                                >
                                    {laravelStats.environment}
                                </Badge>
                            </div>

                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground font-medium">
                                    Configuration Cache
                                </span>
                                {laravelStats.caches.config ? (
                                    <span className="flex items-center gap-1 font-semibold text-emerald-500">
                                        <CheckCircle2 className="h-4 w-4" />{' '}
                                        Cached
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-1 font-semibold text-amber-500">
                                        <AlertTriangle className="h-4 w-4" />{' '}
                                        Uncached
                                    </span>
                                )}
                            </div>

                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground font-medium">
                                    Route Cache
                                </span>
                                {laravelStats.caches.routes ? (
                                    <span className="flex items-center gap-1 font-semibold text-emerald-500">
                                        <CheckCircle2 className="h-4 w-4" />{' '}
                                        Cached
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-1 font-semibold text-amber-500">
                                        <AlertTriangle className="h-4 w-4" />{' '}
                                        Uncached
                                    </span>
                                )}
                            </div>

                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground font-medium">
                                    Debug Mode
                                </span>
                                {laravelStats.debug_mode ? (
                                    <Badge
                                        variant="destructive"
                                        className="py-0.2 flex items-center gap-1"
                                    >
                                        <AlertTriangle className="h-3 w-3" />{' '}
                                        Enabled (Development)
                                    </Badge>
                                ) : (
                                    <Badge
                                        variant="secondary"
                                        className="py-0.2 flex items-center gap-1 border-emerald-200 bg-emerald-50 text-emerald-600"
                                    >
                                        <CheckCircle2 className="h-3 w-3" />{' '}
                                        Disabled (Secure)
                                    </Badge>
                                )}
                            </div>

                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground font-medium">
                                    Queue Driver
                                </span>
                                <span className="text-foreground bg-muted py-0.2 rounded px-1.5 font-mono font-semibold uppercase">
                                    {laravelStats.queue_connection}
                                </span>
                            </div>

                            {laravelStats.queue_connection === 'database' && (
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground font-medium">
                                        Pending Queue Jobs
                                    </span>
                                    <span
                                        className={`font-mono font-semibold ${laravelStats.pending_jobs > 0 ? 'text-amber-500' : 'text-muted-foreground'}`}
                                    >
                                        {laravelStats.pending_jobs} jobs
                                    </span>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Database Health Card */}
                    <Card className="shadow-xs transition-all duration-300 hover:shadow-sm md:col-span-2">
                        <CardHeader className="border-b border-dashed pb-3">
                            <CardTitle className="flex items-center gap-2 text-sm font-bold">
                                <Database className="text-primary h-4 w-4" />
                                Database Telemetry
                            </CardTitle>
                            <CardDescription className="text-xs">
                                Relational database stats and physical space
                                parameters
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 gap-4 pt-4 text-xs sm:grid-cols-2 md:grid-cols-4">
                            <div className="bg-muted/20 flex flex-col rounded-xl border border-dashed p-3">
                                <span className="text-muted-foreground mb-1 font-medium">
                                    Status
                                </span>
                                {dbStats.status.startsWith('Connected') ? (
                                    <span className="mt-0.5 flex items-center gap-1 text-sm font-bold text-emerald-500">
                                        <CheckCircle2 className="h-4 w-4" />{' '}
                                        Running
                                    </span>
                                ) : (
                                    <span
                                        className="mt-0.5 flex items-center gap-1 text-sm font-bold text-rose-500"
                                        title={dbStats.status}
                                    >
                                        <XCircle className="h-4 w-4" />{' '}
                                        Connection Fail
                                    </span>
                                )}
                            </div>

                            <div className="bg-muted/20 flex flex-col rounded-xl border border-dashed p-3">
                                <span className="text-muted-foreground mb-1 font-medium">
                                    Database Engine
                                </span>
                                <span className="text-foreground mt-0.5 font-mono text-sm font-bold uppercase">
                                    {dbStats.driver}
                                </span>
                            </div>

                            <div className="bg-muted/20 flex flex-col rounded-xl border border-dashed p-3">
                                <span className="text-muted-foreground mb-1 font-medium">
                                    Active Schema Tables
                                </span>
                                <span className="text-foreground mt-0.5 font-mono text-lg font-bold">
                                    {dbStats.table_count}
                                </span>
                            </div>

                            <div className="bg-muted/20 flex flex-col rounded-xl border border-dashed p-3">
                                <span className="text-muted-foreground mb-1 font-medium">
                                    Storage Utilized
                                </span>
                                <span className="text-foreground mt-0.5 font-mono text-lg font-bold">
                                    {dbStats.size}
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
