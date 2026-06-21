import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Head, router, usePage } from '@inertiajs/react';
import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { 
    Activity, 
    Cpu, 
    HardDrive, 
    RefreshCw, 
    Server, 
    Settings, 
    Database,
    CheckCircle2, 
    XCircle, 
    AlertTriangle,
    Info
} from 'lucide-react';
import { Badge } from '@/Components/ui/badge';

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

function RadialProgress({ value, label, colorClass = "text-primary", subtext }: { value: number; label: string; colorClass?: string; subtext?: string }) {
    const radius = 36;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (value / 100) * circumference;

    return (
        <div className="flex flex-col items-center justify-center p-6 bg-card border rounded-2xl shadow-xs transition-all duration-300 hover:border-primary/30">
            <div className="relative w-28 h-28">
                <svg className="w-full h-full transform -rotate-90">
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
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                    <span className="text-2xl font-bold tracking-tight text-foreground">{value}%</span>
                    {subtext && <span className="text-[10px] text-muted-foreground mt-0.5">{subtext}</span>}
                </div>
            </div>
            <span className="mt-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">{label}</span>
        </div>
    );
}

export default function Index({ systemStats, laravelStats, dbStats }: HealthPageProps) {
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
            }
        });
    };

    const getCpuColor = (val: number) => {
        if (val < 50) return "text-emerald-500";
        if (val < 80) return "text-amber-500";
        return "text-rose-500";
    };

    const getRamColor = (val: number) => {
        if (val < 65) return "text-emerald-500";
        if (val < 85) return "text-amber-500";
        return "text-rose-500";
    };

    const getDiskColor = (val: number) => {
        if (val < 70) return "text-emerald-500";
        if (val < 90) return "text-amber-500";
        return "text-rose-500";
    };

    return (
        <AuthenticatedLayout>
            <Head title="Server Health & Diagnostics" />

            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header Banner */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
                            <Activity className="h-6 w-6 text-primary" />
                            Server Health Monitor
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Real-time host system diagnostics, hardware utilization, database statistics, and framework configuration states.
                        </p>
                    </div>
                    <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={handleRefresh}
                        disabled={isRefreshing}
                        className="shrink-0 flex items-center gap-1.5 self-start sm:self-auto"
                    >
                        <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                        Refresh Metrics
                    </Button>
                </div>

                {/* Core Metrics Radial Gauges */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Hardware & OS Specifications */}
                    <Card className="shadow-xs hover:shadow-sm transition-all duration-300">
                        <CardHeader className="pb-3 border-b border-dashed">
                            <CardTitle className="text-sm font-bold flex items-center gap-2">
                                <Server className="h-4 w-4 text-primary" />
                                Host System & Hardware
                            </CardTitle>
                            <CardDescription className="text-xs">Specifications of the hosting server environment</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-4 space-y-3.5 text-xs">
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground font-medium">Operating System</span>
                                <span className="font-semibold text-foreground font-mono">{systemStats.info.os}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground font-medium">PHP Version</span>
                                <span className="font-semibold text-foreground font-mono">{systemStats.info.php_version}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground font-medium">Server IP Address</span>
                                <span className="font-semibold text-foreground font-mono">{systemStats.info.server_ip}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground font-medium">Free Memory (RAM)</span>
                                <span className="font-semibold text-emerald-500 font-mono">{systemStats.ram.free}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground font-medium">Free Storage Space</span>
                                <span className="font-semibold text-emerald-500 font-mono">{systemStats.disk.free}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground font-medium">Server System Time</span>
                                <span className="font-semibold text-muted-foreground font-mono">{systemStats.info.server_time}</span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Laravel Performance Checklist */}
                    <Card className="shadow-xs hover:shadow-sm transition-all duration-300">
                        <CardHeader className="pb-3 border-b border-dashed">
                            <CardTitle className="text-sm font-bold flex items-center gap-2">
                                <Settings className="h-4 w-4 text-primary" />
                                Laravel Optimizer Status
                            </CardTitle>
                            <CardDescription className="text-xs">Framework cache status and security mode</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-4 space-y-3.5 text-xs">
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground font-medium">App Environment</span>
                                <Badge variant="outline" className="capitalize font-semibold">
                                    {laravelStats.environment}
                                </Badge>
                            </div>
                            
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground font-medium">Configuration Cache</span>
                                {laravelStats.caches.config ? (
                                    <span className="flex items-center gap-1 text-emerald-500 font-semibold">
                                        <CheckCircle2 className="h-4 w-4" /> Cached
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-1 text-amber-500 font-semibold">
                                        <AlertTriangle className="h-4 w-4" /> Uncached
                                    </span>
                                )}
                            </div>

                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground font-medium">Route Cache</span>
                                {laravelStats.caches.routes ? (
                                    <span className="flex items-center gap-1 text-emerald-500 font-semibold">
                                        <CheckCircle2 className="h-4 w-4" /> Cached
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-1 text-amber-500 font-semibold">
                                        <AlertTriangle className="h-4 w-4" /> Uncached
                                    </span>
                                )}
                            </div>

                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground font-medium">Debug Mode</span>
                                {laravelStats.debug_mode ? (
                                    <Badge variant="destructive" className="flex items-center gap-1 py-0.2">
                                        <AlertTriangle className="h-3 w-3" /> Enabled (Development)
                                    </Badge>
                                ) : (
                                    <Badge variant="secondary" className="flex items-center gap-1 py-0.2 text-emerald-600 bg-emerald-50 border-emerald-200">
                                        <CheckCircle2 className="h-3 w-3" /> Disabled (Secure)
                                    </Badge>
                                )}
                            </div>

                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground font-medium">Queue Driver</span>
                                <span className="font-semibold text-foreground font-mono uppercase bg-muted px-1.5 py-0.2 rounded">
                                    {laravelStats.queue_connection}
                                </span>
                            </div>

                            {laravelStats.queue_connection === 'database' && (
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground font-medium">Pending Queue Jobs</span>
                                    <span className={`font-semibold font-mono ${laravelStats.pending_jobs > 0 ? 'text-amber-500' : 'text-muted-foreground'}`}>
                                        {laravelStats.pending_jobs} jobs
                                    </span>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Database Health Card */}
                    <Card className="shadow-xs hover:shadow-sm transition-all duration-300 md:col-span-2">
                        <CardHeader className="pb-3 border-b border-dashed">
                            <CardTitle className="text-sm font-bold flex items-center gap-2">
                                <Database className="h-4 w-4 text-primary" />
                                Database Telemetry
                            </CardTitle>
                            <CardDescription className="text-xs">Relational database stats and physical space parameters</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                            <div className="flex flex-col bg-muted/20 border border-dashed rounded-xl p-3">
                                <span className="text-muted-foreground font-medium mb-1">Status</span>
                                {dbStats.status.startsWith('Connected') ? (
                                    <span className="font-bold text-emerald-500 flex items-center gap-1 text-sm mt-0.5">
                                        <CheckCircle2 className="h-4 w-4" /> Running
                                    </span>
                                ) : (
                                    <span className="font-bold text-rose-500 flex items-center gap-1 text-sm mt-0.5" title={dbStats.status}>
                                        <XCircle className="h-4 w-4" /> Connection Fail
                                    </span>
                                )}
                            </div>

                            <div className="flex flex-col bg-muted/20 border border-dashed rounded-xl p-3">
                                <span className="text-muted-foreground font-medium mb-1">Database Engine</span>
                                <span className="font-bold text-foreground text-sm mt-0.5 font-mono uppercase">
                                    {dbStats.driver}
                                </span>
                            </div>

                            <div className="flex flex-col bg-muted/20 border border-dashed rounded-xl p-3">
                                <span className="text-muted-foreground font-medium mb-1">Active Schema Tables</span>
                                <span className="font-bold text-foreground text-lg mt-0.5 font-mono">
                                    {dbStats.table_count}
                                </span>
                            </div>

                            <div className="flex flex-col bg-muted/20 border border-dashed rounded-xl p-3">
                                <span className="text-muted-foreground font-medium mb-1">Storage Utilized</span>
                                <span className="font-bold text-foreground text-lg mt-0.5 font-mono">
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
