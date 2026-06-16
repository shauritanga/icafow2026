import { prisma } from "@/lib/prisma";
import { PageTitle, DataTable, Td, StatusBadge } from "@/components/admin/ui";
import { formatCurrency, formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function SponsorsPage() {
  const sponsors = await prisma.registration.findMany({
    where: { type: "SPONSOR" },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return (
    <>
      <PageTitle title="Sponsors" subtitle="Organizations that have applied to sponsor ICAFoW 2026." />
      <DataTable headers={["Ref", "Organization", "Tier", "Contact", "Email", "Amount", "Status", "Date"]} rows={sponsors.length} empty="No sponsor applications yet.">
        {sponsors.map((s) => (
          <tr key={s.id}>
            <Td className="font-mono text-xs">{s.reference}</Td>
            <Td className="font-medium">{s.organization ?? "—"}</Td>
            <Td>{s.packageLabel ?? "—"}</Td>
            <Td>{s.fullName}</Td>
            <Td className="text-muted-foreground">{s.email}</Td>
            <Td>{s.amount > 0 ? formatCurrency(s.amount, s.currency) : "By negotiation"}</Td>
            <Td><StatusBadge status={s.status} /></Td>
            <Td className="text-muted-foreground">{formatDate(s.createdAt, { day: "numeric", month: "short" })}</Td>
          </tr>
        ))}
      </DataTable>
    </>
  );
}
