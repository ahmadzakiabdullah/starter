import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Cpu, HardDrive, ShieldAlert, Sparkles, RefreshCw, Layers } from 'lucide-react';
import { router } from '@inertiajs/react';
import { toast } from 'sonner';
import { Badge } from '@/Components/ui/badge';

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

export default function TelemetryWidget({ telemetry }: TelemetryProps) {
    const [isProcessing, setIsProcessing] = useState(false);

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
        if (val < 60) return "bg-emerald-500";
        if (val < 85) return "bg-amber-500";
        return "bg-rose-500";
    };

    const getProgressColorText = (val: number) => {
        if (val < 60) return "text-emerald-500";
        if (val < 85) return "text-amber-500";
        return "text-rose-500";
    };

    return (
        <Card className="border bg-card/60 backdrop-blur-md shadow-xs hover:border-primary/20 transition-all duration-300">
            <CardHeader className="pb-3 border-b border-dashed">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <Cpu className="h-4 w-4 text-primary" />
                    System Telemetry & Health
                </CardTitle>
                <CardDescription className="text-xs">Live resource tracking and quick actions</CardDescription>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
                {/* Dials / Progress bars */}
                <div className="space-y-3 text-xs">
                    {/* CPU */}
                    <div className="space-y-1">
                        <div className="flex items-center justify-between font-medium">
                            <span className="text-muted-foreground flex items-center gap-1.5">
                                <Cpu className="h-3.5 w-3.5" /> CPU Load
                            </span>
                            <span className={`font-semibold font-mono ${getProgressColorText(telemetry.cpu_percent)}`}>
                                {telemetry.cpu_percent}%
                            </span>
                        </div>
                        <div className="h-2 w-full bg-muted/60 rounded-full overflow-hidden">
                            <div 
                                className={`h-full ${getProgressColor(telemetry.cpu_percent)} transition-all duration-500 ease-out`}
                                style={{ width: `${telemetry.cpu_percent}%` }}
                            />
                        </div>
                    </div>

                    {/* RAM */}
                    <div className="space-y-1">
                        <div className="flex items-center justify-between font-medium">
                            <span className="text-muted-foreground flex items-center gap-1.5">
                                <Layers className="h-3.5 w-3.5" /> Memory (RAM)
                            </span>
                            <span className={`font-semibold font-mono ${getProgressColorText(telemetry.ram_percent)}`}>
                                {telemetry.ram_percent}%
                            </span>
                        </div>
                        <div className="h-2 w-full bg-muted/60 rounded-full overflow-hidden">
                            <div 
                                className={`h-full ${getProgressColor(telemetry.ram_percent)} transition-all duration-500 ease-out`}
                                style={{ width: `${telemetry.ram_percent}%` }}
                            />
                        </div>
                    </div>

                    {/* Disk */}
                    <div className="space-y-1">
                        <div className="flex items-center justify-between font-medium">
                            <span className="text-muted-foreground flex items-center gap-1.5">
                                <HardDrive className="h-3.5 w-3.5" /> Disk Storage
                            </span>
                            <span className={`font-semibold font-mono ${getProgressColorText(telemetry.disk_percent)}`}>
                                {telemetry.disk_percent}%
                            </span>
                        </div>
                        <div className="h-2 w-full bg-muted/60 rounded-full overflow-hidden">
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
                        <Badge variant="outline" className="text-[10px] py-0 border-slate-500/20 text-slate-500 bg-slate-500/5">Debug Mode: OFF</Badge>
                    )}
                </div>

                {/* Fast Action Shortcuts */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-dashed">
                    <Button 
                        type="button" 
                        variant="outline" 
                        size="sm" 
                        onClick={handleClearCache}
                        disabled={isProcessing}
                        className="text-xs h-8 flex items-center justify-center gap-1.5 hover:bg-primary/5 active:bg-primary/5"
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
                        className="text-xs h-8 flex items-center justify-center gap-1.5 hover:bg-primary/5 active:bg-primary/5"
                    >
                        <HardDrive className="h-3.5 w-3.5 text-muted-foreground" />
                        Dump Database
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
