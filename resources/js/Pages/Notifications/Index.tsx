import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Button } from '@/Components/ui/button';
import { Head, Link, router } from '@inertiajs/react';
import { Bell, CheckCheck } from 'lucide-react';

interface NotificationItem {
    id: string;
    title: string;
    message: string;
    url: string | null;
    read_at: string | null;
    created_at: string;
}

interface NotificationsProps {
    notifications: { data: NotificationItem[]; current_page: number; last_page: number; prev_page_url: string | null; next_page_url: string | null };
}

export default function Index({ notifications }: NotificationsProps) {
    return (
        <AuthenticatedLayout>
            <Head title="Notifications" />
            <div className="max-w-4xl space-y-6">
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight"><Bell className="h-6 w-6 text-primary" />Notifications</h1>
                        <p className="text-sm text-muted-foreground">Account and system updates relevant to you.</p>
                    </div>
                    <Button variant="outline" onClick={() => router.patch(route('notifications.read-all'))}><CheckCheck className="mr-2 h-4 w-4" />Mark all as read</Button>
                </div>

                <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
                    {notifications.data.length === 0 ? (
                        <div className="p-12 text-center text-muted-foreground">You have no notifications.</div>
                    ) : notifications.data.map((notification) => (
                        <Link
                            key={notification.id}
                            href={notification.url ?? route('notifications.index')}
                            onClick={() => !notification.read_at && router.patch(route('notifications.read', notification.id))}
                            className={`block border-b p-4 transition-colors last:border-0 hover:bg-muted/50 ${notification.read_at ? '' : 'bg-primary/5'}`}
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <div className="font-medium">{notification.title}</div>
                                    <div className="mt-1 text-sm text-muted-foreground">{notification.message}</div>
                                </div>
                                <time className="shrink-0 text-xs text-muted-foreground">{new Date(notification.created_at).toLocaleString()}</time>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
