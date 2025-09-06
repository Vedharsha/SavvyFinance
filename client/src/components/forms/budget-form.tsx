import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { insertBudgetSchema, type Budget } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const budgetFormSchema = insertBudgetSchema.extend({
  amount: z.string().min(1, "Amount is required"),
});

type BudgetFormData = z.infer<typeof budgetFormSchema>;

interface BudgetFormProps {
  budget?: Budget | null;
  onSuccess?: () => void;
}

const categories = [
  "Food",
  "Transportation", 
  "Entertainment",
  "Bills",
  "Shopping",
  "Healthcare",
  "Education",
  "Travel",
  "Groceries",
  "Utilities",
  "Insurance",
  "Investment",
  "Other"
];

export function BudgetForm({ budget, onSuccess }: BudgetFormProps) {
  const { toast } = useToast();
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  const form = useForm<BudgetFormData>({
    resolver: zodResolver(budgetFormSchema),
    defaultValues: {
      amount: budget?.amount || "",
      category: budget?.category || "Food",
      month: budget?.month || currentMonth,
      year: budget?.year || currentYear,
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: BudgetFormData) => {
      const response = await apiRequest("POST", "/api/budgets", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/budgets"] });
      toast({
        title: "Success",
        description: "Budget created successfully",
      });
      onSuccess?.();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create budget",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: BudgetFormData) => {
      const response = await apiRequest("PUT", `/api/budgets/${budget!.id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/budgets"] });
      toast({
        title: "Success",
        description: "Budget updated successfully",
      });
      onSuccess?.();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update budget",
        variant: "destructive",
      });
    },
  });

  const isPending = createMutation.isPending || updateMutation.isPending;

  const onSubmit = (data: BudgetFormData) => {
    if (budget) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" data-testid="budget-form">
      <div className="space-y-2">
        <Label htmlFor="category">Category</Label>
        <Select
          value={form.watch("category")}
          onValueChange={(value) => form.setValue("category", value as any)}
          disabled={isPending}
        >
          <SelectTrigger data-testid="select-budget-category">
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {form.formState.errors.category && (
          <p className="text-sm text-destructive">
            {form.formState.errors.category.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="amount">Budget Amount (₹)</Label>
        <Input
          id="amount"
          type="number"
          step="0.01"
          placeholder="0.00"
          {...form.register("amount")}
          disabled={isPending}
          data-testid="input-budget-amount"
        />
        {form.formState.errors.amount && (
          <p className="text-sm text-destructive">
            {form.formState.errors.amount.message}
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="month">Month</Label>
          <Select
            value={form.watch("month")?.toString()}
            onValueChange={(value) => form.setValue("month", parseInt(value))}
            disabled={isPending}
          >
            <SelectTrigger data-testid="select-budget-month">
              <SelectValue placeholder="Select month" />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 12 }, (_, i) => (
                <SelectItem key={i + 1} value={(i + 1).toString()}>
                  {new Date(2024, i).toLocaleDateString('en-US', { month: 'long' })}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {form.formState.errors.month && (
            <p className="text-sm text-destructive">
              {form.formState.errors.month.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="year">Year</Label>
          <Select
            value={form.watch("year")?.toString()}
            onValueChange={(value) => form.setValue("year", parseInt(value))}
            disabled={isPending}
          >
            <SelectTrigger data-testid="select-budget-year">
              <SelectValue placeholder="Select year" />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 5 }, (_, i) => {
                const year = currentYear + i;
                return (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
          {form.formState.errors.year && (
            <p className="text-sm text-destructive">
              {form.formState.errors.year.message}
            </p>
          )}
        </div>
      </div>

      <Button 
        type="submit" 
        className="w-full" 
        disabled={isPending}
        data-testid="button-submit-budget"
      >
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {budget ? "Updating..." : "Creating..."}
          </>
        ) : (
          budget ? "Update Budget" : "Create Budget"
        )}
      </Button>
    </form>
  );
}
