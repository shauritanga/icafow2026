"use client";

import * as React from "react";
import { Plus, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

/** Accessible accordion built on native <details>/<summary>. */
function Accordion({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("divide-y divide-border", className)} {...props} />;
}

function AccordionItem({
  question,
  children,
  defaultOpen = false,
}: {
  question: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  return (
    <details
      className="group py-1 [&_summary::-webkit-details-marker]:hidden"
      open={defaultOpen}
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-left font-semibold transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md">
        <span>{question}</span>
        <span className="relative flex size-6 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground">
          <Plus className="size-4 group-open:hidden" />
          <Minus className="hidden size-4 group-open:block" />
        </span>
      </summary>
      <div className="pb-4 pr-10 text-sm leading-relaxed text-muted-foreground">
        {children}
      </div>
    </details>
  );
}

export { Accordion, AccordionItem };
