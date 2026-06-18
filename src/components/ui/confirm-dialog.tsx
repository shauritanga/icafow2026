"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  onConfirm: () => void;
  confirmText?: string;
  cancelText?: string;
  variant?: "default" | "destructive";
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  onConfirm,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "default",
}: ConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0 overflow-hidden sm:rounded-xl">
        <div className="p-6">
          <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left sm:items-start">
            <div className={`rounded-full p-3 ${variant === "destructive" ? "bg-red-500/10 text-red-600" : "bg-primary/10 text-primary"}`}>
              <AlertCircle className="size-6" />
            </div>
            <div className="space-y-1">
              <DialogHeader>
                <DialogTitle>{title}</DialogTitle>
                <DialogDescription className="mt-2 text-sm text-muted-foreground">
                  {description}
                </DialogDescription>
              </DialogHeader>
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-3 px-6 py-4 bg-muted/30 border-t border-border">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            {cancelText}
          </Button>
          <Button 
            variant={variant === "destructive" ? "destructive" : "default"}
            onClick={() => {
              onConfirm();
              onOpenChange(false);
            }}
          >
            {confirmText}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
