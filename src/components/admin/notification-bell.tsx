"use client";

import { useEffect, useState } from "react";
import { Bell, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

type InAppNotification = {
  id: string;
  title: string;
  body: string;
  read: boolean;
  url?: string;
  createdAt: string;
};

export function NotificationBell() {
  const [notifications, setNotifications] = useState<InAppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/admin/notifications");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Poll every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllAsRead = async () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
    await fetch("/api/admin/notifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ markAllRead: true }),
    });
  };

  const clearAll = async () => {
    setNotifications(notifications.filter(n => !n.read));
    await fetch("/api/admin/notifications", {
      method: "DELETE",
    });
  };

  const markAsRead = async (id: string, url?: string) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
    await fetch("/api/admin/notifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notificationId: id }),
    });
    setOpen(false);
    
    if (url) {
      // Fallback for legacy notifications created before dynamic URLs
      const targetUrl = url === "/admin/registrations" ? "/admin" : url;
      window.location.href = targetUrl;
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative text-muted-foreground rounded-full hover:bg-muted">
          <Bell className="size-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 flex size-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex size-2.5 rounded-full bg-red-500"></span>
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0 overflow-hidden shadow-lg border-border">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30">
          <h3 className="font-semibold text-sm">Notifications</h3>
          {unreadCount > 0 ? (
            <Button variant="ghost" size="sm" onClick={markAllAsRead} className="h-auto p-0 text-xs text-primary hover:bg-transparent hover:underline">
              Mark all as read
            </Button>
          ) : notifications.length > 0 ? (
            <Button variant="ghost" size="sm" onClick={clearAll} className="h-auto p-0 text-xs text-muted-foreground hover:bg-transparent hover:underline">
              Clear all
            </Button>
          ) : null}
        </div>
        <div className="max-h-[400px] overflow-y-auto">
          {loading ? (
            <div className="flex justify-center p-6 text-muted-foreground">
              <Loader2 className="size-5 animate-spin" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-6 text-center text-sm text-muted-foreground">
              No notifications yet.
            </div>
          ) : (
            <div className="flex flex-col">
              {notifications.map((n) => (
                <button
                  key={n.id}
                  onClick={() => markAsRead(n.id, n.url)}
                  className={cn(
                    "flex flex-col items-start px-4 py-3 text-left transition-colors hover:bg-muted/50 border-b border-border/50 last:border-0",
                    !n.read ? "bg-primary/5" : ""
                  )}
                >
                  <div className="flex w-full items-start justify-between gap-2">
                    <p className={cn("text-sm font-medium leading-snug", !n.read && "text-foreground")}>
                      {n.title}
                    </p>
                    {!n.read && <span className="mt-1 size-2 shrink-0 rounded-full bg-primary" />}
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{n.body}</p>
                  <p className="mt-2 text-[10px] font-medium text-muted-foreground/60">{formatDate(n.createdAt)}</p>
                </button>
              ))}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
