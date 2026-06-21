import { prisma } from "@/lib/prisma";
import { PageTitle, DataTable, Td, StatusBadge } from "@/components/admin/ui";
import { formatCurrencyExact, formatDate } from "@/lib/utils";
import { RegistrationRowActions } from "@/components/admin/registration-actions";
import { Stagger } from "@/components/motion/reveal";
import { BoothReserveButton } from "@/components/forms/register-triggers";

export const dynamic = "force-dynamic";

export default async function ExhibitorsPage() {
  const exhibitors = await prisma.registration.findMany({
    where: { type: "EXHIBITOR" },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return (
    <Stagger className="h-full">
      <PageTitle 
        title="Exhibitors" 
        subtitle="Organizations that have reserved exhibition booths." 
        action={<BoothReserveButton>Add Exhibitor</BoothReserveButton>}
      />
      <DataTable headers={["Ref", "Organization", "Booth", "Contact", "Email", "Amount", "Status", "Date", "Actions"]} rows={exhibitors.length} empty="No exhibitor registrations yet.">
        {exhibitors.map((e) => (
          <tr key={e.id}>
            <Td className="font-mono text-xs">{e.reference}</Td>
            <Td className="font-medium">{e.organization ?? "—"}</Td>
            <Td>{e.packageLabel ?? "—"}</Td>
            <Td>{e.fullName}</Td>
            <Td className="text-muted-foreground">{e.email}</Td>
            <Td>{formatCurrencyExact(e.amount, e.currency)}</Td>
            <Td><StatusBadge status={e.status} /></Td>
            <Td className="text-muted-foreground">{formatDate(e.createdAt, { day: "numeric", month: "short" })}</Td>
            <Td>
              <RegistrationRowActions registration={e} />
            </Td>
          </tr>
        ))}
      </DataTable>
    </Stagger>
  );
}
