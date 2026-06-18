import { prisma } from "@/lib/prisma";
import { OverviewClient } from "./overview-client";
import { Stagger } from "@/components/motion/reveal";

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
    <Stagger className="h-full">
      <OverviewClient
        totalRegs={totalRegs}
        confirmedRegs={confirmedRegs}
        revenue={revenue}
        paymentsCount={paymentsCount}
        papers={papers}
        sponsors={sponsors}
        exhibitors={exhibitors}
        byType={byType}
        recent={recent}
      />
    </Stagger>
  );
}
