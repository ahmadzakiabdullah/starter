import { Card, CardContent } from '@/Components/ui/card';
import { Bell, Database, Key, Users } from 'lucide-react';

interface StatsProps {
    stats: {
        total_users: number | null;
        total_roles: number | null;
        total_backups: number | null;
        unread_notifications: number;
    };
}

export default function AdminStatsGrid({ stats }: StatsProps) {
    const cards = [
        {
            title: 'Total Profiles',
            value: stats.total_users,
            description: 'Registered system accounts',
            icon: Users,
            color: 'text-blue-500',
            bg: 'bg-blue-500/10 border-blue-500/20',
        },
        {
            title: 'Access Roles',
            value: stats.total_roles,
            description: 'Configured permissions',
            icon: Key,
            color: 'text-amber-500',
            bg: 'bg-amber-500/10 border-amber-500/20',
        },
        {
            title: 'Backup Archives',
            value: stats.total_backups,
            description: 'Database snapshots stored',
            icon: Database,
            color: 'text-emerald-500',
            bg: 'bg-emerald-500/10 border-emerald-500/20',
        },
        {
            title: 'Pending Alerts',
            value: stats.unread_notifications,
            description: 'Unread admin notifications',
            icon: Bell,
            color:
                stats.unread_notifications > 0
                    ? 'text-rose-500 animate-pulse'
                    : 'text-slate-500',
            bg:
                stats.unread_notifications > 0
                    ? 'bg-rose-500/10 border-rose-500/20'
                    : 'bg-slate-500/10 border-slate-500/20',
        },
    ];

    return (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {cards.map((card, idx) => (
                <Card
                    key={idx}
                    className="bg-card/60 hover:border-primary/30 group overflow-hidden border shadow-xs backdrop-blur-md transition-all duration-300"
                >
                    <CardContent className="flex items-center justify-between gap-4 p-4">
                        <div className="min-w-0 space-y-1">
                            <span className="text-muted-foreground block text-[10px] font-bold tracking-wider uppercase">
                                {card.title}
                            </span>
                            <span className="text-foreground mt-1 block text-xl leading-none font-bold tracking-tight sm:text-2xl">
                                {card.value ?? '—'}
                            </span>
                            <span className="text-muted-foreground block truncate text-[10px]">
                                {card.description}
                            </span>
                        </div>
                        <div
                            className={`shrink-0 rounded-xl border p-3 ${card.bg} transition-transform duration-300 group-hover:scale-105`}
                        >
                            <card.icon className={`h-5 w-5 ${card.color}`} />
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
