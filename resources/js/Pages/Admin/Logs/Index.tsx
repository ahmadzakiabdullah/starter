import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, usePage } from '@inertiajs/react';
import {
    AlertOctagon,
    AlertTriangle,
    ChevronDown,
    ChevronRight,
    Clock,
    Download,
    FileWarning,
    Filter,
    Info,
    ServerCrash,
    Trash2,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

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
        if (
            confirm(
                'Are you absolutely sure you want to completely empty the Laravel application logs file?',
            )
        ) {
            router.delete(route('logs.destroy'), {
                onSuccess: () => {
                    toast.success('Logs cleared successfully.');
                },
            });
        }
    };

    const handleDownloadLogs = () => {
        window.location.href = route('logs.download');
    };

    const getLevelBadgeStyles = (level: string) => {
        const lvl = level.toUpperCase();
        if (
            lvl === 'ERROR' ||
            lvl === 'EMERGENCY' ||
            lvl === 'CRITICAL' ||
            lvl === 'ALERT'
        ) {
            return 'bg-red-500/10 text-red-500 border-red-500/20';
        }
        if (lvl === 'WARNING' || lvl === 'NOTICE') {
            return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
        }
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
    };

    const getLevelIcon = (level: string) => {
        const lvl = level.toUpperCase();
        if (
            lvl === 'ERROR' ||
            lvl === 'EMERGENCY' ||
            lvl === 'CRITICAL' ||
            lvl === 'ALERT'
        ) {
            return <AlertOctagon className="h-4 w-4 shrink-0 text-red-500" />;
        }
        if (lvl === 'WARNING' || lvl === 'NOTICE') {
            return (
                <AlertTriangle className="h-4 w-4 shrink-0 text-amber-500" />
            );
        }
        return <Info className="h-4 w-4 shrink-0 text-blue-500" />;
    };

    const toggleExpand = (idx: number) => {
        setExpandedLog(expandedLog === idx ? null : idx);
    };

    // Filter logs
    const filteredLogs =
        levelFilter === 'all'
            ? logs
            : levelFilter === 'errors'
              ? logs.filter((l) =>
                    ['ERROR', 'EMERGENCY', 'CRITICAL', 'ALERT'].includes(
                        l.level,
                    ),
                )
              : levelFilter === 'warnings'
                ? logs.filter((l) => l.level === 'WARNING')
                : logs.filter((l) => l.level === 'INFO' || l.level === 'DEBUG');

    return (
        <AuthenticatedLayout>
            <Head title="System Application Logs" />

            <div className="mx-auto max-w-4xl space-y-6">
                {/* Header Banner */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
                            <FileWarning className="text-primary h-6 w-6" />
                            Laravel Log Reader
                        </h1>
                        <p className="text-muted-foreground text-sm">
                            Read the latest Laravel application errors, system
                            warnings, and debug logs directly.
                        </p>
                    </div>
                    {logs.length > 0 && (
                        <div className="flex shrink-0 gap-2">
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
                                className="text-destructive hover:bg-destructive/5 hover:text-destructive text-xs"
                            >
                                <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                                Clear Logs
                            </Button>
                        </div>
                    )}
                </div>

                {/* Filter and File Details */}
                <div className="flex flex-col justify-between gap-3 border-b pb-1.5 sm:flex-row sm:items-center">
                    <div className="flex items-center gap-1">
                        <Filter className="text-muted-foreground mr-1 h-3.5 w-3.5" />
                        <button
                            onClick={() => setLevelFilter('all')}
                            className={`rounded-md border px-3 py-1.5 text-xs font-semibold transition-all ${
                                levelFilter === 'all'
                                    ? 'bg-primary text-primary-foreground border-primary'
                                    : 'bg-card text-muted-foreground border-border hover:text-foreground'
                            }`}
                        >
                            All ({logs.length})
                        </button>
                        <button
                            onClick={() => setLevelFilter('errors')}
                            className={`rounded-md border px-3 py-1.5 text-xs font-semibold transition-all ${
                                levelFilter === 'errors'
                                    ? 'border-red-500 bg-red-500 text-white'
                                    : 'bg-card border-border text-red-500/80 hover:bg-red-500/5'
                            }`}
                        >
                            Errors (
                            {
                                logs.filter((l) =>
                                    [
                                        'ERROR',
                                        'EMERGENCY',
                                        'CRITICAL',
                                        'ALERT',
                                    ].includes(l.level),
                                ).length
                            }
                            )
                        </button>
                        <button
                            onClick={() => setLevelFilter('warnings')}
                            className={`rounded-md border px-3 py-1.5 text-xs font-semibold transition-all ${
                                levelFilter === 'warnings'
                                    ? 'border-amber-500 bg-amber-500 text-white'
                                    : 'bg-card border-border text-amber-500/80 hover:bg-amber-500/5'
                            }`}
                        >
                            Warnings (
                            {logs.filter((l) => l.level === 'WARNING').length})
                        </button>
                    </div>
                    <div className="bg-muted text-muted-foreground self-start rounded px-2.5 py-1 font-mono text-[10px] font-bold sm:self-auto">
                        File Size: {logSize}
                    </div>
                </div>

                {/* Logs List Stack */}
                <div className="space-y-3.5">
                    {filteredLogs.length === 0 ? (
                        <div className="bg-card text-muted-foreground flex flex-col items-center justify-center rounded-xl border border-dashed p-12 text-center">
                            <ServerCrash className="text-primary mb-2 h-8 w-8 opacity-60" />
                            <p className="text-sm font-medium">
                                No application log entries found matching
                                filters.
                            </p>
                        </div>
                    ) : (
                        filteredLogs.map((item, idx) => (
                            <div
                                key={idx}
                                className="bg-card overflow-hidden rounded-xl border shadow-xs transition-all hover:shadow-sm"
                            >
                                {/* Log Summary Header */}
                                <div
                                    onClick={() => toggleExpand(idx)}
                                    className="hover:bg-muted/10 flex cursor-pointer items-start gap-3.5 p-4 text-xs leading-normal select-none"
                                >
                                    {getLevelIcon(item.level)}
                                    <div className="min-w-0 flex-1 space-y-1">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <Badge
                                                variant="outline"
                                                className={`border text-[9px] font-bold tracking-wider uppercase ${getLevelBadgeStyles(item.level)}`}
                                            >
                                                {item.level}
                                            </Badge>
                                            <span className="text-muted-foreground bg-muted py-0.2 rounded px-1.5 font-mono text-[10px] font-semibold uppercase">
                                                {item.env}
                                            </span>
                                            <div className="text-muted-foreground ml-auto flex items-center gap-1 text-[10px]">
                                                <Clock className="h-3 w-3" />
                                                <span>{item.timestamp}</span>
                                            </div>
                                        </div>
                                        <p className="text-foreground line-clamp-2 font-semibold break-all">
                                            {item.message}
                                        </p>
                                    </div>
                                    <div className="text-muted-foreground mt-0.5">
                                        {expandedLog === idx ? (
                                            <ChevronDown className="h-4 w-4" />
                                        ) : (
                                            <ChevronRight className="h-4 w-4" />
                                        )}
                                    </div>
                                </div>

                                {/* Stack Trace Panel */}
                                {expandedLog === idx && item.stack && (
                                    <div className="bg-muted/20 text-muted-foreground max-h-[300px] overflow-x-auto border-t border-dashed p-4 font-mono text-[10px] leading-relaxed whitespace-pre">
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
