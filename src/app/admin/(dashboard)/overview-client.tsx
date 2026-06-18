"use client";

import * as React from "react";
import Link from "next/link";
import { Users, DollarSign, FileText, Megaphone, ArrowRight, UserCheck } from "lucide-react";
import { PageTitle, DataTable, Td, StatusBadge } from "@/components/admin/ui";
import { Card } from "@/components/ui/card";
import { Stagger, StaggerItem } from "@/components/motion/reveal";
import { formatCurrency, formatDate, formatEnum } from "@/lib/utils";

export interface OverviewClientProps {
  totalRegs: number;
  confirmedRegs: number;
  revenue: number;
  paymentsCount: number;
  papers: number;
  sponsors: number;
  exhibitors: number;
  byType: { type: string; _count: { _all: number } }[];
  recent: {
    id: string;
    reference: string;
    fullName: string;
    type: string;
    status: string;
    createdAt: Date;
  }[];
}

export function OverviewClient({
  totalRegs,
  confirmedRegs,
  revenue,
  paymentsCount,
  papers,
  sponsors,
  exhibitors,
  byType,
  recent,
}: OverviewClientProps) {
  const confirmedPercent = totalRegs > 0 ? Math.round((confirmedRegs / totalRegs) * 100) : 0;

  return (
    <>
      <PageTitle title="Overview" subtitle="Live snapshot of ICAFoW 2026 registrations and revenue." />

      <Stagger className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {/* Total Registrations */}
        <StaggerItem>
          <Card className="flex h-full flex-col p-5 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Registrations</p>
                <p className="mt-1 font-display text-4xl font-bold text-primary">{totalRegs}</p>
              </div>
              <span className="flex size-10 items-center justify-center rounded-lg bg-accent text-secondary">
                <Users className="size-5" />
              </span>
            </div>
            <div className="mt-auto pt-4">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                <span className="flex items-center gap-1"><UserCheck className="size-3" /> {confirmedRegs} confirmed</span>
                <span>{confirmedPercent}%</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div className="h-full bg-secondary transition-all" style={{ width: `${confirmedPercent}%` }} />
              </div>
            </div>
          </Card>
        </StaggerItem>

        {/* Revenue */}
        <StaggerItem>
          <Card className="flex h-full flex-col bg-brand-gradient p-5 text-white shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-white/80">Revenue (Paid)</p>
                <p className="mt-1 font-display text-4xl font-bold tracking-tight">{formatCurrency(revenue)}</p>
              </div>
              <span className="flex size-10 items-center justify-center rounded-lg bg-white/20 text-white backdrop-blur-sm">
                <DollarSign className="size-5" />
              </span>
            </div>
            <div className="mt-auto pt-4">
              <p className="text-xs text-white/80">{paymentsCount} successful payments</p>
            </div>
          </Card>
        </StaggerItem>

        {/* Papers */}
        <StaggerItem>
          <Card className="flex h-full flex-col p-5 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Papers Submitted</p>
                <p className="mt-1 font-display text-4xl font-bold text-primary">{papers}</p>
              </div>
              <span className="flex size-10 items-center justify-center rounded-lg bg-accent text-secondary">
                <FileText className="size-5" />
              </span>
            </div>
            <div className="mt-auto pt-4">
              <Link href="/admin/papers" className="inline-flex items-center text-xs font-semibold text-secondary hover:underline">
                Review submissions <ArrowRight className="ml-1 size-3" />
              </Link>
            </div>
          </Card>
        </StaggerItem>

        {/* Sponsors / Exhibitors */}
        <StaggerItem>
          <Card className="flex h-full flex-col p-5 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Sponsors & Exhibitors</p>
                <p className="mt-1 font-display text-4xl font-bold text-primary">{sponsors} <span className="text-2xl text-muted-foreground">/</span> {exhibitors}</p>
              </div>
              <span className="flex size-10 items-center justify-center rounded-lg bg-accent text-secondary">
                <Megaphone className="size-5" />
              </span>
            </div>
            <div className="mt-auto pt-4">
              <Link href="/admin/sponsors" className="inline-flex items-center text-xs font-semibold text-secondary hover:underline">
                Manage partners <ArrowRight className="ml-1 size-3" />
              </Link>
            </div>
          </Card>
        </StaggerItem>
      </Stagger>

      <Stagger className="mt-8 grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        <StaggerItem>
          <Card className="h-full p-5">
            <h2 className="mb-4 font-semibold text-primary">Registrations by type</h2>
            <div className="space-y-4">
              {byType.sort((a, b) => b._count._all - a._count._all).map((t) => {
                const percent = totalRegs > 0 ? Math.round((t._count._all / totalRegs) * 100) : 0;
                return (
                  <div key={t.type}>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="font-medium">{formatEnum(t.type)}</span>
                      <span className="text-muted-foreground">{t._count._all} ({percent}%)</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                      <div className="h-full bg-gradient-to-r from-maroon to-green transition-all" style={{ width: `${percent}%` }} />
                    </div>
                  </div>
                );
              })}
              {byType.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No data available.</p>}
            </div>
          </Card>
        </StaggerItem>

        <StaggerItem>
          <Card className="h-full overflow-hidden flex flex-col">
            <div className="border-b border-border p-5 flex justify-between items-center bg-muted/20">
              <h2 className="font-semibold text-primary">Recent Activity</h2>
              <Link href="/admin/attendees" className="text-xs font-semibold text-secondary hover:underline">
                View all
              </Link>
            </div>
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
                    <th className="px-4 py-3 font-semibold">Ref</th>
                    <th className="px-4 py-3 font-semibold">Name</th>
                    <th className="px-4 py-3 font-semibold">Type</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 font-semibold">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {recent.map((r) => (
                    <tr key={r.id} className="hover:bg-muted/30 transition-colors">
                      <Td className="font-mono text-xs text-muted-foreground">{r.reference}</Td>
                      <Td className="font-medium text-primary">{r.fullName}</Td>
                      <Td>{formatEnum(r.type)}</Td>
                      <Td><StatusBadge status={r.status} /></Td>
                      <Td className="text-muted-foreground">{formatDate(r.createdAt, { day: "numeric", month: "short" })}</Td>
                    </tr>
                  ))}
                  {recent.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-muted-foreground">No recent registrations.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </StaggerItem>
      </Stagger>
    </>
  );
}
