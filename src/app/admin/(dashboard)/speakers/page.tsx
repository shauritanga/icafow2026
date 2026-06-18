import { prisma } from "@/lib/prisma";
import { PageTitle, DataTable, Td, StatusBadge } from "@/components/admin/ui";
import { formatCurrency, formatDate } from "@/lib/utils";
import { verifyRegistration } from "../attendees/actions";
import { ApproveButton } from "@/components/admin/approve-button";
import { Stagger } from "@/components/motion/reveal";

export const dynamic = "force-dynamic";

export default async function SpeakersPage() {
  const speakers = await prisma.registration.findMany({
    where: { type: "SPEAKER" },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return (
    <Stagger className="h-full">
      <PageTitle title="Speakers" subtitle="Individuals who have applied to speak at ICAFoW 2026." />
      <DataTable headers={["Ref", "Name", "Role", "Organization", "Country", "Amount", "Status", "Date", "Actions"]} rows={speakers.length} empty="No speaker applications yet.">
        {speakers.map((s) => (
          <tr key={s.id}>
            <Td className="font-mono text-xs">{s.reference}</Td>
            <Td className="font-medium">{s.fullName}</Td>
            <Td className="text-muted-foreground max-w-[200px] truncate" title={s.jobTitle || ""}>{s.jobTitle ?? "—"}</Td>
            <Td className="text-muted-foreground max-w-[200px] truncate" title={s.organization || ""}>{s.organization ?? "—"}</Td>
            <Td>{s.country ?? "—"}</Td>
            <Td>{s.amount > 0 ? formatCurrency(s.amount, s.currency) : "Free"}</Td>
            <Td><StatusBadge status={s.status} /></Td>
            <Td className="text-muted-foreground">{formatDate(s.createdAt, { day: "numeric", month: "short" })}</Td>
            <Td>
              {s.status === "PENDING" && (
                <ApproveButton id={s.id} onApprove={verifyRegistration} />
              )}
            </Td>
          </tr>
        ))}
      </DataTable>
    </Stagger>
  );
}
