import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { 
    Laptop, 
    Smartphone, 
    Tablet, 
    Globe, 
    LogOut, 
    RefreshCw, 
    ShieldAlert,
    CheckCircle2,
    Calendar,
    Network
} from 'lucide-react';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/Components/ui/dialog';

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
            setSessions(prev => prev.filter(session => session.id !== id));
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
        <Card className="border border-slate-200 dark:border-slate-800 shadow-sm rounded-xl overflow-hidden bg-card">
            <CardHeader className="border-b border-slate-100 dark:border-slate-800/60 pb-5">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <CardTitle className="text-lg font-bold flex items-center gap-2">
                            <Laptop className="h-5 w-5 text-primary" />
                            Active Browser Sessions
                        </CardTitle>
                        <CardDescription className="text-xs text-muted-foreground mt-1">
                            Below is a list of active sessions associated with your account. Revoke any unfamiliar device sessions.
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
                            <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
                            Refresh
                        </Button>
                        {sessions.filter(s => !s.is_current_device).length > 0 && (
                            <Button 
                                variant="destructive" 
                                size="sm" 
                                onClick={() => setConfirmingAllLogout(true)}
                                className="h-8.5 text-xs shadow-xs"
                            >
                                <LogOut className="h-3.5 w-3.5 mr-1.5" />
                                Terminate Others
                            </Button>
                        )}
                    </div>
                </div>
            </CardHeader>
            <CardContent className="pt-6">
                {loading && sessions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-3">
                        <RefreshCw className="h-8 w-8 animate-spin text-slate-400" />
                        <p className="text-sm">Fetching active sessions...</p>
                    </div>
                ) : sessions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-muted-foreground text-center gap-2">
                        <ShieldAlert className="h-10 w-10 text-amber-500" />
                        <p className="text-sm font-semibold">No active sessions found</p>
                        <p className="text-xs max-w-xs text-slate-400">We couldn't retrieve session rows. Please verify your SESSION_DRIVER is configured to 'database'.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {sessions.map((session) => (
                            <div 
                                key={session.id} 
                                className="flex flex-col md:flex-row md:items-center justify-between p-4 border border-slate-100 dark:border-slate-800/80 rounded-xl bg-slate-50/40 dark:bg-slate-900/20 hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-all duration-200"
                            >
                                <div className="flex items-start gap-4">
                                    <div className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-2xs shrink-0 mt-0.5">
                                        {getDeviceIcon(session.device)}
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex items-center flex-wrap gap-2">
                                            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                                                {session.os} • {session.browser}
                                            </h4>
                                            {session.is_current_device ? (
                                                <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                                                    <CheckCircle2 className="h-3 w-3" />
                                                    This Device
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded-full font-medium">
                                                    Remote Session
                                                </span>
                                            )}
                                        </div>
                                        
                                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground mt-1">
                                            <span className="flex items-center gap-1">
                                                <Network className="h-3.5 w-3.5 text-slate-400" />
                                                IP: {session.ip_address || 'Unknown'}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Calendar className="h-3.5 w-3.5 text-slate-400" />
                                                Active: {session.is_current_device ? 'Just now' : session.last_active_formatted}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-4 md:mt-0 flex justify-end shrink-0 pl-14 md:pl-0">
                                    {session.is_current_device ? (
                                        <span className="text-xs text-muted-foreground italic font-medium">Active Session</span>
                                    ) : (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleRevoke(session.id)}
                                            disabled={revokingId === session.id}
                                            className="text-destructive hover:bg-destructive/10 hover:text-destructive text-xs font-semibold h-8.5 px-3 border border-dashed border-destructive/20 hover:border-destructive/40"
                                        >
                                            {revokingId === session.id ? 'Revoking...' : 'Revoke Session'}
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
                <Dialog open={confirmingAllLogout} onOpenChange={() => setConfirmingAllLogout(false)}>
                    <DialogContent className="sm:rounded-xl">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2 text-destructive font-bold">
                                <ShieldAlert className="h-5 w-5 text-destructive" />
                                Terminate Other Browser Sessions
                            </DialogTitle>
                            <DialogDescription className="text-xs text-muted-foreground">
                                Are you sure you want to log out of all other active devices? You will be signed out from all sessions except this active window.
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
                                {revokingOther ? 'Terminating...' : 'Yes, Log Out Other Devices'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}
        </Card>
    );
}
