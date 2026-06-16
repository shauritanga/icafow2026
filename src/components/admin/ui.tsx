import * as React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function PageTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-6">
      <h1 className="font-display text-2xl font-bold">{title}</h1>
      {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
    </div>
  );
}

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
}: {
  label: string;
  value: React.ReactNode;
  hint?: string;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
          <p className="mt-1 font-display text-3xl font-bold text-primary">{value}</p>
          {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
        </div>
        {Icon && (
          <span className="flex size-10 items-center justify-center rounded-lg bg-accent text-secondary">
            <Icon className="size-5" />
          </span>
        )}
      </div>
    </Card>
  );
}

const statusVariants: Record<string, "green" | "gold" | "default" | "outline" | "soft"> = {
  PAID: "green",
  CONFIRMED: "green",
  PENDING: "gold",
  PROCESSING: "gold",
  FAILED: "default",
  CANCELLED: "default",
  REFUNDED: "outline",
  WAITLISTED: "soft",
};

export function StatusBadge({ status }: { status: string }) {
  return <Badge variant={statusVariants[status] ?? "outline"}>{status}</Badge>;
}

export function DataTable({
  headers,
  children,
  empty = "No records yet.",
  rows,
}: {
  headers: string[];
  children: React.ReactNode;
  empty?: string;
  rows: number;
}) {
  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
              {headers.map((h) => (
                <th key={h} className="whitespace-nowrap px-4 py-3 font-semibold">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">{children}</tbody>
        </table>
      </div>
      {rows === 0 && <p className="p-8 text-center text-sm text-muted-foreground">{empty}</p>}
    </Card>
  );
}

export function Td({ className, ...props }: React.ComponentProps<"td">) {
  return <td className={cn("whitespace-nowrap px-4 py-3", className)} {...props} />;
}
