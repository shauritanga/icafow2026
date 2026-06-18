import { prisma } from "@/lib/prisma";
import { PageTitle, DataTable, Td, StatusBadge } from "@/components/admin/ui";
import { RegistrationRowActions } from "@/components/admin/registration-actions";
import { Stagger } from "@/components/motion/reveal";
import { formatCurrency, formatDate } from "@/lib/utils";
import { SponsorTierButton } from "@/components/forms/register-triggers";

export const dynamic = "force-dynamic";

export default async function SponsorsPage() {
  const sponsors = await prisma.registration.findMany({
    where: { type: "SPONSOR" },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return (
    <Stagger className="h-full">
      <PageTitle 
        title="Sponsors" 
        subtitle="Organizations sponsoring the conference." 
        action={<SponsorTierButton>Add Sponsor</SponsorTierButton>}
      />
      <DataTable headers={["Ref", "Org/Contact", "Tier", "Amount", "Status", "Date", "Actions"]} rows={sponsors.length} empty="No sponsors yet.">
        {sponsors.map((s) => (
          <tr key={s.id}>
            <Td className="font-mono text-xs">{s.reference}</Td>
            <Td>
              <div className="font-medium text-primary">{s.organization}</div>
              <div className="text-xs text-muted-foreground">{s.fullName}</div>
            </Td>
            <Td><span className="rounded-md bg-brand-gradient px-2 py-1 text-xs font-medium text-white">{s.packageLabel}</span></Td>
            <Td>{s.amount > 0 ? formatCurrency(s.amount, s.currency) : "Custom"}</Td>
            <Td><StatusBadge status={s.status} /></Td>
            <Td className="text-muted-foreground">{formatDate(s.createdAt, { day: "numeric", month: "short" })}</Td>
            <Td>
              <RegistrationRowActions registration={s} />
            </Td>
          </tr>
        ))}
      </DataTable>
    </Stagger>
  );
}
