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
  TotalRevenueCard
} from "@/Pages/DashboardComponents";

export default function Dashboard() {
  return (
    <AuthenticatedLayout>
      <Head title="Dashboard" />

      <div className="space-y-4">
        <div className="flex flex-row items-center justify-between">
          <h1 className="text-xl font-bold tracking-tight lg:text-2xl">Dashboard</h1>
          <div className="flex items-center space-x-2">
            <CustomDateRangePicker />
            <Button>
              <Download />
              <span className="hidden lg:inline">Download</span>
            </Button>
          </div>
        </div>
        <div className="gap-4 space-y-4 lg:grid lg:grid-cols-3 lg:space-y-0">
          <TeamMembersCard />
          <SubscriptionsCard />
          <TotalRevenueCard />
          <ChatWidget />
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
