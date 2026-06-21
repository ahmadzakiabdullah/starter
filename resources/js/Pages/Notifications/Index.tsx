import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Button } from '@/Components/ui/button';
import { Head, Link, router, usePage } from '@inertiajs/react';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { 
    Bell, 
    CheckCheck, 
    Trash2, 
    Clock, 
    ShieldAlert, 
    Sliders, 
    UserCheck, 
    Mail, 
    ArrowRight, 
    Info 
} from 'lucide-react';

interface NotificationItem {
    id: string;
    title: string;
    message: string;
    url: string | null;
    read_at: string | null;
    created_at: string;
}

interface NotificationsProps {
    notifications: {
        data: NotificationItem[];
        current_page: number;
        last_page: number;
        links: { url: string | null; label: string; active: boolean }[];
    };
}

export default function Index({ notifications }: NotificationsProps) {
    const { flash } = usePage().props as any;
    const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all');

    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
        }
        if (flash?.error) {
            toast.error(flash.error);
        }
    }, [flash]);

    const handleMarkAsRead = (e: React.MouseEvent, id: string) => {
        e.preventDefault();
        e.stopPropagation();
        router.patch(route('notifications.read', id));
    };

    const handleDelete = (e: React.MouseEvent, id: string) => {
        e.preventDefault();
        e.stopPropagation();
        if (confirm('Delete this notification?')) {
            router.delete(route('notifications.destroy', id));
        }
    };

    const handleClearAll = () => {
        if (confirm('Are you sure you want to permanently clear all notifications?')) {
            router.delete(route('notifications.clear-all'));
        }
    };

    const handleMarkAllRead = () => {
        router.patch(route('notifications.read-all'));
    };

    // Client-side filtering for immediate snappy tab response
    const displayedItems = activeTab === 'all' 
        ? notifications.data 
        : notifications.data.filter(item => !item.read_at);

    // Get contextual icon
    const getNotificationIcon = (title: string) => {
        const text = title.toLowerCase();
        if (text.includes('password') || text.includes('security') || text.includes('permission') || text.includes('role') || text.includes('access')) {
            return {
                icon: ShieldAlert,
                bg: 'bg-amber-500/10 text-amber-500 border-amber-500/20'
            };
        }
        if (text.includes('setting') || text.includes('smtp') || text.includes('cache') || text.includes('config')) {
            return {
                icon: Sliders,
                bg: 'bg-blue-500/10 text-blue-500 border-blue-500/20'
            };
        }
        if (text.includes('user') || text.includes('profile') || text.includes('account') || text.includes('member')) {
            return {
                icon: UserCheck,
                bg: 'bg-green-500/10 text-green-500 border-green-500/20'
            };
        }
        if (text.includes('mail') || text.includes('email') || text.includes('verification')) {
            return {
                icon: Mail,
                bg: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20'
            };
        }
        return {
            icon: Bell,
            bg: 'bg-slate-500/10 text-slate-500 border-slate-500/20'
        };
    };

    return (
        <AuthenticatedLayout>
            <Head title="Notifications" />

            <div className="max-w-3xl mx-auto space-y-6">
                {/* Header Banner */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
                            <Bell className="h-6 w-6 text-primary" />
                            Notifications
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Account events, systems adjustments, and alerts relevant to your profile.
                        </p>
                    </div>
                    {notifications.data.length > 0 && (
                        <div className="flex gap-2 shrink-0">
                            <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={handleMarkAllRead}
                                className="text-xs"
                                disabled={!notifications.data.some(n => !n.read_at)}
                            >
                                <CheckCheck className="mr-1.5 h-3.5 w-3.5" />
                                Mark all read
                            </Button>
                            <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={handleClearAll}
                                className="text-xs text-destructive hover:bg-destructive/5 hover:text-destructive"
                            >
                                <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                                Clear all
                            </Button>
                        </div>
                    )}
                </div>

                {/* Filter Tabs Panel */}
                <div className="flex items-center justify-between border-b pb-1">
                    <div className="flex gap-4">
                        <button
                            onClick={() => setActiveTab('all')}
                            className={`pb-2.5 text-sm font-semibold border-b-2 transition-all relative ${
                                activeTab === 'all' 
                                    ? 'border-primary text-foreground' 
                                    : 'border-transparent text-muted-foreground hover:text-foreground'
                            }`}
                        >
                            All Logs
                            <span className="ml-1.5 text-xs bg-muted px-1.5 py-0.2 rounded font-normal text-muted-foreground">
                                {notifications.data.length}
                            </span>
                        </button>
                        <button
                            onClick={() => setActiveTab('unread')}
                            className={`pb-2.5 text-sm font-semibold border-b-2 transition-all relative ${
                                activeTab === 'unread' 
                                    ? 'border-primary text-foreground' 
                                    : 'border-transparent text-muted-foreground hover:text-foreground'
                            }`}
                        >
                            Unread
                            {notifications.data.filter(n => !n.read_at).length > 0 && (
                                <span className="ml-1.5 text-xs bg-primary/10 text-primary px-1.5 py-0.2 rounded font-bold">
                                    {notifications.data.filter(n => !n.read_at).length}
                                </span>
                            )}
                        </button>
                    </div>
                </div>

                {/* Notification List Area */}
                <div className="overflow-hidden rounded-xl border bg-card shadow-xs divide-y">
                    {displayedItems.length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-12 text-muted-foreground text-center">
                            <Info className="h-8 w-8 mb-2 text-primary opacity-60" />
                            <p className="text-sm font-medium">
                                {activeTab === 'unread' 
                                    ? 'You have read all notifications!' 
                                    : 'No notification records found.'
                                }
                            </p>
                        </div>
                    ) : (
                        displayedItems.map((item) => {
                            const config = getNotificationIcon(item.title);
                            const IconComponent = config.icon;

                            return (
                                <div
                                    key={item.id}
                                    className={`relative group flex items-start gap-3.5 p-4 transition-colors hover:bg-muted/10 ${
                                        item.read_at ? '' : 'bg-primary/[0.02]'
                                    }`}
                                >
                                    {/* Icon Column */}
                                    <div className={`p-2.5 rounded-lg border shrink-0 ${config.bg}`}>
                                        <IconComponent className="h-4 w-4" />
                                    </div>

                                    {/* Content Column */}
                                    <div className="flex-1 min-w-0 pr-10">
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold text-xs text-foreground truncate">
                                                {item.title}
                                            </span>
                                            {!item.read_at && (
                                                <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" title="Unread" />
                                            )}
                                        </div>
                                        <p className="mt-1 text-xs text-muted-foreground leading-relaxed break-words">
                                            {item.message}
                                        </p>
                                        
                                        {/* Action link details if URL present */}
                                        {item.url && (
                                            <Link 
                                                href={item.url}
                                                onClick={(e) => !item.read_at && handleMarkAsRead(e, item.id)}
                                                className="inline-flex items-center gap-1 text-[10px] font-bold text-primary mt-2 group/btn hover:underline"
                                            >
                                                <span>View details</span>
                                                <ArrowRight className="h-3 w-3 transition-transform group-hover/btn:translate-x-0.5" />
                                            </Link>
                                        )}

                                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground mt-2">
                                            <Clock className="h-3 w-3" />
                                            <span>
                                                {new Date(item.created_at).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Actions Hover Area */}
                                    <div className="absolute right-4 top-4 flex items-center gap-1.5 opacity-80 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                                        {!item.read_at && (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={(e) => handleMarkAsRead(e, item.id)}
                                                className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted"
                                                title="Mark as read"
                                            >
                                                <CheckCheck className="h-3.5 w-3.5" />
                                            </Button>
                                        )}
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={(e) => handleDelete(e, item.id)}
                                            className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/5"
                                            title="Delete notification"
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </Button>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Pagination */}
                {notifications.last_page > 1 && (
                    <div className="flex items-center justify-between py-4">
                        <div className="text-xs text-muted-foreground">
                            Page {notifications.current_page} of {notifications.last_page}
                        </div>
                        <div className="flex items-center gap-1">
                            {notifications.links.map((link, idx) => {
                                const label = link.label
                                    .replace('&laquo; Previous', 'Prev')
                                    .replace('Next &raquo;', 'Next');

                                return (
                                    <Button
                                        key={idx}
                                        variant={link.active ? 'default' : 'outline'}
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
                )}
            </div>
        </AuthenticatedLayout>
    );
}
