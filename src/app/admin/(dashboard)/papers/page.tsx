import { prisma } from "@/lib/prisma";
import { PageTitle } from "@/components/admin/ui";
import { Stagger } from "@/components/motion/reveal";
import { PapersClient } from "@/components/admin/papers-client";

export const dynamic = "force-dynamic";

export default async function PapersPage() {
  const papers = await prisma.paper.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    include: { registration: true },
  });

  return (
    <Stagger className="h-full flex flex-col">
      <PageTitle title="Paper Submissions" subtitle="Research papers submitted with the Researcher Pass." />
      <div className="flex-1 min-h-0">
        <PapersClient papers={papers} />
      </div>
    </Stagger>
  );
}
