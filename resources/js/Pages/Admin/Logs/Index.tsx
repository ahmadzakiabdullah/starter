import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Button } from '@/Components/ui/button';
import { Head, router, usePage } from '@inertiajs/react';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { 
    FileWarning, 
    Trash2, 
    Download, 
    ChevronDown, 
    ChevronRight, 
    Clock, 
    AlertOctagon, 
    AlertTriangle, 
    Info, 
    ServerCrash,
    Filter
} from 'lucide-react';
import { Badge } from '@/Components/ui/badge';

interface LogItem {
    timestamp: string;
    env: string;
    level: string;
    message: string;
    stack: string;
}

interface LogsPageProps {
    logs: LogItem[];
    logSize: string;
}

export default function Index({ logs, logSize }: LogsPageProps) {
    const { flash } = usePage().props as any;
    const [expandedLog, setExpandedLog] = useState<number | null>(null);
    const [levelFilter, setLevelFilter] = useState<string>('all');

    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
        }
        if (flash?.error) {
            toast.error(flash.error);
        }
    }, [flash]);

    const handleClearLogs = () => {
        if (confirm('Are you absolutely sure you want to completely empty the Laravel application logs file?')) {
            router.delete(route('logs.destroy'), {
                onSuccess: () => {
                    toast.success('Logs cleared successfully.');
                }
            });
        }
    };

    const handleDownloadLogs = () => {
        window.location.href = route('logs.download');
    };

    const getLevelBadgeStyles = (level: string) => {
        const lvl = level.toUpperCase();
        if (lvl === 'ERROR' || lvl === 'EMERGENCY' || lvl === 'CRITICAL' || lvl === 'ALERT') {
            return 'bg-red-500/10 text-red-500 border-red-500/20';
        }
        if (lvl === 'WARNING' || lvl === 'NOTICE') {
            return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
        }
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
    };

    const getLevelIcon = (level: string) => {
        const lvl = level.toUpperCase();
        if (lvl === 'ERROR' || lvl === 'EMERGENCY' || lvl === 'CRITICAL' || lvl === 'ALERT') {
            return <AlertOctagon className="h-4 w-4 text-red-500 shrink-0" />;
        }
        if (lvl === 'WARNING' || lvl === 'NOTICE') {
            return <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />;
        }
        return <Info className="h-4 w-4 text-blue-500 shrink-0" />;
    };

    const toggleExpand = (idx: number) => {
        setExpandedLog(expandedLog === idx ? null : idx);
    };

    // Filter logs
    const filteredLogs = levelFilter === 'all'
        ? logs
        : levelFilter === 'errors'
        ? logs.filter(l => ['ERROR', 'EMERGENCY', 'CRITICAL', 'ALERT'].includes(l.level))
        : levelFilter === 'warnings'
        ? logs.filter(l => l.level === 'WARNING')
        : logs.filter(l => l.level === 'INFO' || l.level === 'DEBUG');

    return (
        <AuthenticatedLayout>
            <Head title="System Application Logs" />

            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header Banner */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
                            <FileWarning className="h-6 w-6 text-primary" />
                            Laravel Log Reader
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Read the latest Laravel application errors, system warnings, and debug logs directly.
                        </p>
                    </div>
                    {logs.length > 0 && (
                        <div className="flex gap-2 shrink-0">
                            <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={handleDownloadLogs}
                                className="text-xs"
                            >
                                <Download className="mr-1.5 h-3.5 w-3.5" />
                                Download Log
                            </Button>
                            <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={handleClearLogs}
                                className="text-xs text-destructive hover:bg-destructive/5 hover:text-destructive"
                            >
                                <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                                Clear Logs
                            </Button>
                        </div>
                    )}
                </div>

                {/* Filter and File Details */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-1.5">
                    <div className="flex items-center gap-1">
                        <Filter className="h-3.5 w-3.5 text-muted-foreground mr-1" />
                        <button
                            onClick={() => setLevelFilter('all')}
                            className={`px-3 py-1.5 text-xs font-semibold rounded-md border transition-all ${
                                levelFilter === 'all' 
                                    ? 'bg-primary text-primary-foreground border-primary' 
                                    : 'bg-card text-muted-foreground border-border hover:text-foreground'
                            }`}
                        >
                            All ({logs.length})
                        </button>
                        <button
                            onClick={() => setLevelFilter('errors')}
                            className={`px-3 py-1.5 text-xs font-semibold rounded-md border transition-all ${
                                levelFilter === 'errors' 
                                    ? 'bg-red-500 text-white border-red-500' 
                                    : 'bg-card text-red-500/80 border-border hover:bg-red-500/5'
                            }`}
                        >
                            Errors ({logs.filter(l => ['ERROR', 'EMERGENCY', 'CRITICAL', 'ALERT'].includes(l.level)).length})
                        </button>
                        <button
                            onClick={() => setLevelFilter('warnings')}
                            className={`px-3 py-1.5 text-xs font-semibold rounded-md border transition-all ${
                                levelFilter === 'warnings' 
                                    ? 'bg-amber-500 text-white border-amber-500' 
                                    : 'bg-card text-amber-500/80 border-border hover:bg-amber-500/5'
                            }`}
                        >
                            Warnings ({logs.filter(l => l.level === 'WARNING').length})
                        </button>
                    </div>
                    <div className="text-[10px] bg-muted px-2.5 py-1 rounded font-mono font-bold text-muted-foreground self-start sm:self-auto">
                        File Size: {logSize}
                    </div>
                </div>

                {/* Logs List Stack */}
                <div className="space-y-3.5">
                    {filteredLogs.length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-12 border border-dashed rounded-xl bg-card text-muted-foreground text-center">
                            <ServerCrash className="h-8 w-8 mb-2 text-primary opacity-60" />
                            <p className="text-sm font-medium">No application log entries found matching filters.</p>
                        </div>
                    ) : (
                        filteredLogs.map((item, idx) => (
                            <div 
                                key={idx} 
                                className="overflow-hidden rounded-xl border bg-card shadow-xs hover:shadow-sm transition-all"
                            >
                                {/* Log Summary Header */}
                                <div 
                                    onClick={() => toggleExpand(idx)}
                                    className="flex items-start gap-3.5 p-4 cursor-pointer select-none text-xs leading-normal hover:bg-muted/10"
                                >
                                    {getLevelIcon(item.level)}
                                    <div className="flex-1 min-w-0 space-y-1">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <Badge variant="outline" className={`text-[9px] uppercase tracking-wider font-bold border ${getLevelBadgeStyles(item.level)}`}>
                                                {item.level}
                                            </Badge>
                                            <span className="text-[10px] font-semibold text-muted-foreground font-mono bg-muted py-0.2 px-1.5 rounded uppercase">
                                                {item.env}
                                            </span>
                                            <div className="flex items-center gap-1 text-muted-foreground text-[10px] ml-auto">
                                                <Clock className="h-3 w-3" />
                                                <span>{item.timestamp}</span>
                                            </div>
                                        </div>
                                        <p className="font-semibold text-foreground break-all line-clamp-2">
                                            {item.message}
                                        </p>
                                    </div>
                                    <div className="text-muted-foreground mt-0.5">
                                        {expandedLog === idx ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                                    </div>
                                </div>

                                {/* Stack Trace Panel */}
                                {expandedLog === idx && item.stack && (
                                    <div className="border-t bg-muted/20 p-4 font-mono text-[10px] text-muted-foreground overflow-x-auto max-h-[300px] whitespace-pre leading-relaxed border-dashed">
                                        {item.stack}
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
