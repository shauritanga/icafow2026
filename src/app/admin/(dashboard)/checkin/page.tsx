import { prisma } from "@/lib/prisma";
import { PageTitle, DataTable, Td, StatCard } from "@/components/admin/ui";
import { formatDate } from "@/lib/utils";
import { UserCheck, Users, QrCode } from "lucide-react";
import { Stagger } from "@/components/motion/reveal";

export const dynamic = "force-dynamic";

export default async function CheckinPage() {
  const [confirmed, checkedInCount, recent] = await Promise.all([
    prisma.registration.count({ where: { status: "CONFIRMED" } }),
    prisma.registration.count({ where: { checkedInAt: { not: null } } }),
    prisma.registration.findMany({
      where: { checkedInAt: { not: null } },
      orderBy: { checkedInAt: "desc" },
      take: 200,
    }),
  ]);

  return (
    <Stagger className="h-full">
      <PageTitle
        title="Check-in"
        subtitle="Entrance verification — attendees checked in by scanning their receipt QR."
      />
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard label="Confirmed" value={confirmed} icon={Users} />
        <StatCard label="Checked in" value={checkedInCount} icon={UserCheck} />
        <StatCard label="Not yet entered" value={Math.max(confirmed - checkedInCount, 0)} icon={QrCode} />
      </div>
      <DataTable headers={["Ref", "Name", "Type", "Checked in", "By"]} rows={recent.length} empty="No one has checked in yet.">
        {recent.map((r) => (
          <tr key={r.id}>
            <Td className="font-mono text-xs">{r.reference}</Td>
            <Td className="font-medium">{r.fullName}</Td>
            <Td>{r.packageLabel ?? r.type}</Td>
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
