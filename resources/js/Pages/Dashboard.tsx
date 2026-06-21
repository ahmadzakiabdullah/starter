import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import CustomDateRangePicker from "@/Components/custom-date-range-picker";
import { Button } from "@/Components/ui/button";
import { Download } from "lucide-react";

import {
  ChatWidget,
  ExerciseMinutes,
  LatestPayments,
  PaymentMethodCard,
  SubscriptionsCard,
  TeamMembersCard,
  TotalRevenueCard,
  AdminStatsGrid,
  TelemetryWidget,
  RecentActivityWidget
} from "@/Pages/DashboardComponents";

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

export default function Dashboard({ stats, recentActivity, telemetry }: DashboardProps) {
  return (
    <AuthenticatedLayout>
      <Head title="Dashboard" />

      <div className="space-y-6">
        {/* Title and date filter banner */}
        <div className="flex flex-row items-center justify-between">
          <h1 className="text-xl font-bold tracking-tight lg:text-2xl">Dashboard</h1>
          <div className="flex items-center space-x-2">
            <CustomDateRangePicker />
            <Button size="sm">
              <Download className="mr-1.5 h-4 w-4" />
              <span>Download</span>
            </Button>
          </div>
        </div>

        {/* Dynamic Admin statistics grid */}
        <AdminStatsGrid stats={stats} />

        {/* Core telemetry, activities and analytics cards */}
        <div className="gap-4 space-y-4 lg:grid lg:grid-cols-3 lg:space-y-0">
          <TelemetryWidget telemetry={telemetry} />
          <RecentActivityWidget recentActivity={recentActivity} />
          <ChatWidget />
          
          <TeamMembersCard />
          <SubscriptionsCard />
          <TotalRevenueCard />
          
          <div className="lg:col-span-2">
            <ExerciseMinutes />
          </div>
          <div className="lg:col-span-2">
            <LatestPayments />
          </div>
          <PaymentMethodCard />
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
