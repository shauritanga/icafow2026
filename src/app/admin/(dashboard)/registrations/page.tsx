import { prisma } from "@/lib/prisma";
import { PageTitle, DataTable, Td, StatusBadge } from "@/components/admin/ui";
import { formatCurrency, formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function RegistrationsPage() {
  const registrations = await prisma.registration.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return (
    <>
      <PageTitle title="Registrations" subtitle={`${registrations.length} most recent registrations across all audiences.`} />
      <DataTable headers={["Ref", "Name", "Email", "Type", "Package", "Amount", "Status", "Date"]} rows={registrations.length}>
        {registrations.map((r) => (
          <tr key={r.id}>
            <Td className="font-mono text-xs">{r.reference}</Td>
            <Td className="font-medium">{r.fullName}</Td>
            <Td className="text-muted-foreground">{r.email}</Td>
            <Td>{r.type}</Td>
            <Td className="text-muted-foreground">{r.packageLabel ?? "—"}</Td>
            <Td>{r.amount > 0 ? formatCurrency(r.amount, r.currency) : "—"}</Td>
            <Td><StatusBadge status={r.status} /></Td>
            <Td className="text-muted-foreground">{formatDate(r.createdAt, { day: "numeric", month: "short", year: "numeric" })}</Td>
          </tr>
        ))}
      </DataTable>
    </>
  );
}
