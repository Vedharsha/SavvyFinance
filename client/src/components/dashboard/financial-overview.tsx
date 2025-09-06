import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { DollarSign, TrendingUp, TrendingDown, Target } from "lucide-react";
import type { Transaction } from "@shared/schema";

export function FinancialOverview() {
  const { data: transactions, isLoading } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions"],
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-8 rounded-full" />
              </div>
              <Skeleton className="h-8 w-32 mb-1" />
              <Skeleton className="h-4 w-28" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  // Filter transactions for current month
  const currentMonthTransactions = transactions?.filter(t => {
    const transactionDate = new Date(t.date);
    return transactionDate.getMonth() === currentMonth && transactionDate.getFullYear() === currentYear;
  }) || [];

  // Calculate totals
  const monthlyIncome = currentMonthTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);

  const monthlyExpenses = currentMonthTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);

  const totalBalance = monthlyIncome - monthlyExpenses;
  const savingsRate = monthlyIncome > 0 ? ((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100 : 0;

  // Calculate previous month for comparison
  const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const previousYear = currentMonth === 0 ? currentYear - 1 : currentYear;
  
  const previousMonthTransactions = transactions?.filter(t => {
    const transactionDate = new Date(t.date);
    return transactionDate.getMonth() === previousMonth && transactionDate.getFullYear() === previousYear;
  }) || [];

  const previousMonthExpenses = previousMonthTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);

  const expenseChange = previousMonthExpenses > 0 
    ? ((monthlyExpenses - previousMonthExpenses) / previousMonthExpenses) * 100 
    : 0;

  const cards = [
    {
      title: "Total Balance",
      value: `₹${totalBalance.toLocaleString()}`,
      change: savingsRate > 0 ? `+${savingsRate.toFixed(1)}% savings rate` : "No savings this month",
      icon: DollarSign,
      iconColor: "bg-success/10 text-success",
      isPositive: savingsRate > 0,
      testId: "card-total-balance"
    },
    {
      title: "Monthly Income",
      value: `₹${monthlyIncome.toLocaleString()}`,
      change: "Salary + Freelance",
      icon: TrendingUp,
      iconColor: "bg-primary/10 text-primary",
      isPositive: true,
      testId: "card-monthly-income"
    },
    {
      title: "Monthly Expenses",
      value: `₹${monthlyExpenses.toLocaleString()}`,
      change: expenseChange !== 0 ? `${expenseChange > 0 ? '+' : ''}${expenseChange.toFixed(1)}% from last month` : "No change from last month",
      icon: TrendingDown,
      iconColor: "bg-destructive/10 text-destructive",
      isPositive: expenseChange <= 0,
      testId: "card-monthly-expenses"
    },
    {
      title: "Savings Rate",
      value: `${savingsRate.toFixed(1)}%`,
      change: `₹${(monthlyIncome - monthlyExpenses).toLocaleString()} saved this month`,
      icon: Target,
      iconColor: "bg-warning/10 text-warning",
      isPositive: savingsRate > 0,
      testId: "card-savings-rate"
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {cards.map((card) => (
        <Card key={card.title} data-testid={card.testId}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground" data-testid={`text-${card.testId}-title`}>
                {card.title}
              </p>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${card.iconColor}`}>
                <card.icon className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-bold" data-testid={`text-${card.testId}-value`}>
              {card.value}
            </p>
            <p className={`text-sm mt-1 flex items-center ${
              card.isPositive ? 'text-success' : 'text-muted-foreground'
            }`} data-testid={`text-${card.testId}-change`}>
              {card.isPositive && card.title !== "Monthly Income" && (
                <TrendingUp className="w-3 h-3 mr-1" />
              )}
              {card.title === "Monthly Expenses" && expenseChange > 0 && (
                <TrendingUp className="w-3 h-3 mr-1" />
              )}
              {card.change}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
