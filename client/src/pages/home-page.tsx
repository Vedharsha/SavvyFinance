import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { FinancialOverview } from "@/components/dashboard/financial-overview";
import { Charts } from "@/components/dashboard/charts";
import { BudgetProgress } from "@/components/dashboard/budget-progress";
import { RecentTransactions } from "@/components/dashboard/recent-transactions";
import { AlertNotifications } from "@/components/dashboard/alert-notifications";

export default function HomePage() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden">
        <Header 
          title="Dashboard" 
          subtitle="Welcome back! Here's your financial overview." 
        />
        <div className="flex-1 overflow-y-auto p-6">
          <AlertNotifications />
          <FinancialOverview />
          <Charts />
          <BudgetProgress />
          <RecentTransactions />
        </div>
      </main>
    </div>
  );
}
