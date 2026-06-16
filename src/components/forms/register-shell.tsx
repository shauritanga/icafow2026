import * as React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function RegisterShell({
  eyebrow,
  title,
  description,
  summary,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  summary?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="container-edge py-10 lg:py-14">
      <div className="mx-auto mb-8 max-w-2xl text-center lg:mx-0 lg:text-left">
        <Badge variant="maroonSoft" className="mb-3 uppercase tracking-wider">
          {eyebrow}
        </Badge>
        <h1 className="text-3xl font-bold sm:text-4xl">{title}</h1>
        <p className="mt-3 text-muted-foreground">{description}</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <Card className="p-6 sm:p-8">{children}</Card>
        {summary && (
          <aside className="lg:sticky lg:top-28 lg:self-start">{summary}</aside>
        )}
      </div>
    </div>
  );
}
