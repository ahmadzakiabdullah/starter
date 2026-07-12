import { Button } from '@/Components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/Components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/Components/ui/dialog';
import axios from 'axios';
import {
    Calendar,
    CheckCircle2,
    Laptop,
    LogOut,
    Network,
    RefreshCw,
    ShieldAlert,
    Smartphone,
    Tablet,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface SessionItem {
    id: string;
    ip_address: string;
    is_current_device: boolean;
    browser: string;
    os: string;
    device: string;
    last_active: string;
    last_active_formatted: string;
}

export default function SessionsManager() {
    const [sessions, setSessions] = useState<SessionItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [revokingId, setRevokingId] = useState<string | null>(null);
    const [revokingOther, setRevokingOther] = useState(false);
    const [confirmingAllLogout, setConfirmingAllLogout] = useState(false);

    const fetchSessions = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/profile/sessions');
            setSessions(response.data.sessions);
        } catch (error) {
            toast.error('Failed to load active browser sessions.');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSessions();
    }, []);

    const handleRevoke = async (id: string) => {
        setRevokingId(id);
        try {
            await axios.delete(`/profile/sessions/${id}`);
            toast.success('Device session revoked successfully.');
            // Refresh sessions list
            setSessions((prev) => prev.filter((session) => session.id !== id));
        } catch (error) {
            toast.error('Failed to revoke browser session.');
            console.error(error);
        } finally {
            setRevokingId(null);
        }
    };

    const handleRevokeOther = async () => {
        setRevokingOther(true);
        try {
            await axios.delete('/profile/sessions');
            toast.success('All other browser sessions revoked.');
            setConfirmingAllLogout(false);
            // Refresh list
            fetchSessions();
        } catch (error) {
            toast.error('Failed to revoke other sessions.');
            console.error(error);
        } finally {
            setRevokingOther(false);
        }
    };

    const getDeviceIcon = (deviceType: string) => {
        switch (deviceType.toLowerCase()) {
            case 'mobile':
                return <Smartphone className="h-5 w-5 text-indigo-500" />;
            case 'tablet':
                return <Tablet className="h-5 w-5 text-cyan-500" />;
            case 'desktop':
            default:
                return <Laptop className="h-5 w-5 text-emerald-500" />;
        }
    };

    return (
        <Card className="bg-card overflow-hidden rounded-xl border border-slate-200 shadow-sm dark:border-slate-800">
            <CardHeader className="border-b border-slate-100 pb-5 dark:border-slate-800/60">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2 text-lg font-bold">
                            <Laptop className="text-primary h-5 w-5" />
                            Active Browser Sessions
                        </CardTitle>
                        <CardDescription className="text-muted-foreground mt-1 text-xs">
                            Below is a list of active sessions associated with
                            your account. Revoke any unfamiliar device sessions.
                        </CardDescription>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={fetchSessions}
                            disabled={loading}
                            className="h-8.5 text-xs"
                        >
                            <RefreshCw
                                className={`mr-1.5 h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`}
                            />
                            Refresh
                        </Button>
                        {sessions.filter((s) => !s.is_current_device).length >
                            0 && (
                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => setConfirmingAllLogout(true)}
                                className="h-8.5 text-xs shadow-xs"
                            >
                                <LogOut className="mr-1.5 h-3.5 w-3.5" />
                                Terminate Others
                            </Button>
                        )}
                    </div>
                </div>
            </CardHeader>
            <CardContent className="pt-6">
                {loading && sessions.length === 0 ? (
                    <div className="text-muted-foreground flex flex-col items-center justify-center gap-3 py-12">
                        <RefreshCw className="h-8 w-8 animate-spin text-slate-400" />
                        <p className="text-sm">Fetching active sessions...</p>
                    </div>
                ) : sessions.length === 0 ? (
                    <div className="text-muted-foreground flex flex-col items-center justify-center gap-2 py-12 text-center">
                        <ShieldAlert className="h-10 w-10 text-amber-500" />
                        <p className="text-sm font-semibold">
                            No active sessions found
                        </p>
                        <p className="max-w-xs text-xs text-slate-400">
                            We couldn't retrieve session rows. Please verify
                            your SESSION_DRIVER is configured to 'database'.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {sessions.map((session) => (
                            <div
                                key={session.id}
                                className="flex flex-col justify-between rounded-xl border border-slate-100 bg-slate-50/40 p-4 transition-all duration-200 hover:bg-slate-50 md:flex-row md:items-center dark:border-slate-800/80 dark:bg-slate-900/20 dark:hover:bg-slate-900/40"
                            >
                                <div className="flex items-start gap-4">
                                    <div className="mt-0.5 shrink-0 rounded-lg border border-slate-100 bg-white p-3 shadow-2xs dark:border-slate-800 dark:bg-slate-950">
                                        {getDeviceIcon(session.device)}
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                                                {session.os} • {session.browser}
                                            </h4>
                                            {session.is_current_device ? (
                                                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold tracking-wider text-emerald-600 uppercase dark:text-emerald-400">
                                                    <CheckCircle2 className="h-3 w-3" />
                                                    This Device
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                                                    Remote Session
                                                </span>
                                            )}
                                        </div>

                                        <div className="text-muted-foreground mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
                                            <span className="flex items-center gap-1">
                                                <Network className="h-3.5 w-3.5 text-slate-400" />
                                                IP:{' '}
                                                {session.ip_address ||
                                                    'Unknown'}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Calendar className="h-3.5 w-3.5 text-slate-400" />
                                                Active:{' '}
                                                {session.is_current_device
                                                    ? 'Just now'
                                                    : session.last_active_formatted}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-4 flex shrink-0 justify-end pl-14 md:mt-0 md:pl-0">
                                    {session.is_current_device ? (
                                        <span className="text-muted-foreground text-xs font-medium italic">
                                            Active Session
                                        </span>
                                    ) : (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() =>
                                                handleRevoke(session.id)
                                            }
                                            disabled={revokingId === session.id}
                                            className="text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/20 hover:border-destructive/40 h-8.5 border border-dashed px-3 text-xs font-semibold"
                                        >
                                            {revokingId === session.id
                                                ? 'Revoking...'
                                                : 'Revoke Session'}
                                        </Button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>

            {/* CONFIRM BULK LOGOUT DIALOG */}
            {confirmingAllLogout && (
                <Dialog
                    open={confirmingAllLogout}
                    onOpenChange={() => setConfirmingAllLogout(false)}
                >
                    <DialogContent className="sm:rounded-xl">
                        <DialogHeader>
                            <DialogTitle className="text-destructive flex items-center gap-2 font-bold">
                                <ShieldAlert className="text-destructive h-5 w-5" />
                                Terminate Other Browser Sessions
                            </DialogTitle>
                            <DialogDescription className="text-muted-foreground text-xs">
                                Are you sure you want to log out of all other
                                active devices? You will be signed out from all
                                sessions except this active window.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter className="mt-4 gap-2">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => setConfirmingAllLogout(false)}
                                disabled={revokingOther}
                                className="text-xs"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="button"
                                variant="destructive"
                                onClick={handleRevokeOther}
                                disabled={revokingOther}
                                className="text-xs shadow-xs"
                            >
                                {revokingOther
                                    ? 'Terminating...'
                                    : 'Yes, Log Out Other Devices'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}
        </Card>
    );
}
