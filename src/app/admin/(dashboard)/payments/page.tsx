import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PageTitle, DataTable, Td, StatusBadge, StatCard } from "@/components/admin/ui";
import { ReverifyButton } from "@/components/admin/reverify-button";
import { formatCurrencyExact, formatDate } from "@/lib/utils";
import { CreditCard, DollarSign, Clock, AlertTriangle } from "lucide-react";
import { Stagger } from "@/components/motion/reveal";

export const dynamic = "force-dynamic";

const ATTENTION_MINUTES = Number(process.env.PAYMENT_ABANDON_MINUTES || "60");

export default async function PaymentsPage() {
  const attentionBefore = new Date(Date.now() - ATTENTION_MINUTES * 60_000);

  const [payments, paidAgg, pending, needsAttention] = await Promise.all([
    prisma.payment.findMany({ orderBy: { createdAt: "desc" }, take: 200, include: { registration: true } }),
    prisma.payment.aggregate({ _sum: { amount: true }, _count: true, where: { status: "PAID" } }),
    prisma.payment.count({ where: { status: { in: ["PENDING", "PROCESSING"] } } }),
    prisma.payment.count({
      where: {
        OR: [
          // amount/currency mismatch flagged while still processing
          { status: "PROCESSING", failureReason: { not: null } },
          // open longer than the abandon window
          { status: { in: ["PENDING", "PROCESSING"] }, createdAt: { lt: attentionBefore } },
        ],
      },
    }),
  ]);

  const isStuck = (p: (typeof payments)[number]) =>
    (p.status === "PROCESSING" && !!p.failureReason) ||
    ((p.status === "PENDING" || p.status === "PROCESSING") && p.createdAt < attentionBefore);

  return (
    <Stagger className="h-full">
      <PageTitle title="Payments" subtitle="Monitor Selcom transactions and reconcile registrations." />
      <div className="mb-6 grid gap-4 sm:grid-cols-4">
        <StatCard label="Collected" value={formatCurrencyExact(paidAgg._sum.amount ?? 0)} icon={DollarSign} />
        <StatCard label="Successful" value={paidAgg._count} icon={CreditCard} />
        <StatCard label="Pending / Processing" value={pending} icon={Clock} />
        <StatCard label="Needs attention" value={needsAttention} hint="Stuck or amount mismatch" icon={AlertTriangle} />
      </div>
      <DataTable headers={["Ref", "Registrant", "Method", "Amount", "Status", "Transaction", "Date", ""]} rows={payments.length}>
        {payments.map((p) => {
          const stuck = isStuck(p);
          return (
            <tr key={p.id} className={stuck ? "bg-gold/5" : undefined}>
              <Td className="font-mono text-xs">
                <span className="inline-flex items-center gap-1">
                  {stuck && <AlertTriangle className="size-3 text-gold" aria-label="Needs attention" />}
                  {p.reference}
                </span>
              </Td>
              <Td className="font-medium">{p.registration.fullName}</Td>
              <Td>{p.method}</Td>
              <Td>{formatCurrencyExact(p.amount, p.currency)}</Td>
              <Td><StatusBadge status={p.status} /></Td>
              <Td className="text-muted-foreground">{p.selcomTransId ?? "—"}</Td>
              <Td className="text-muted-foreground">{formatDate(p.createdAt, { day: "numeric", month: "short" })}</Td>
              <Td>
                <div className="flex items-center gap-1">
                  <ReverifyButton reference={p.reference} />
                  <Link href={`/invoice/${p.reference}`} className="text-primary underline-offset-4 hover:underline" target="_blank">
                    Invoice
                  </Link>
                </div>
              </Td>
            </tr>
          );
        })}
      </DataTable>
    </Stagger>
  );
}
