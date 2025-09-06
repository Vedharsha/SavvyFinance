import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { BudgetForm } from "@/components/forms/budget-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { queryClient } from "@/lib/queryClient";
import { Plus, Edit, Trash2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Budget } from "@shared/schema";

export default function BudgetPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const { toast } = useToast();

  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  const { data: budgets, isLoading } = useQuery<Budget[]>({
    queryKey: ["/api/budgets"],
    queryFn: async () => {
      const response = await fetch(`/api/budgets?month=${currentMonth}&year=${currentYear}`, {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch budgets");
      return response.json();
    },
  });

  const { data: spendingData } = useQuery<Array<{ category: string; total: string }>>({
    queryKey: ["/api/analytics/spending"],
    queryFn: async () => {
      const response = await fetch(`/api/analytics/spending?month=${currentMonth}&year=${currentYear}`, {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch spending data");
      return response.json();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/budgets/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/budgets"] });
      toast({
        title: "Success",
        description: "Budget deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete budget",
        variant: "destructive",
      });
    },
  });

  const handleEdit = (budget: Budget) => {
    setEditingBudget(budget);
    setIsFormOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this budget?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingBudget(null);
  };

  const getSpentAmount = (category: string) => {
    const spent = spendingData?.find(s => s.category === category);
    return spent ? parseFloat(spent.total) : 0;
  };

  const getCategoryColor = (category: string, percentage: number) => {
    const colors: Record<string, string> = {
      Food: percentage >= 80 ? "bg-red-500" : percentage >= 60 ? "bg-yellow-500" : "bg-green-500",
      Transportation: percentage >= 80 ? "bg-red-500" : percentage >= 60 ? "bg-yellow-500" : "bg-blue-500",
      Entertainment: percentage >= 80 ? "bg-red-500" : percentage >= 60 ? "bg-yellow-500" : "bg-green-500",
      Bills: percentage >= 80 ? "bg-red-500" : percentage >= 60 ? "bg-yellow-500" : "bg-purple-500",
      Shopping: percentage >= 80 ? "bg-red-500" : percentage >= 60 ? "bg-yellow-500" : "bg-yellow-500",
      Healthcare: percentage >= 80 ? "bg-red-500" : percentage >= 60 ? "bg-yellow-500" : "bg-pink-500",
      Education: percentage >= 80 ? "bg-red-500" : percentage >= 60 ? "bg-yellow-500" : "bg-indigo-500",
      Travel: percentage >= 80 ? "bg-red-500" : percentage >= 60 ? "bg-yellow-500" : "bg-orange-500",
      Groceries: percentage >= 80 ? "bg-red-500" : percentage >= 60 ? "bg-yellow-500" : "bg-lime-500",
      Utilities: percentage >= 80 ? "bg-red-500" : percentage >= 60 ? "bg-yellow-500" : "bg-cyan-500",
      Insurance: percentage >= 80 ? "bg-red-500" : percentage >= 60 ? "bg-yellow-500" : "bg-gray-500",
      Investment: percentage >= 80 ? "bg-red-500" : percentage >= 60 ? "bg-yellow-500" : "bg-emerald-500",
      Other: percentage >= 80 ? "bg-red-500" : percentage >= 60 ? "bg-yellow-500" : "bg-slate-500",
    };
    return colors[category] || colors.Other;
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden">
        <Header 
          title="Budget" 
          subtitle="Set and track your monthly budgets"
          action={
            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
              <DialogTrigger asChild>
                <Button data-testid="button-add-budget">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Budget
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>
                    {editingBudget ? "Edit Budget" : "Add Budget"}
                  </DialogTitle>
                </DialogHeader>
                <BudgetForm 
                  budget={editingBudget}
                  onSuccess={handleFormClose}
                />
              </DialogContent>
            </Dialog>
          }
        />

        <div className="flex-1 overflow-y-auto p-6">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Budgets - {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-6">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="space-y-3">
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
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <Plus className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">No budgets set</h3>
                  <p className="text-muted-foreground mb-4">
                    Create your first budget to start tracking your spending.
                  </p>
                  <Button onClick={() => setIsFormOpen(true)} data-testid="button-add-first-budget">
                    Create Your First Budget
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  {budgets?.map((budget) => {
                    const spentAmount = getSpentAmount(budget.category);
                    const budgetAmount = parseFloat(budget.amount);
                    const percentage = (spentAmount / budgetAmount) * 100;
                    const remaining = budgetAmount - spentAmount;

                    return (
                      <div key={budget.id} className="space-y-3" data-testid={`budget-${budget.id}`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div className={`w-3 h-3 rounded-full ${getCategoryColor(budget.category, percentage)}`}></div>
                            <span className="font-medium" data-testid={`text-category-${budget.id}`}>
                              {budget.category}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="text-right" data-testid={`text-amounts-${budget.id}`}>
                              <span className="font-semibold">₹{spentAmount.toLocaleString()}</span>
                              <span className="text-muted-foreground"> / ₹{budgetAmount.toLocaleString()}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit(budget)}
                                data-testid={`button-edit-budget-${budget.id}`}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(budget.id)}
                                disabled={deleteMutation.isPending}
                                data-testid={`button-delete-budget-${budget.id}`}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                        
                        <Progress 
                          value={Math.min(percentage, 100)} 
                          className="h-2"
                          data-testid={`progress-${budget.id}`}
                        />
                        
                        <p className="text-sm text-muted-foreground" data-testid={`text-status-${budget.id}`}>
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
        </div>
      </main>
    </div>
  );
}
