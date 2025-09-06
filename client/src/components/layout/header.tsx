import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, Plus } from "lucide-react";
import { TransactionForm } from "@/components/forms/transaction-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import type { Notification } from "@shared/schema";

interface HeaderProps {
  title: string;
  subtitle: string;
  action?: React.ReactNode;
}

export function Header({ title, subtitle, action }: HeaderProps) {
  const [isTransactionFormOpen, setIsTransactionFormOpen] = useState(false);

  const { data: notifications } = useQuery<Notification[]>({
    queryKey: ["/api/notifications"],
  });

  const unreadCount = notifications?.filter(n => !n.isRead).length || 0;

  return (
    <header className="bg-card border-b border-border px-6 py-4" data-testid="header">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" data-testid="text-page-title">{title}</h1>
          <p className="text-muted-foreground" data-testid="text-page-subtitle">{subtitle}</p>
        </div>
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <div className="relative">
            <Button 
              variant="ghost"
              size="sm"
              className="relative"
              data-testid="button-notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center p-0 text-xs"
                  data-testid="badge-notification-count"
                >
                  {unreadCount}
                </Badge>
              )}
            </Button>
          </div>
          
          {/* Action button or Add Transaction button */}
          {action || (
            <Dialog open={isTransactionFormOpen} onOpenChange={setIsTransactionFormOpen}>
              <DialogTrigger asChild>
                <Button data-testid="button-header-add-transaction">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Transaction
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Add Transaction</DialogTitle>
                </DialogHeader>
                <TransactionForm 
                  onSuccess={() => setIsTransactionFormOpen(false)}
                />
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>
    </header>
  );
}
