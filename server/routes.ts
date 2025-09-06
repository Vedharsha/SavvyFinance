import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { insertTransactionSchema, insertBudgetSchema, insertGoalSchema } from "@shared/schema";
import { z } from "zod";

export function registerRoutes(app: Express): Server {
  // Setup authentication routes
  setupAuth(app);

  // Transaction routes
  app.get("/api/transactions", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const transactions = await storage.getTransactions(req.user!.id, limit);
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });

  app.post("/api/transactions", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const validatedData = insertTransactionSchema.parse(req.body);
      const transaction = await storage.createTransaction({
        ...validatedData,
        userId: req.user!.id,
      });
      
      // Check budget alerts after creating transaction
      if (validatedData.type === 'expense') {
        await checkBudgetAlerts(req.user!.id, validatedData.category, new Date().getMonth() + 1, new Date().getFullYear());
      }
      
      res.status(201).json(transaction);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid transaction data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create transaction" });
      }
    }
  });

  app.put("/api/transactions/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const validatedData = insertTransactionSchema.partial().parse(req.body);
      const transaction = await storage.updateTransaction(req.params.id, validatedData);
      
      if (!transaction) {
        return res.status(404).json({ message: "Transaction not found" });
      }
      
      res.json(transaction);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid transaction data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update transaction" });
      }
    }
  });

  app.delete("/api/transactions/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const success = await storage.deleteTransaction(req.params.id);
      
      if (!success) {
        return res.status(404).json({ message: "Transaction not found" });
      }
      
      res.sendStatus(204);
    } catch (error) {
      res.status(500).json({ message: "Failed to delete transaction" });
    }
  });

  // Budget routes
  app.get("/api/budgets", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const month = req.query.month ? parseInt(req.query.month as string) : undefined;
      const year = req.query.year ? parseInt(req.query.year as string) : undefined;
      const budgets = await storage.getBudgets(req.user!.id, month, year);
      res.json(budgets);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch budgets" });
    }
  });

  app.post("/api/budgets", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const validatedData = insertBudgetSchema.parse(req.body);
      const budget = await storage.createBudget({
        ...validatedData,
        userId: req.user!.id,
      });
      res.status(201).json(budget);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid budget data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create budget" });
      }
    }
  });

  app.put("/api/budgets/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const validatedData = insertBudgetSchema.partial().parse(req.body);
      const budget = await storage.updateBudget(req.params.id, validatedData);
      
      if (!budget) {
        return res.status(404).json({ message: "Budget not found" });
      }
      
      res.json(budget);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid budget data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update budget" });
      }
    }
  });

  app.delete("/api/budgets/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const success = await storage.deleteBudget(req.params.id);
      
      if (!success) {
        return res.status(404).json({ message: "Budget not found" });
      }
      
      res.sendStatus(204);
    } catch (error) {
      res.status(500).json({ message: "Failed to delete budget" });
    }
  });

  // Goal routes
  app.get("/api/goals", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const goals = await storage.getGoals(req.user!.id);
      res.json(goals);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch goals" });
    }
  });

  app.post("/api/goals", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const validatedData = insertGoalSchema.parse(req.body);
      const goal = await storage.createGoal({
        ...validatedData,
        userId: req.user!.id,
      });
      res.status(201).json(goal);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid goal data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create goal" });
      }
    }
  });

  app.put("/api/goals/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const validatedData = insertGoalSchema.partial().parse(req.body);
      const goal = await storage.updateGoal(req.params.id, validatedData);
      
      if (!goal) {
        return res.status(404).json({ message: "Goal not found" });
      }
      
      res.json(goal);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid goal data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update goal" });
      }
    }
  });

  app.delete("/api/goals/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const success = await storage.deleteGoal(req.params.id);
      
      if (!success) {
        return res.status(404).json({ message: "Goal not found" });
      }
      
      res.sendStatus(204);
    } catch (error) {
      res.status(500).json({ message: "Failed to delete goal" });
    }
  });

  // Notification routes
  app.get("/api/notifications", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const notifications = await storage.getNotifications(req.user!.id);
      res.json(notifications);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  app.put("/api/notifications/:id/read", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const success = await storage.markNotificationAsRead(req.params.id);
      
      if (!success) {
        return res.status(404).json({ message: "Notification not found" });
      }
      
      res.sendStatus(204);
    } catch (error) {
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  });

  // Analytics routes
  app.get("/api/analytics/spending", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const month = parseInt(req.query.month as string) || new Date().getMonth() + 1;
      const year = parseInt(req.query.year as string) || new Date().getFullYear();
      
      const spendingData = await storage.getSpendingByCategory(req.user!.id, month, year);
      res.json(spendingData);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch spending analytics" });
    }
  });

  app.get("/api/analytics/trends", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const months = parseInt(req.query.months as string) || 6;
      const trendsData = await storage.getMonthlyTrends(req.user!.id, months);
      res.json(trendsData);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch trend analytics" });
    }
  });

  // Budget alerts helper function
  async function checkBudgetAlerts(userId: string, category: string, month: number, year: number) {
    try {
      const budget = await storage.getBudgetByCategory(userId, category, month, year);
      if (!budget) return;

      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59);
      
      const transactions = await storage.getTransactionsByDateRange(userId, startDate, endDate);
      const categoryTransactions = transactions.filter(t => t.category === category && t.type === 'expense');
      
      const totalSpent = categoryTransactions.reduce((sum, t) => sum + parseFloat(t.amount), 0);
      const budgetAmount = parseFloat(budget.amount);
      const percentage = (totalSpent / budgetAmount) * 100;

      if (percentage >= 80 && percentage < 100) {
        await storage.createNotification({
          userId,
          title: `Budget Alert - ${category}`,
          message: `You've spent ${percentage.toFixed(1)}% of your ${category} budget this month (₹${totalSpent.toLocaleString()} of ₹${budgetAmount.toLocaleString()})`,
          type: 'warning',
        });
      } else if (percentage >= 100) {
        await storage.createNotification({
          userId,
          title: `Budget Exceeded - ${category}`,
          message: `You've exceeded your ${category} budget by ₹${(totalSpent - budgetAmount).toLocaleString()}`,
          type: 'warning',
        });
      }
    } catch (error) {
      console.error('Error checking budget alerts:', error);
    }
  }

  const httpServer = createServer(app);
  return httpServer;
}
