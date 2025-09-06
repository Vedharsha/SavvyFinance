import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import type { Budget } from "@shared/schema";

export function BudgetProgress() {
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  const { data: budgets, isLoading: budgetsLoading } = useQuery<Budget[]>({
    queryKey: ["/api/budgets"],
    queryFn: async () => {
      const response = await fetch(`/api/budgets?month=${currentMonth}&year=${currentYear}`, {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch budgets");
      return response.json();
    },
  });

  const { data: spendingData, isLoading: spendingLoading } = useQuery<Array<{ category: string; total: string }>>({
    queryKey: ["/api/analytics/spending"],
    queryFn: async () => {
      const response = await fetch(`/api/analytics/spending?month=${currentMonth}&year=${currentYear}`, {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch spending data");
      return response.json();
    },
  });

  const isLoading = budgetsLoading || spendingLoading;

  const getSpentAmount = (category: string) => {
    const spent = spendingData?.find(s => s.category === category);
    return spent ? parseFloat(spent.total) : 0;
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      Food: "bg-red-500",
      Transportation: "bg-blue-500",
      Entertainment: "bg-green-500",
      Bills: "bg-purple-500",
      Shopping: "bg-yellow-500",
      Healthcare: "bg-pink-500",
      Education: "bg-indigo-500",
      Travel: "bg-orange-500",
      Groceries: "bg-lime-500",
      Utilities: "bg-cyan-500",
      Insurance: "bg-gray-500",
      Investment: "bg-emerald-500",
      Other: "bg-slate-500",
    };
    return colors[category] || colors.Other;
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return "bg-destructive";
    if (percentage >= 80) return "bg-warning";
    return "bg-success";
  };

  return (
    <Card className="mb-8" data-testid="card-budget-progress">
      <CardHeader>
        <CardTitle>Budget Progress</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="h-2 w-full" />
                <Skeleton className="h-3 w-48" />
              </div>
            ))}
          </div>
        ) : budgets?.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No budgets set for this month.</p>
            <p className="text-sm text-muted-foreground mt-1">Set up budgets to track your spending progress.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {budgets?.map((budget) => {
              const spentAmount = getSpentAmount(budget.category);
              const budgetAmount = parseFloat(budget.amount);
              const percentage = (spentAmount / budgetAmount) * 100;
              const remaining = budgetAmount - spentAmount;

              return (
                <div key={budget.id} className="space-y-2" data-testid={`budget-progress-${budget.id}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${getCategoryColor(budget.category)}`}></div>
                      <span className="font-medium" data-testid={`text-budget-category-${budget.id}`}>
                        {budget.category}
                      </span>
                    </div>
                    <div className="text-right" data-testid={`text-budget-amounts-${budget.id}`}>
                      <span className="font-semibold">₹{spentAmount.toLocaleString()}</span>
                      <span className="text-muted-foreground"> / ₹{budgetAmount.toLocaleString()}</span>
                    </div>
                  </div>
                  
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all ${getProgressColor(percentage)}`}
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                      data-testid={`progress-bar-${budget.id}`}
                    ></div>
                  </div>
                  
                  <p className="text-sm text-muted-foreground" data-testid={`text-budget-status-${budget.id}`}>
                    {percentage.toFixed(1)}% used • 
                    {remaining > 0 ? (
                      <span className="text-success"> ₹{remaining.toLocaleString()} remaining</span>
                    ) : (
                      <span className="text-destructive"> ₹{Math.abs(remaining).toLocaleString()} over budget</span>
                    )}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
