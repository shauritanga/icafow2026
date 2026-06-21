import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PageTitle, DataTable, Td, StatusBadge, StatCard } from "@/components/admin/ui";
import { formatCurrencyExact, formatDate } from "@/lib/utils";
import { CreditCard, DollarSign, Clock } from "lucide-react";
import { Stagger } from "@/components/motion/reveal";

export const dynamic = "force-dynamic";

export default async function PaymentsPage() {
  const [payments, paidAgg, pending] = await Promise.all([
    prisma.payment.findMany({ orderBy: { createdAt: "desc" }, take: 200, include: { registration: true } }),
    prisma.payment.aggregate({ _sum: { amount: true }, _count: true, where: { status: "PAID" } }),
    prisma.payment.count({ where: { status: { in: ["PENDING", "PROCESSING"] } } }),
  ]);

  return (
    <Stagger className="h-full">
      <PageTitle title="Payments" subtitle="Monitor Selcom transactions and reconcile registrations." />
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard label="Collected" value={formatCurrencyExact(paidAgg._sum.amount ?? 0)} icon={DollarSign} />
        <StatCard label="Successful" value={paidAgg._count} icon={CreditCard} />
        <StatCard label="Pending / Processing" value={pending} icon={Clock} />
      </div>
      <DataTable headers={["Ref", "Registrant", "Method", "Amount", "Status", "Transaction", "Date", ""]} rows={payments.length}>
        {payments.map((p) => (
          <tr key={p.id}>
            <Td className="font-mono text-xs">{p.reference}</Td>
            <Td className="font-medium">{p.registration.fullName}</Td>
            <Td>{p.method}</Td>
            <Td>{formatCurrencyExact(p.amount, p.currency)}</Td>
            <Td><StatusBadge status={p.status} /></Td>
            <Td className="text-muted-foreground">{p.selcomTransId ?? "—"}</Td>
            <Td className="text-muted-foreground">{formatDate(p.createdAt, { day: "numeric", month: "short" })}</Td>
            <Td>
              <Link href={`/invoice/${p.reference}`} className="text-primary underline-offset-4 hover:underline" target="_blank">
                Invoice
              </Link>
            </Td>
          </tr>
        ))}
      </DataTable>
    </Stagger>
  );
}
