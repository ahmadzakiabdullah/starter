import React from 'react';
import { Users, Key, Database, Bell } from 'lucide-react';
import { Card, CardContent } from '@/Components/ui/card';

interface StatsProps {
    stats: {
        total_users: number;
        total_roles: number;
        total_backups: number;
        unread_notifications: number;
    };
}

export default function AdminStatsGrid({ stats }: StatsProps) {
    const cards = [
        {
            title: "Total Profiles",
            value: stats.total_users,
            description: "Registered system accounts",
            icon: Users,
            color: "text-blue-500",
            bg: "bg-blue-500/10 border-blue-500/20"
        },
        {
            title: "Access Roles",
            value: stats.total_roles,
            description: "Configured permissions",
            icon: Key,
            color: "text-amber-500",
            bg: "bg-amber-500/10 border-amber-500/20"
        },
        {
            title: "Backup Archives",
            value: stats.total_backups,
            description: "Database snapshots stored",
            icon: Database,
            color: "text-emerald-500",
            bg: "bg-emerald-500/10 border-emerald-500/20"
        },
        {
            title: "Pending Alerts",
            value: stats.unread_notifications,
            description: "Unread admin notifications",
            icon: Bell,
            color: stats.unread_notifications > 0 ? "text-rose-500 animate-pulse" : "text-slate-500",
            bg: stats.unread_notifications > 0 ? "bg-rose-500/10 border-rose-500/20" : "bg-slate-500/10 border-slate-500/20"
        }
    ];

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {cards.map((card, idx) => (
                <Card key={idx} className="overflow-hidden border bg-card/60 backdrop-blur-md hover:border-primary/30 transition-all duration-300 group shadow-xs">
                    <CardContent className="p-4 flex items-center justify-between gap-4">
                        <div className="space-y-1 min-w-0">
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">{card.title}</span>
                            <span className="text-xl sm:text-2xl font-bold tracking-tight block text-foreground leading-none mt-1">
                                {card.value}
                            </span>
                            <span className="text-[10px] text-muted-foreground truncate block">{card.description}</span>
                        </div>
                        <div className={`p-3 rounded-xl border shrink-0 ${card.bg} group-hover:scale-105 transition-transform duration-300`}>
                            <card.icon className={`h-5 w-5 ${card.color}`} />
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
