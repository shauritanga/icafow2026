import { prisma } from "@/lib/prisma";
import { PageTitle, DataTable, Td, StatCard } from "@/components/admin/ui";
import { formatDate } from "@/lib/utils";
import { UserCheck, Users, QrCode } from "lucide-react";
import { Stagger } from "@/components/motion/reveal";

export const dynamic = "force-dynamic";

export default async function CheckinPage() {
  const [expectedAgg, enteredAgg, recent] = await Promise.all([
    // Expected headcount = all bundled seats across confirmed registrations.
    prisma.registration.aggregate({ _sum: { seats: true }, where: { status: "CONFIRMED" } }),
    // Actual people in = sum of per-registration check-in counts.
    prisma.registration.aggregate({ _sum: { checkedInCount: true } }),
    prisma.registration.findMany({
      where: { checkedInCount: { gt: 0 } },
      orderBy: { checkedInAt: "desc" },
      take: 200,
    }),
  ]);

  const expected = expectedAgg._sum.seats ?? 0;
  const entered = enteredAgg._sum.checkedInCount ?? 0;

  return (
    <Stagger className="h-full">
      <PageTitle
        title="Check-in"
        subtitle="Entrance headcount — people checked in by scanning their receipt QR. Sponsor/exhibitor bundles count every included pass."
      />
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard label="Expected (people)" value={expected} icon={Users} hint="All bundled passes on confirmed registrations" />
        <StatCard label="Entered (people)" value={entered} icon={UserCheck} />
        <StatCard label="Remaining" value={Math.max(expected - entered, 0)} icon={QrCode} />
      </div>
      <DataTable headers={["Ref", "Name", "Type", "Entered", "First in", "By"]} rows={recent.length} empty="No one has checked in yet.">
        {recent.map((r) => (
          <tr key={r.id}>
            <Td className="font-mono text-xs">{r.reference}</Td>
            <Td className="font-medium">{r.fullName}</Td>
            <Td>{r.packageLabel ?? r.type}</Td>
            <Td className="font-medium">
              {r.checkedInCount}
              <span className="text-muted-foreground"> / {r.seats}</span>
            </Td>
            <Td className="text-muted-foreground">
              {r.checkedInAt ? formatDate(r.checkedInAt, { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "—"}
            </Td>
            <Td className="text-muted-foreground">{r.checkedInBy ?? "—"}</Td>
          </tr>
        ))}
      </DataTable>
    </Stagger>
  );
}
