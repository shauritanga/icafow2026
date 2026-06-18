import { prisma } from "@/lib/prisma";
import { PageTitle, DataTable, Td, StatusBadge } from "@/components/admin/ui";
import { formatCurrency, formatDate } from "@/lib/utils";
import { verifyRegistration } from "../attendees/actions";
import { ApproveButton } from "@/components/admin/approve-button";
import { Stagger } from "@/components/motion/reveal";

export const dynamic = "force-dynamic";

export default async function PitchPage() {
  const pitchEntries = await prisma.registration.findMany({
    where: { type: "PITCH" },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return (
    <Stagger className="h-full">
      <PageTitle title="Pitch Competition" subtitle="Startups applying for the pitch competition." />
      <DataTable headers={["Ref", "Startup", "Founder", "Email", "Country", "Status", "Date", "Actions"]} rows={pitchEntries.length} empty="No pitch applications yet.">
        {pitchEntries.map((p) => (
          <tr key={p.id}>
            <Td className="font-mono text-xs">{p.reference}</Td>
            <Td className="font-medium">{p.organization ?? "—"}</Td>
            <Td>{p.fullName}</Td>
            <Td className="text-muted-foreground">{p.email}</Td>
            <Td>{p.country ?? "—"}</Td>
            <Td><StatusBadge status={p.status} /></Td>
            <Td className="text-muted-foreground">{formatDate(p.createdAt, { day: "numeric", month: "short" })}</Td>
            <Td>
              {p.status === "PENDING" && (
                <ApproveButton id={p.id} onApprove={verifyRegistration} />
              )}
            </Td>
          </tr>
        ))}
      </DataTable>
    </Stagger>
  );
}
