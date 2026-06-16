import { Users, DollarSign, FileText, Megaphone } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { PageTitle, StatCard, DataTable, Td, StatusBadge } from "@/components/admin/ui";
import { formatCurrency, formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminOverview() {
  const [
    totalRegs,
    confirmedRegs,
    paidAgg,
    paymentsCount,
    papers,
    sponsors,
    exhibitors,
    byType,
    recent,
  ] = await Promise.all([
    prisma.registration.count(),
    prisma.registration.count({ where: { status: "CONFIRMED" } }),
    prisma.payment.aggregate({ _sum: { amount: true }, where: { status: "PAID" } }),
    prisma.payment.count({ where: { status: "PAID" } }),
    prisma.paper.count(),
    prisma.registration.count({ where: { type: "SPONSOR" } }),
    prisma.registration.count({ where: { type: "EXHIBITOR" } }),
    prisma.registration.groupBy({ by: ["type"], _count: { _all: true } }),
    prisma.registration.findMany({ orderBy: { createdAt: "desc" }, take: 8 }),
  ]);

  const revenue = paidAgg._sum.amount ?? 0;

  return (
    <>
      <PageTitle title="Overview" subtitle="Live snapshot of ICAFoW 2026 registrations and revenue." />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Registrations" value={totalRegs} icon={Users} hint={`${confirmedRegs} confirmed`} />
        <StatCard label="Revenue (paid)" value={formatCurrency(revenue)} icon={DollarSign} hint={`${paymentsCount} successful payments`} />
        <StatCard label="Papers Submitted" value={papers} icon={FileText} />
        <StatCard label="Sponsors / Exhibitors" value={`${sponsors} / ${exhibitors}`} icon={Megaphone} />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        <div>
          <h2 className="mb-3 font-semibold">Registrations by type</h2>
          <DataTable headers={["Type", "Count"]} rows={byType.length}>
            {byType.map((t) => (
              <tr key={t.type}>
                <Td className="font-medium">{t.type}</Td>
                <Td>{t._count._all}</Td>
              </tr>
            ))}
          </DataTable>
        </div>

        <div>
          <h2 className="mb-3 font-semibold">Recent registrations</h2>
          <DataTable headers={["Ref", "Name", "Type", "Status", "Date"]} rows={recent.length}>
            {recent.map((r) => (
              <tr key={r.id}>
                <Td className="font-mono text-xs">{r.reference}</Td>
                <Td className="font-medium">{r.fullName}</Td>
                <Td>{r.type}</Td>
                <Td><StatusBadge status={r.status} /></Td>
                <Td className="text-muted-foreground">{formatDate(r.createdAt, { day: "numeric", month: "short" })}</Td>
              </tr>
            ))}
          </DataTable>
        </div>
      </div>
    </>
  );
}
