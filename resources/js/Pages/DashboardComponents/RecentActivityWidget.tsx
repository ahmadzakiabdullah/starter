import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/Components/ui/card';
import {
    AlertCircle,
    ClipboardList,
    Clock,
    Database,
    Key,
    Settings,
    User,
} from 'lucide-react';

interface ActivityItem {
    id: number;
    event: string;
    description: string;
    actor: string;
    created_at: string;
}

interface ActivityProps {
    recentActivity: ActivityItem[];
}

export default function RecentActivityWidget({
    recentActivity,
}: ActivityProps) {
    const getActivityIcon = (event: string) => {
        const ev = event.toLowerCase();
        if (ev.includes('user.')) {
            return <User className="h-3.5 w-3.5 text-blue-500" />;
        }
        if (ev.includes('role.') || ev.includes('permission.')) {
            return <Key className="h-3.5 w-3.5 text-amber-500" />;
        }
        if (ev.includes('backup.')) {
            return <Database className="h-3.5 w-3.5 text-emerald-500" />;
        }
        if (
            ev.includes('setting.') ||
            ev.includes('cache.') ||
            ev.includes('logs.')
        ) {
            return <Settings className="h-3.5 w-3.5 text-indigo-500" />;
        }
        return <ClipboardList className="h-3.5 w-3.5 text-slate-500" />;
    };

    return (
        <Card className="bg-card/60 hover:border-primary/20 border shadow-xs backdrop-blur-md transition-all duration-300">
            <CardHeader className="border-b border-dashed pb-3">
                <CardTitle className="flex items-center gap-2 text-sm font-bold">
                    <Clock className="text-primary h-4 w-4" />
                    Recent System Activity
                </CardTitle>
                <CardDescription className="text-xs">
                    Chronological timeline of admin operations
                </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
                {recentActivity.length === 0 ? (
                    <div className="text-muted-foreground flex flex-col items-center justify-center p-8 text-center text-xs">
                        <AlertCircle className="text-muted-foreground mb-2 h-8 w-8 opacity-50" />
                        <p className="font-semibold">
                            No recent activity logs recorded.
                        </p>
                    </div>
                ) : (
                    <div className="border-muted relative space-y-4 border-l pl-4">
                        {recentActivity.map((activity, idx) => (
                            <div
                                key={activity.id}
                                className="group relative text-xs"
                            >
                                {/* Timeline Dot Icon */}
                                <div className="bg-card absolute top-0.5 -left-[25px] shrink-0 rounded-lg border p-1 shadow-2xs transition-transform duration-200 group-hover:scale-105">
                                    {getActivityIcon(activity.event)}
                                </div>

                                {/* Content details */}
                                <div className="min-w-0 space-y-0.5">
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                        <span
                                            className="text-foreground max-w-[200px] truncate font-bold"
                                            title={activity.description}
                                        >
                                            {activity.description}
                                        </span>
                                        <span className="text-muted-foreground bg-muted py-0.2 shrink-0 rounded px-1.5 font-mono text-[10px]">
                                            {activity.created_at}
                                        </span>
                                    </div>
                                    <div className="text-muted-foreground flex items-center gap-1.5 text-[10px]">
                                        <span className="text-primary/80 font-semibold">
                                            @{activity.actor}
                                        </span>
                                        <span>•</span>
                                        <span className="font-mono text-[9px] font-bold tracking-wider uppercase">
                                            {activity.event}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
