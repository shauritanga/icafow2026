"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

/** Dialog wrapper used by every registration form modal. */
export function FormDialog({
  open,
  onOpenChange,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="section-dark p-0">{open && children}</DialogContent>
    </Dialog>
  );
}

/** The vertical flex container for a modal form (header · scrollable body · footer). */
export function ModalForm({
  onSubmit,
  children,
}: {
  onSubmit: React.FormEventHandler<HTMLFormElement>;
  children: React.ReactNode;
}) {
  return (
    <form onSubmit={onSubmit} className="flex max-h-[92dvh] flex-col" noValidate>
      {children}
    </form>
  );
}

import { usePathname } from "next/navigation";

/** Brand-gradient header shared by all registration modals. */
export function ModalHeader({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  return (
    <div className={isAdmin ? "border-b border-border bg-muted/30 px-6 py-5 pr-14" : "bg-brand-gradient px-6 py-5 pr-14 text-white"}>
      <DialogHeader>
        {eyebrow && (
          <p className={`text-xs font-semibold uppercase tracking-wider ${isAdmin ? "text-muted-foreground" : "text-white/70"}`}>
            {eyebrow}
          </p>
        )}
        <DialogTitle className={isAdmin ? "text-foreground" : "text-white"}>{title}</DialogTitle>
        {subtitle && (
          <DialogDescription className={isAdmin ? "text-muted-foreground" : "text-white/80"}>{subtitle}</DialogDescription>
        )}
      </DialogHeader>
    </div>
  );
}

/** Scrollable form body. */
export function ModalBody({ children }: { children: React.ReactNode }) {
  return <div className="flex-1 space-y-6 overflow-y-auto px-6 py-6">{children}</div>;
}

/** Compact read-only summary of an already-chosen package (tier/booth/pass). */
export function SelectedSummary({
  label,
  name,
  price,
}: {
  label: string;
  name: string;
  price?: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border bg-accent/30 p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <div className="mt-1 flex items-center justify-between gap-3">
        <span className="font-semibold">{name}</span>
        {price != null && (
          <span className="font-display text-lg font-bold text-primary">{price}</span>
        )}
      </div>
    </div>
  );
}

/** Sticky footer holding an optional note + the submit button. */
export function ModalFooter({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 border-t border-border bg-muted/40 px-6 py-4">
      {children}
    </div>
  );
}
