import { Badge } from '@/Components/ui/badge';
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/Components/ui/table';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import {
    Calendar,
    ClipboardCheck,
    Eye,
    Info,
    Laptop,
    Network,
    Search,
    ShieldAlert,
    Target,
    Trash2,
    X,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface AuditLog {
    id: number;
    event: string;
    description: string;
    actor: { name: string; username: string } | null;
    created_at: string;
    old_values: any;
    new_values: any;
    ip_address: string | null;
    user_agent: string | null;
    auditable_type: string | null;
    auditable_id: number | null;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface AuditLogPageProps {
    logs: {
        data: AuditLog[];
        links: PaginationLink[];
        current_page: number;
        last_page: number;
    };
    events: string[];
    filters: {
        search?: string;
        event?: string;
        date_from?: string;
        date_to?: string;
        per_page?: string;
    };
}

export default function Index({ logs, events, filters }: AuditLogPageProps) {
    const { flash } = usePage().props as any;

    const [search, setSearch] = useState(filters.search || '');
    const [selectedEvent, setSelectedEvent] = useState(filters.event || 'all');
    const [dateFrom, setDateFrom] = useState(filters.date_from || '');
    const [dateTo, setDateTo] = useState(filters.date_to || '');
    const [perPage, setPerPage] = useState(filters.per_page || '25');

    const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
    const [purgeOpen, setPurgeOpen] = useState(false);

    const purgeForm = useForm({
        days: '30',
    });

    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
        }
        if (flash?.error) {
            toast.error(flash.error);
        }
    }, [flash]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        applyFilters(search, selectedEvent, dateFrom, dateTo, perPage);
    };

    const handleEventChange = (event: string) => {
        setSelectedEvent(event);
        applyFilters(search, event, dateFrom, dateTo, perPage);
    };

    const handleDateFromChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setDateFrom(val);
        applyFilters(search, selectedEvent, val, dateTo, perPage);
    };

    const handleDateToChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setDateTo(val);
        applyFilters(search, selectedEvent, dateFrom, val, perPage);
    };

    const handlePerPageChange = (val: string) => {
        setPerPage(val);
        applyFilters(search, selectedEvent, dateFrom, dateTo, val);
    };

    const clearFilters = () => {
        setSearch('');
        setSelectedEvent('all');
        setDateFrom('');
        setDateTo('');
        setPerPage('25');
        router.get(route('audit-logs.index'));
    };

    const applyFilters = (
        searchVal: string,
        eventVal: string,
        fromVal: string,
        toVal: string,
        perPageVal: string,
    ) => {
        router.get(
            route('audit-logs.index'),
            {
                search: searchVal || undefined,
                event: eventVal === 'all' ? undefined : eventVal,
                date_from: fromVal || undefined,
                date_to: toVal || undefined,
                per_page: perPageVal === '25' ? undefined : perPageVal,
            },
            {
                preserveState: true,
                replace: true,
            },
        );
    };

    const handlePurgeSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (
            confirm(
                `Are you absolutely sure you want to permanently delete all audit logs older than ${purgeForm.data.days} days?`,
            )
        ) {
            purgeForm.post(route('audit-logs.purge'), {
                onSuccess: () => {
                    setPurgeOpen(false);
                },
            });
        }
    };

    const formatVal = (val: any) => {
        if (val === null || val === undefined)
            return (
                <span className="text-muted-foreground/40 italic">null</span>
            );
        if (typeof val === 'boolean') return val ? 'true' : 'false';
        if (typeof val === 'object') return JSON.stringify(val, null, 2);
        return String(val);
    };

    const renderDiff = (log: AuditLog) => {
        const oldVals = log.old_values || {};
        const newVals = log.new_values || {};

        const allKeys = Array.from(
            new Set([...Object.keys(oldVals), ...Object.keys(newVals)]),
        );

        if (allKeys.length === 0) {
            return (
                <div className="bg-muted/10 text-muted-foreground flex flex-col items-center justify-center rounded-lg border border-dashed p-6">
                    <Info className="mb-1.5 h-5 w-5 opacity-60" />
                    <p className="text-xs italic">
                        No changed values recorded for this event.
                    </p>
                </div>
            );
        }

        return (
            <div className="bg-card overflow-hidden rounded-lg border text-xs">
                <Table>
                    <TableHeader className="bg-muted/40">
                        <TableRow>
                            <TableHead className="py-2">Field</TableHead>
                            <TableHead className="py-2">Old Value</TableHead>
                            <TableHead className="py-2">New Value</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {allKeys.map((key) => {
                            const oldVal = oldVals[key];
                            const newVal = newVals[key];
                            const isDifferent =
                                JSON.stringify(oldVal) !==
                                JSON.stringify(newVal);

                            return (
                                <TableRow
                                    key={key}
                                    className={
                                        isDifferent ? 'bg-amber-500/[0.01]' : ''
                                    }
                                >
                                    <TableCell className="py-2 font-mono font-medium">
                                        {key}
                                    </TableCell>
                                    <TableCell
                                        className={`max-w-[220px] py-2 break-words ${isDifferent ? 'rounded bg-red-500/[0.04] px-1.5 text-red-500 line-through' : 'text-muted-foreground'}`}
                                    >
                                        {formatVal(oldVal)}
                                    </TableCell>
                                    <TableCell
                                        className={`max-w-[220px] py-2 break-words ${isDifferent ? 'rounded bg-green-500/[0.04] px-1.5 font-semibold text-green-500' : 'text-muted-foreground'}`}
                                    >
                                        {formatVal(newVal)}
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </div>
        );
    };

    return (
        <AuthenticatedLayout>
            <Head title="Audit Log" />

            <div className="space-y-6">
                {/* Header Banner */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
                            <ClipboardCheck className="text-primary h-6 w-6" />
                            Audit Log
                        </h1>
                        <p className="text-muted-foreground text-sm">
                            A record of sign-ins and administrator changes to
                            users, roles, and settings.
                        </p>
                    </div>
                    <div>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setPurgeOpen(true)}
                            className="text-destructive hover:bg-destructive/5 hover:text-destructive shrink-0"
                        >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Purge Old Logs
                        </Button>
                    </div>
                </div>

                {/* Filters Panel */}
                <div className="bg-card flex flex-col gap-4 rounded-xl border p-4 shadow-xs">
                    <div className="flex flex-col items-stretch justify-between gap-3 lg:flex-row lg:items-center">
                        <form
                            onSubmit={handleSearch}
                            className="relative flex-1"
                        >
                            <Input
                                placeholder="Search description, event or actor..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pr-8 pl-9"
                            />
                            <Search className="text-muted-foreground absolute top-2.5 left-3 h-4 w-4" />
                            {search && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSearch('');
                                        applyFilters(
                                            '',
                                            selectedEvent,
                                            dateFrom,
                                            dateTo,
                                            perPage,
                                        );
                                    }}
                                    className="hover:bg-muted absolute top-2.5 right-2.5 rounded-full p-0.5"
                                >
                                    <X className="text-muted-foreground h-3.5 w-3.5" />
                                </button>
                            )}
                        </form>

                        <div className="grid grid-cols-2 gap-3 sm:flex sm:items-center">
                            {/* Event Filter */}
                            <Select
                                value={selectedEvent}
                                onValueChange={handleEventChange}
                            >
                                <SelectTrigger className="w-full sm:w-[180px]">
                                    <SelectValue placeholder="Event Type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        All Events
                                    </SelectItem>
                                    {events.map((e) => (
                                        <SelectItem key={e} value={e}>
                                            {e}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            {/* Date From */}
                            <div className="relative w-full sm:w-auto">
                                <Input
                                    type="date"
                                    value={dateFrom}
                                    onChange={handleDateFromChange}
                                    className="pl-8"
                                    title="Start Date"
                                />
                                <Calendar className="text-muted-foreground pointer-events-none absolute top-2.5 left-2.5 h-4 w-4" />
                            </div>

                            {/* Date To */}
                            <div className="relative w-full sm:w-auto">
                                <Input
                                    type="date"
                                    value={dateTo}
                                    onChange={handleDateToChange}
                                    className="pl-8"
                                    title="End Date"
                                />
                                <Calendar className="text-muted-foreground pointer-events-none absolute top-2.5 left-2.5 h-4 w-4" />
                            </div>

                            {(search ||
                                selectedEvent !== 'all' ||
                                dateFrom ||
                                dateTo) && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={clearFilters}
                                    className="w-full text-xs sm:w-auto"
                                >
                                    Clear Filters
                                </Button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Table Section */}
                <div className="bg-card overflow-hidden rounded-xl border shadow-sm">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Time</TableHead>
                                <TableHead>Event</TableHead>
                                <TableHead>Actor</TableHead>
                                <TableHead>Details</TableHead>
                                <TableHead className="w-[100px] text-right">
                                    Actions
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {logs.data.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={5}
                                        className="text-muted-foreground h-40 text-center"
                                    >
                                        No audit records found matching the
                                        filters.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                logs.data.map((log) => (
                                    <TableRow
                                        key={log.id}
                                        className="hover:bg-muted/20"
                                    >
                                        <TableCell className="text-muted-foreground text-xs whitespace-nowrap">
                                            {new Date(
                                                log.created_at,
                                            ).toLocaleString()}
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant="secondary"
                                                className="font-mono text-[10px] tracking-tight"
                                            >
                                                {log.event}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {log.actor ? (
                                                <div>
                                                    <div className="text-xs font-medium">
                                                        {log.actor.name}
                                                    </div>
                                                    <div className="text-muted-foreground text-[10px]">
                                                        @{log.actor.username}
                                                    </div>
                                                </div>
                                            ) : (
                                                <span className="text-muted-foreground text-xs italic">
                                                    System / Deleted user
                                                </span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-foreground max-w-[350px] truncate text-xs font-medium">
                                            {log.description}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() =>
                                                    setSelectedLog(log)
                                                }
                                                className="hover:bg-primary/5 hover:text-primary ml-auto flex h-8 items-center gap-1"
                                            >
                                                <Eye className="h-3.5 w-3.5" />
                                                Details
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between py-4">
                    <div className="flex items-center gap-2">
                        <span className="text-muted-foreground text-xs">
                            Rows per page:
                        </span>
                        <Select
                            value={perPage}
                            onValueChange={handlePerPageChange}
                        >
                            <SelectTrigger className="h-8 w-[70px]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="25">25</SelectItem>
                                <SelectItem value="50">50</SelectItem>
                                <SelectItem value="100">100</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex items-center gap-2">
                        {logs.last_page > 1 && (
                            <span className="text-muted-foreground text-xs">
                                Page {logs.current_page} of {logs.last_page}
                            </span>
                        )}
                        <div className="flex items-center gap-1">
                            {logs.links.map((link, idx) => {
                                const label = link.label
                                    .replace('&laquo; Previous', 'Prev')
                                    .replace('Next &raquo;', 'Next');

                                return (
                                    <Button
                                        key={idx}
                                        variant={
                                            link.active ? 'default' : 'outline'
                                        }
                                        size="sm"
                                        disabled={!link.url}
                                        asChild={!!link.url}
                                    >
                                        {link.url ? (
                                            <Link href={link.url}>{label}</Link>
                                        ) : (
                                            <span>{label}</span>
                                        )}
                                    </Button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* DETAILS VIEW DIALOG */}
            {selectedLog && (
                <Dialog
                    open={!!selectedLog}
                    onOpenChange={() => setSelectedLog(null)}
                >
                    <DialogContent className="max-w-2xl sm:rounded-xl">
                        <DialogHeader>
                            <DialogTitle className="text-foreground flex items-center gap-2">
                                <ClipboardCheck className="text-primary h-5 w-5" />
                                Audit Log Details
                            </DialogTitle>
                            <DialogDescription>
                                Detailed operational changes, metadata, and
                                changes comparison.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="my-2 space-y-4 text-xs">
                            {/* Metadata Grid */}
                            <div className="bg-muted/15 grid gap-3 rounded-lg border p-3.5 sm:grid-cols-2">
                                <div className="space-y-1">
                                    <span className="text-muted-foreground block text-[10px] font-bold tracking-wider uppercase">
                                        Time
                                    </span>
                                    <span className="text-foreground font-semibold">
                                        {new Date(
                                            selectedLog.created_at,
                                        ).toLocaleString()}
                                    </span>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-muted-foreground block text-[10px] font-bold tracking-wider uppercase">
                                        Event ID
                                    </span>
                                    <span className="text-foreground font-mono font-semibold">
                                        #{selectedLog.id}
                                    </span>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-muted-foreground block flex items-center gap-1 text-[10px] font-bold tracking-wider uppercase">
                                        <Network className="h-3 w-3" />
                                        Client IP
                                    </span>
                                    <span className="text-foreground font-mono font-semibold">
                                        {selectedLog.ip_address ||
                                            'Unavailable'}
                                    </span>
                                </div>
                                {selectedLog.auditable_type && (
                                    <div className="space-y-1">
                                        <span className="text-muted-foreground block flex items-center gap-1 text-[10px] font-bold tracking-wider uppercase">
                                            <Target className="h-3 w-3" />
                                            Subject Model
                                        </span>
                                        <span className="text-foreground font-semibold">
                                            {selectedLog.auditable_type} #
                                            {selectedLog.auditable_id}
                                        </span>
                                    </div>
                                )}
                                <div className="space-y-1 sm:col-span-2">
                                    <span className="text-muted-foreground block flex items-center gap-1 text-[10px] font-bold tracking-wider uppercase">
                                        <Laptop className="h-3 w-3" />
                                        Browser User Agent
                                    </span>
                                    <span className="text-muted-foreground leading-normal break-all">
                                        {selectedLog.user_agent ||
                                            'Unavailable'}
                                    </span>
                                </div>
                            </div>

                            {/* Description block */}
                            <div className="bg-muted/5 space-y-1 rounded-lg border p-3">
                                <span className="text-muted-foreground block text-[10px] font-bold tracking-wider uppercase">
                                    Operation description
                                </span>
                                <span className="text-foreground text-sm leading-relaxed font-medium">
                                    {selectedLog.description}
                                </span>
                            </div>

                            {/* Values changes diff representation */}
                            <div className="space-y-2">
                                <span className="text-muted-foreground block text-[10px] font-bold tracking-wider uppercase">
                                    Changes Matrix
                                </span>
                                {renderDiff(selectedLog)}
                            </div>
                        </div>

                        <DialogFooter>
                            <Button
                                type="button"
                                onClick={() => setSelectedLog(null)}
                            >
                                Close details
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}

            {/* PURGE DIALOG */}
            {purgeOpen && (
                <Dialog
                    open={purgeOpen}
                    onOpenChange={() => setPurgeOpen(false)}
                >
                    <DialogContent className="sm:rounded-xl">
                        <form onSubmit={handlePurgeSubmit}>
                            <DialogHeader>
                                <DialogTitle className="text-destructive flex items-center gap-2">
                                    <ShieldAlert className="h-5 w-5" />
                                    Purge Audit Logs
                                </DialogTitle>
                                <DialogDescription>
                                    This action will permanently delete
                                    historical audit logs from the database.
                                    This operation is irreversible.
                                </DialogDescription>
                            </DialogHeader>

                            <div className="my-4 space-y-4 text-sm">
                                <div className="space-y-2">
                                    <Label htmlFor="purge_days">
                                        Delete audit records older than
                                    </Label>
                                    <Select
                                        value={purgeForm.data.days}
                                        onValueChange={(val) =>
                                            purgeForm.setData('days', val)
                                        }
                                    >
                                        <SelectTrigger id="purge_days">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="30">
                                                30 Days
                                            </SelectItem>
                                            <SelectItem value="60">
                                                60 Days
                                            </SelectItem>
                                            <SelectItem value="90">
                                                90 Days
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <DialogFooter className="gap-2">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={() => setPurgeOpen(false)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    variant="destructive"
                                    disabled={purgeForm.processing}
                                >
                                    {purgeForm.processing
                                        ? 'Purging...'
                                        : 'Execute Purge'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            )}
        </AuthenticatedLayout>
    );
}
