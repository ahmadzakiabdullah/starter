import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import {
    AdminStatsGrid,
    RecentActivityWidget,
} from '@/Pages/DashboardComponents';
import { Head } from '@inertiajs/react';
import React, { Suspense } from 'react';

const TelemetryWidget = React.lazy(
    () => import('@/Pages/DashboardComponents/TelemetryWidget'),
);

interface DashboardProps {
    stats: {
        total_users: number;
        total_roles: number;
        total_backups: number;
        unread_notifications: number;
    };
    recentActivity: {
        id: number;
        event: string;
        description: string;
        actor: string;
        created_at: string;
    }[];
    telemetry: {
        cpu_percent: number;
        ram_percent: number;
        disk_percent: number;
        caches: {
            config: boolean;
            routes: boolean;
            debug: boolean;
        };
    };
}

export default function Dashboard({
    stats,
    recentActivity,
    telemetry,
}: DashboardProps) {
    return (
        <AuthenticatedLayout>
            <Head title="Dashboard" />

            <div className="space-y-6">
                <h1 className="text-xl font-bold tracking-tight lg:text-2xl">
                    Dashboard
                </h1>

                {/* Dynamic Admin statistics grid */}
                <AdminStatsGrid stats={stats} />

                {/* Core telemetry and activity cards */}
                <div className="gap-4 space-y-4 lg:grid lg:grid-cols-2 lg:space-y-0">
                    <Suspense
                        fallback={
                            <div className="bg-muted/20 h-[300px] animate-pulse rounded-xl" />
                        }
                    >
                        <TelemetryWidget telemetry={telemetry} />
                    </Suspense>
                    <RecentActivityWidget recentActivity={recentActivity} />
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
