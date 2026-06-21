import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { 
    Clock, 
    User, 
    Settings, 
    Key, 
    Database, 
    ClipboardList,
    AlertCircle
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

export default function RecentActivityWidget({ recentActivity }: ActivityProps) {
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
        if (ev.includes('setting.') || ev.includes('cache.') || ev.includes('logs.')) {
            return <Settings className="h-3.5 w-3.5 text-indigo-500" />;
        }
        return <ClipboardList className="h-3.5 w-3.5 text-slate-500" />;
    };

    return (
        <Card className="border bg-card/60 backdrop-blur-md shadow-xs hover:border-primary/20 transition-all duration-300">
            <CardHeader className="pb-3 border-b border-dashed">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary" />
                    Recent System Activity
                </CardTitle>
                <CardDescription className="text-xs">Chronological timeline of admin operations</CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
                {recentActivity.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-8 text-center text-xs text-muted-foreground">
                        <AlertCircle className="h-8 w-8 mb-2 opacity-50 text-muted-foreground" />
                        <p className="font-semibold">No recent activity logs recorded.</p>
                    </div>
                ) : (
                    <div className="relative pl-4 space-y-4 border-l border-muted">
                        {recentActivity.map((activity, idx) => (
                            <div key={activity.id} className="relative group text-xs">
                                {/* Timeline Dot Icon */}
                                <div className="absolute -left-[25px] top-0.5 p-1 rounded-lg border bg-card shrink-0 shadow-2xs group-hover:scale-105 transition-transform duration-200">
                                    {getActivityIcon(activity.event)}
                                </div>
                                
                                {/* Content details */}
                                <div className="space-y-0.5 min-w-0">
                                    <div className="flex items-center justify-between gap-2 flex-wrap">
                                        <span className="font-bold text-foreground truncate max-w-[200px]" title={activity.description}>
                                            {activity.description}
                                        </span>
                                        <span className="text-[10px] text-muted-foreground font-mono bg-muted px-1.5 py-0.2 rounded shrink-0">
                                            {activity.created_at}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                                        <span className="font-semibold text-primary/80">@{activity.actor}</span>
                                        <span>•</span>
                                        <span className="font-mono uppercase text-[9px] tracking-wider font-bold">
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
