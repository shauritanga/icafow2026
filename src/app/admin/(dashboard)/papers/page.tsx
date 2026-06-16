import { prisma } from "@/lib/prisma";
import { PageTitle, DataTable, Td, StatusBadge } from "@/components/admin/ui";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function PapersPage() {
  const papers = await prisma.paper.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    include: { registration: true },
  });

  return (
    <>
      <PageTitle title="Paper Submissions" subtitle="Research papers submitted with the Researcher Pass." />
      <DataTable headers={["Title", "Author", "Track", "Status", "Submitted"]} rows={papers.length} empty="No papers submitted yet.">
        {papers.map((p) => (
          <tr key={p.id}>
            <Td className="max-w-xs whitespace-normal font-medium">{p.title}</Td>
            <Td>{p.registration.fullName}</Td>
            <Td className="text-muted-foreground">{p.track ?? "—"}</Td>
            <Td><StatusBadge status={p.status.toUpperCase()} /></Td>
            <Td className="text-muted-foreground">{formatDate(p.createdAt, { day: "numeric", month: "short" })}</Td>
          </tr>
        ))}
      </DataTable>
    </>
  );
}
