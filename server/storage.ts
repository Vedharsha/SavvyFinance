import { 
  users, 
  transactions, 
  budgets, 
  goals, 
  notifications,
  type User, 
  type InsertUser,
  type Transaction,
  type InsertTransaction,
  type Budget,
  type InsertBudget,
  type Goal,
  type InsertGoal,
  type Notification,
  type InsertNotification
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, sql, gte, lte } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Transaction methods
  getTransactions(userId: string, limit?: number): Promise<Transaction[]>;
  getTransactionsByDateRange(userId: string, startDate: Date, endDate: Date): Promise<Transaction[]>;
  createTransaction(transaction: InsertTransaction & { userId: string }): Promise<Transaction>;
  updateTransaction(id: string, transaction: Partial<InsertTransaction>): Promise<Transaction | undefined>;
  deleteTransaction(id: string): Promise<boolean>;

  // Budget methods
  getBudgets(userId: string, month?: number, year?: number): Promise<Budget[]>;
  getBudgetByCategory(userId: string, category: string, month: number, year: number): Promise<Budget | undefined>;
  createBudget(budget: InsertBudget & { userId: string }): Promise<Budget>;
  updateBudget(id: string, budget: Partial<InsertBudget>): Promise<Budget | undefined>;
  deleteBudget(id: string): Promise<boolean>;

  // Goal methods
  getGoals(userId: string): Promise<Goal[]>;
  createGoal(goal: InsertGoal & { userId: string }): Promise<Goal>;
  updateGoal(id: string, goal: Partial<InsertGoal>): Promise<Goal | undefined>;
  deleteGoal(id: string): Promise<boolean>;

  // Notification methods
  getNotifications(userId: string): Promise<Notification[]>;
  createNotification(notification: InsertNotification & { userId: string }): Promise<Notification>;
  markNotificationAsRead(id: string): Promise<boolean>;

  // Analytics methods
  getSpendingByCategory(userId: string, month: number, year: number): Promise<Array<{ category: string; total: string }>>;
  getMonthlyTrends(userId: string, months: number): Promise<Array<{ month: string; income: string; expenses: string }>>;
  
  sessionStore: any;
}

export class DatabaseStorage implements IStorage {
  sessionStore: any;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true 
    });
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    try {
      console.log("Inserting user into database:", insertUser);
      const [user] = await db
        .insert(users)
        .values(insertUser)
        .returning();
      console.log("Inserted user:", user);
      return user;
    } catch (error: any) {
      if (error.code === '23505') { // Unique constraint violation
        const constraint = error.detail.match(/\((.*?)\)/)?.[1];
        throw new Error(
          constraint === 'username'
            ? 'Username already exists.'
            : constraint === 'email'
            ? 'Email already exists.'
            : 'Unique constraint violation.'
        );
      }
      throw error; // Re-throw other errors
    }
  }

  // Transaction methods
  async getTransactions(userId: string, limit = 50): Promise<Transaction[]> {
    return await db
      .select()
      .from(transactions)
      .where(eq(transactions.userId, userId))
      .orderBy(desc(transactions.date))
      .limit(limit);
  }

  async getTransactionsByDateRange(userId: string, startDate: Date, endDate: Date): Promise<Transaction[]> {
    return await db
      .select()
      .from(transactions)
      .where(
        and(
          eq(transactions.userId, userId),
          gte(transactions.date, startDate),
          lte(transactions.date, endDate)
        )
      )
      .orderBy(desc(transactions.date));
  }

  async createTransaction(transaction: InsertTransaction & { userId: string }): Promise<Transaction> {
    const [newTransaction] = await db
      .insert(transactions)
      .values(transaction)
      .returning();
    return newTransaction;
  }

  async updateTransaction(id: string, transaction: Partial<InsertTransaction>): Promise<Transaction | undefined> {
    const [updatedTransaction] = await db
      .update(transactions)
      .set(transaction)
      .where(eq(transactions.id, id))
      .returning();
    return updatedTransaction || undefined;
  }

  async deleteTransaction(id: string): Promise<boolean> {
    const result = await db
      .delete(transactions)
      .where(eq(transactions.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Budget methods
  async getBudgets(userId: string, month?: number, year?: number): Promise<Budget[]> {
    if (month !== undefined && year !== undefined) {
      return await db
        .select()
        .from(budgets)
        .where(and(
          eq(budgets.userId, userId),
          eq(budgets.month, month),
          eq(budgets.year, year)
        ));
    }
    
    return await db
      .select()
      .from(budgets)
      .where(eq(budgets.userId, userId));
  }

  async getBudgetByCategory(userId: string, category: string, month: number, year: number): Promise<Budget | undefined> {
    const [budget] = await db
      .select()
      .from(budgets)
      .where(
        and(
          eq(budgets.userId, userId),
          eq(budgets.category, category as any),
          eq(budgets.month, month),
          eq(budgets.year, year)
        )
      );
    return budget || undefined;
  }

  async createBudget(budget: InsertBudget & { userId: string }): Promise<Budget> {
    const [newBudget] = await db
      .insert(budgets)
      .values(budget)
      .returning();
    return newBudget;
  }

  async updateBudget(id: string, budget: Partial<InsertBudget>): Promise<Budget | undefined> {
    const [updatedBudget] = await db
      .update(budgets)
      .set(budget)
      .where(eq(budgets.id, id))
      .returning();
    return updatedBudget || undefined;
  }

  async deleteBudget(id: string): Promise<boolean> {
    const result = await db
      .delete(budgets)
      .where(eq(budgets.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Goal methods
  async getGoals(userId: string): Promise<Goal[]> {
    return await db
      .select()
      .from(goals)
      .where(eq(goals.userId, userId))
      .orderBy(desc(goals.createdAt));
  }

  async createGoal(goal: InsertGoal & { userId: string }): Promise<Goal> {
    const [newGoal] = await db
      .insert(goals)
      .values(goal)
      .returning();
    return newGoal;
  }

  async updateGoal(id: string, goal: Partial<InsertGoal>): Promise<Goal | undefined> {
    const [updatedGoal] = await db
      .update(goals)
      .set(goal)
      .where(eq(goals.id, id))
      .returning();
    return updatedGoal || undefined;
  }

  async deleteGoal(id: string): Promise<boolean> {
    const result = await db
      .delete(goals)
      .where(eq(goals.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Notification methods
  async getNotifications(userId: string): Promise<Notification[]> {
    return await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt));
  }

  async createNotification(notification: InsertNotification & { userId: string }): Promise<Notification> {
    const [newNotification] = await db
      .insert(notifications)
      .values(notification)
      .returning();
    return newNotification;
  }

  async markNotificationAsRead(id: string): Promise<boolean> {
    const result = await db
      .update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Analytics methods
  async getSpendingByCategory(userId: string, month: number, year: number): Promise<Array<{ category: string; total: string }>> {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const result = await db
      .select({
        category: transactions.category,
        total: sql<string>`SUM(${transactions.amount})`,
      })
      .from(transactions)
      .where(
        and(
          eq(transactions.userId, userId),
          eq(transactions.type, 'expense'),
          gte(transactions.date, startDate),
          lte(transactions.date, endDate)
        )
      )
      .groupBy(transactions.category);

    return result;
  }

  async getMonthlyTrends(userId: string, months: number): Promise<Array<{ month: string; income: string; expenses: string }>> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(endDate.getMonth() - months);

    const result = await db
      .select({
        month: sql<string>`TO_CHAR(${transactions.date}, 'YYYY-MM')`,
        income: sql<string>`SUM(CASE WHEN ${transactions.type} = 'income' THEN ${transactions.amount} ELSE 0 END)`,
        expenses: sql<string>`SUM(CASE WHEN ${transactions.type} = 'expense' THEN ${transactions.amount} ELSE 0 END)`,
      })
      .from(transactions)
      .where(
        and(
          eq(transactions.userId, userId),
          gte(transactions.date, startDate),
          lte(transactions.date, endDate)
        )
      )
      .groupBy(sql`TO_CHAR(${transactions.date}, 'YYYY-MM')`)
      .orderBy(sql`TO_CHAR(${transactions.date}, 'YYYY-MM')`);

    return result;
  }
}

export const storage = new DatabaseStorage();
