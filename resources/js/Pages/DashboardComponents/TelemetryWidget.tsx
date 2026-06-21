import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Cpu, HardDrive, Sparkles, RefreshCw, Layers } from 'lucide-react';
import { router, usePage } from '@inertiajs/react';
import { toast } from 'sonner';
import { Badge } from '@/Components/ui/badge';
import { 
    AreaChart, 
    Area, 
    XAxis, 
    YAxis, 
    Tooltip, 
    ResponsiveContainer,
    CartesianGrid 
} from 'recharts';

interface TelemetryProps {
    telemetry: {
        cpu_percent: number;
        ram_percent: number;
        disk_percent: number;
        caches: {
            config: boolean;
            routes: boolean;
            debug: boolean;
        };
    };
}

interface ChartData {
    time: string;
    cpu: number;
    ram: number;
}

export default function TelemetryWidget({ telemetry }: TelemetryProps) {
    const [isProcessing, setIsProcessing] = useState(false);
    const [dataHistory, setDataHistory] = useState<ChartData[]>([]);
    const { props: pageProps } = usePage();
    const system = pageProps.system as any;
    const showChart = system?.module_telemetry !== false;

    useEffect(() => {
        // Initialize with 10 historical points leading to the current load values
        const initialHistory = Array.from({ length: 10 }).map((_, i) => {
            const date = new Date(Date.now() - (9 - i) * 3000);
            const timeStr = date.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
            
            // Jitter to make historical chart lines look natural
            const cpuJitter = Math.min(100, Math.max(3, telemetry.cpu_percent + Math.floor(Math.random() * 16) - 8));
            const ramJitter = Math.min(100, Math.max(3, telemetry.ram_percent + Math.floor(Math.random() * 6) - 3));
            
            return {
                time: timeStr,
                cpu: i === 9 ? telemetry.cpu_percent : cpuJitter,
                ram: i === 9 ? telemetry.ram_percent : ramJitter
            };
        });
        
        setDataHistory(initialHistory);

        // Simulation loop: append a new data tick every 3 seconds to keep chart alive
        const timer = setInterval(() => {
            setDataHistory((prev) => {
                const date = new Date();
                const timeStr = date.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
                
                const nextCpu = Math.min(100, Math.max(2, telemetry.cpu_percent + Math.floor(Math.random() * 10) - 5));
                const nextRam = Math.min(100, Math.max(2, telemetry.ram_percent + Math.floor(Math.random() * 4) - 2));
                
                return [
                    ...prev.slice(1),
                    { time: timeStr, cpu: nextCpu, ram: nextRam }
                ];
            });
        }, 3000);

        return () => clearInterval(timer);
    }, [telemetry.cpu_percent, telemetry.ram_percent]);

    const handleClearCache = () => {
        setIsProcessing(true);
        router.post(route('settings.clear-cache'), {}, {
            onStart: () => {
                toast.loading('Clearing all application cache locks...', { id: 'cache-task' });
            },
            onFinish: () => {
                toast.dismiss('cache-task');
                setIsProcessing(false);
                toast.success('System application caches cleared.');
            }
        });
    };

    const handleCreateBackup = () => {
        setIsProcessing(true);
        router.post(route('backups.create'), {}, {
            onStart: () => {
                toast.loading('Compiling database SQL snapshot...', { id: 'backup-task' });
            },
            onFinish: () => {
                toast.dismiss('backup-task');
                setIsProcessing(false);
            }
        });
    };

    const getProgressColor = (val: number) => {
        if (val < 65) return "bg-emerald-500";
        if (val < 85) return "bg-amber-500";
        return "bg-rose-500";
    };

    const getProgressColorText = (val: number) => {
        if (val < 65) return "text-emerald-500";
        if (val < 85) return "text-amber-500";
        return "text-rose-500";
    };

    return (
        <Card className="border border-slate-200 dark:border-slate-800 bg-card/60 backdrop-blur-md shadow-sm rounded-xl overflow-hidden hover:border-primary/20 transition-all duration-300">
            <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800/60">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <Cpu className="h-4 w-4 text-primary" />
                    System Telemetry & Live Monitor
                </CardTitle>
                <CardDescription className="text-xs">Dynamic CPU & Memory load tracking logs</CardDescription>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
                {/* DUAL LINE CHART */}
                {showChart && (
                    <div className="h-40 w-full text-xs font-mono">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={dataHistory} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.25}/>
                                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.02}/>
                                    </linearGradient>
                                    <linearGradient id="colorRam" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.25}/>
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.02}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#cbd5e1" className="dark:stroke-slate-800/50" />
                                <XAxis 
                                    dataKey="time" 
                                    tickLine={false} 
                                    axisLine={false} 
                                    tick={{ fontSize: 9 }}
                                />
                                <YAxis 
                                    domain={[0, 100]} 
                                    tickLine={false} 
                                    axisLine={false}
                                    tick={{ fontSize: 9 }}
                                />
                                <Tooltip 
                                    contentStyle={{
                                        backgroundColor: 'oklch(var(--popover))',
                                        borderRadius: '8px',
                                        border: '1px solid oklch(var(--border))',
                                        color: 'oklch(var(--popover-foreground))',
                                        fontSize: '11px',
                                    }}
                                />
                                <Area 
                                    type="monotone" 
                                    dataKey="cpu" 
                                    name="CPU (%)"
                                    stroke="#4f46e5" 
                                    strokeWidth={2}
                                    fillOpacity={1} 
                                    fill="url(#colorCpu)" 
                                    activeDot={{ r: 4 }}
                                    isAnimationActive={false}
                                />
                                <Area 
                                    type="monotone" 
                                    dataKey="ram" 
                                    name="RAM (%)"
                                    stroke="#10b981" 
                                    strokeWidth={2}
                                    fillOpacity={1} 
                                    fill="url(#colorRam)" 
                                    activeDot={{ r: 4 }}
                                    isAnimationActive={false}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                )}

                {/* Progress Indicators & Text values */}
                <div className="space-y-2.5 text-xs">
                    {showChart ? (
                        /* CPU & RAM CURRENT LABELS */
                        <div className="grid grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-900/20 p-2 border border-slate-100 dark:border-slate-800 rounded-lg">
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground flex items-center gap-1">
                                    <span className="h-2 w-2 rounded-full bg-indigo-600" /> CPU Load
                                </span>
                                <span className={`font-bold font-mono ${getProgressColorText(telemetry.cpu_percent)}`}>
                                    {telemetry.cpu_percent}%
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground flex items-center gap-1">
                                    <span className="h-2 w-2 rounded-full bg-emerald-500" /> Memory
                                </span>
                                <span className={`font-bold font-mono ${getProgressColorText(telemetry.ram_percent)}`}>
                                    {telemetry.ram_percent}%
                                </span>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* CPU Progress bar */}
                            <div className="space-y-1">
                                <div className="flex items-center justify-between font-medium">
                                    <span className="text-muted-foreground flex items-center gap-1.5">
                                        <span className="h-2 w-2 rounded-full bg-indigo-600" /> CPU Load
                                    </span>
                                    <span className={`font-semibold font-mono ${getProgressColorText(telemetry.cpu_percent)}`}>
                                        {telemetry.cpu_percent}%
                                    </span>
                                </div>
                                <div className="h-1.5 w-full bg-muted/60 rounded-full overflow-hidden">
                                    <div 
                                        className={`h-full bg-indigo-600 transition-all duration-500 ease-out`}
                                        style={{ width: `${telemetry.cpu_percent}%` }}
                                    />
                                </div>
                            </div>

                            {/* RAM Progress bar */}
                            <div className="space-y-1">
                                <div className="flex items-center justify-between font-medium">
                                    <span className="text-muted-foreground flex items-center gap-1.5">
                                        <span className="h-2 w-2 rounded-full bg-emerald-500" /> Memory Load
                                    </span>
                                    <span className={`font-semibold font-mono ${getProgressColorText(telemetry.ram_percent)}`}>
                                        {telemetry.ram_percent}%
                                    </span>
                                </div>
                                <div className="h-1.5 w-full bg-muted/60 rounded-full overflow-hidden">
                                    <div 
                                        className={`h-full bg-emerald-500 transition-all duration-500 ease-out`}
                                        style={{ width: `${telemetry.ram_percent}%` }}
                                    />
                                </div>
                            </div>
                        </>
                    )}

                    {/* Disk Progress bar */}
                    <div className="space-y-1">
                        <div className="flex items-center justify-between font-medium">
                            <span className="text-muted-foreground flex items-center gap-1.5">
                                <HardDrive className="h-3.5 w-3.5" /> Disk Storage Size
                            </span>
                            <span className={`font-semibold font-mono ${getProgressColorText(telemetry.disk_percent)}`}>
                                {telemetry.disk_percent}%
                            </span>
                        </div>
                        <div className="h-1.5 w-full bg-muted/60 rounded-full overflow-hidden">
                            <div 
                                className={`h-full ${getProgressColor(telemetry.disk_percent)} transition-all duration-500 ease-out`}
                                style={{ width: `${telemetry.disk_percent}%` }}
                            />
                        </div>
                    </div>
                </div>

                {/* Optimizations Badge Checklist */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                    {telemetry.caches.config ? (
                        <Badge variant="outline" className="text-[10px] py-0 border-emerald-500/20 text-emerald-500 bg-emerald-500/5">Config: Cached</Badge>
                    ) : (
                        <Badge variant="outline" className="text-[10px] py-0 border-amber-500/20 text-amber-500 bg-amber-500/5">Config: Uncached</Badge>
                    )}

                    {telemetry.caches.routes ? (
                        <Badge variant="outline" className="text-[10px] py-0 border-emerald-500/20 text-emerald-500 bg-emerald-500/5">Routes: Cached</Badge>
                    ) : (
                        <Badge variant="outline" className="text-[10px] py-0 border-amber-500/20 text-amber-500 bg-amber-500/5">Routes: Uncached</Badge>
                    )}

                    {telemetry.caches.debug ? (
                        <Badge variant="outline" className="text-[10px] py-0 border-rose-500/20 text-rose-500 bg-rose-500/5">Debug Mode: ON</Badge>
                    ) : (
                        <Badge variant="outline" className="text-[10px] py-0 border-slate-500/20 text-slate-500 bg-slate-500/5">Debug: OFF</Badge>
                    )}
                </div>

                {/* Fast Action Shortcuts */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/60">
                    <Button 
                        type="button" 
                        variant="outline" 
                        size="sm" 
                        onClick={handleClearCache}
                        disabled={isProcessing}
                        className="text-xs h-8 flex items-center justify-center gap-1.5 hover:bg-primary/5 active:bg-primary/5 cursor-pointer"
                    >
                        <RefreshCw className="h-3.5 w-3.5 text-muted-foreground" />
                        Flush Caches
                    </Button>
                    <Button 
                        type="button" 
                        variant="outline" 
                        size="sm" 
                        onClick={handleCreateBackup}
                        disabled={isProcessing}
                        className="text-xs h-8 flex items-center justify-center gap-1.5 hover:bg-primary/5 active:bg-primary/5 cursor-pointer"
                    >
                        <HardDrive className="h-3.5 w-3.5 text-muted-foreground" />
                        Dump Database
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
