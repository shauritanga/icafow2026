import { prisma } from "@/lib/prisma";
import { PageTitle, DataTable, Td, StatusBadge } from "@/components/admin/ui";
import { RegistrationRowActions } from "@/components/admin/registration-actions";
import { Stagger } from "@/components/motion/reveal";
import { formatCurrencyExact, formatDate } from "@/lib/utils";
import { AttendeeRegisterButton } from "@/components/forms/register-triggers";

export const dynamic = "force-dynamic";

export default async function AttendeesPage() {
  const attendees = await prisma.registration.findMany({
    where: { type: "ATTENDEE" },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return (
    <Stagger className="h-full">
      <PageTitle 
        title="Attendees" 
        subtitle="General delegates and researchers." 
        action={<AttendeeRegisterButton>Add Attendee</AttendeeRegisterButton>}
      />
      <DataTable headers={["Ref", "Name", "Organization", "Country", "Pass", "Amount", "Status", "Date", "Actions"]} rows={attendees.length} empty="No attendees registered yet.">
        {attendees.map((a) => (
          <tr key={a.id}>
            <Td className="font-mono text-xs">{a.reference}</Td>
            <Td className="font-medium">{a.fullName}</Td>
            <Td className="text-muted-foreground max-w-[200px] truncate" title={a.organization || ""}>{a.organization ?? "—"}</Td>
            <Td>{a.country ?? "—"}</Td>
            <Td><span className="rounded-md bg-secondary/10 px-2 py-1 text-xs font-medium text-secondary">{a.packageLabel}</span></Td>
            <Td>{a.amount > 0 ? formatCurrencyExact(a.amount, a.currency) : "Free"}</Td>
            <Td><StatusBadge status={a.status} /></Td>
            <Td className="text-muted-foreground">{formatDate(a.createdAt, { day: "numeric", month: "short" })}</Td>
            <Td>
              <RegistrationRowActions registration={a} />
            </Td>
          </tr>
        ))}
      </DataTable>
    </Stagger>
  );
}
