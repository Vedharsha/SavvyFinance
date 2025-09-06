import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useLocation } from "wouter";
import type { Transaction } from "@shared/schema";

export function RecentTransactions() {
  const [, setLocation] = useLocation();

  const { data: transactions, isLoading } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions"],
    queryFn: async () => {
      const response = await fetch("/api/transactions?limit=5", {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch transactions");
      return response.json();
    },
  });

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      Food: "bg-red-100 text-red-800",
      Transportation: "bg-blue-100 text-blue-800",
      Entertainment: "bg-green-100 text-green-800",
      Bills: "bg-purple-100 text-purple-800",
      Shopping: "bg-yellow-100 text-yellow-800",
      Healthcare: "bg-pink-100 text-pink-800",
      Education: "bg-indigo-100 text-indigo-800",
      Travel: "bg-orange-100 text-orange-800",
      Groceries: "bg-lime-100 text-lime-800",
      Utilities: "bg-cyan-100 text-cyan-800",
      Insurance: "bg-gray-100 text-gray-800",
      Investment: "bg-emerald-100 text-emerald-800",
      Income: "bg-teal-100 text-teal-800",
      Other: "bg-slate-100 text-slate-800",
    };
    return colors[category] || colors.Other;
  };

  const formatDate = (date: string) => {
    const transactionDate = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (transactionDate.toDateString() === today.toDateString()) {
      return "Today";
    } else if (transactionDate.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      const days = Math.floor((today.getTime() - transactionDate.getTime()) / (1000 * 60 * 60 * 24));
      return `${days} days ago`;
    }
  };

  return (
    <Card data-testid="card-recent-transactions">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Recent Transactions</CardTitle>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setLocation("/transactions")}
            data-testid="button-view-all-transactions"
          >
            View All
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="w-10 h-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
          </div>
        ) : transactions?.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No transactions yet.</p>
            <p className="text-sm text-muted-foreground mt-1">Add your first transaction to get started.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {transactions?.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center space-x-4 p-3 hover:bg-accent rounded-lg transition-colors"
                data-testid={`recent-transaction-${transaction.id}`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  transaction.type === 'income' ? 'bg-success/10' : 'bg-destructive/10'
                }`}>
                  {transaction.type === 'income' ? (
                    <svg className="w-5 h-5 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 17l10-10M17 7H7v10" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 7l-10 10M7 7l10 10" />
                    </svg>
                  )}
                </div>
                
                <div className="flex-1">
                  <p className="font-medium" data-testid={`text-recent-description-${transaction.id}`}>
                    {transaction.description}
                  </p>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Badge className={getCategoryColor(transaction.category)} data-testid={`badge-recent-category-${transaction.id}`}>
                      {transaction.category}
                    </Badge>
                    <span>•</span>
                    <span data-testid={`text-recent-date-${transaction.id}`}>
                      {formatDate(transaction.date.toString())}
                    </span>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className={`font-medium ${
                    transaction.type === 'income' ? 'text-success' : 'text-destructive'
                  }`} data-testid={`text-recent-amount-${transaction.id}`}>
                    {transaction.type === 'income' ? '+' : '-'}₹{parseFloat(transaction.amount).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
