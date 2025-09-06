import { useQuery, useMutation } from "@tanstack/react-query";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle, X } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Notification } from "@shared/schema";

export function AlertNotifications() {
  const { toast } = useToast();

  const { data: notifications } = useQuery<Notification[]>({
    queryKey: ["/api/notifications"],
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("PUT", `/api/notifications/${id}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to mark notification as read",
        variant: "destructive",
      });
    },
  });

  const unreadNotifications = notifications?.filter(n => !n.isRead) || [];

  if (unreadNotifications.length === 0) {
    return null;
  }

  const handleDismiss = (id: string) => {
    markAsReadMutation.mutate(id);
  };

  return (
    <div className="mb-6 space-y-3" data-testid="alert-notifications">
      {unreadNotifications.map((notification) => (
        <Alert
          key={notification.id}
          className={`${
            notification.type === 'warning' 
              ? 'bg-warning/10 border-warning/20' 
              : notification.type === 'success'
              ? 'bg-success/10 border-success/20'
              : 'bg-primary/10 border-primary/20'
          }`}
          data-testid={`notification-${notification.id}`}
        >
          <div className="flex items-center space-x-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              notification.type === 'warning' 
                ? 'bg-warning' 
                : notification.type === 'success'
                ? 'bg-success'
                : 'bg-primary'
            }`}>
              {notification.type === 'warning' ? (
                <AlertTriangle className="w-4 h-4 text-warning-foreground" />
              ) : notification.type === 'success' ? (
                <CheckCircle className="w-4 h-4 text-success-foreground" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-primary-foreground" />
              )}
            </div>
            <div className="flex-1">
              <AlertDescription>
                <p className={`font-medium ${
                  notification.type === 'warning' 
                    ? 'text-warning-foreground' 
                    : notification.type === 'success'
                    ? 'text-success-foreground'
                    : 'text-primary-foreground'
                }`} data-testid={`text-notification-title-${notification.id}`}>
                  {notification.title}
                </p>
                <p className={`text-sm mt-1 ${
                  notification.type === 'warning' 
                    ? 'text-warning-foreground/80' 
                    : notification.type === 'success'
                    ? 'text-success-foreground/80'
                    : 'text-primary-foreground/80'
                }`} data-testid={`text-notification-message-${notification.id}`}>
                  {notification.message}
                </p>
              </AlertDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDismiss(notification.id)}
              disabled={markAsReadMutation.isPending}
              className={
                notification.type === 'warning' 
                  ? 'text-warning-foreground/60 hover:text-warning-foreground' 
                  : notification.type === 'success'
                  ? 'text-success-foreground/60 hover:text-success-foreground'
                  : 'text-primary-foreground/60 hover:text-primary-foreground'
              }
              data-testid={`button-dismiss-${notification.id}`}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </Alert>
      ))}
    </div>
  );
}
