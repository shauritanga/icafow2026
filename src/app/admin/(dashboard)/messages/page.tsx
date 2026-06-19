import { prisma } from "@/lib/prisma";
import { PageTitle } from "@/components/admin/ui";
import { Stagger } from "@/components/motion/reveal";
import { MessagesClient } from "@/components/admin/messages-client";

export const dynamic = "force-dynamic";

export default async function MessagesPage() {
  const messages = await prisma.contactMessage.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return (
    <Stagger className="h-full flex flex-col">
      <div className="shrink-0 mb-4">
        <PageTitle 
          title="Contact Messages" 
          subtitle="Messages received from the website contact form." 
        />
      </div>
      <div className="flex-1 overflow-hidden">
        <MessagesClient messages={messages} />
      </div>
    </Stagger>
  );
}
