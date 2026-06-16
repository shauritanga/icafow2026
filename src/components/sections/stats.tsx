"use client";

import { Mic, Building2, Layers, Users, Store } from "lucide-react";
import { Stagger, StaggerItem } from "@/components/motion/reveal";
import { siteConfig } from "@/lib/content/site";

const icons = [Mic, Building2, Layers, Users, Store];

export function Stats() {
  return (
    <section className="relative z-20 -mt-px border-y border-border bg-card">
      <div className="container-edge py-10">
        <Stagger className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-5">
          {siteConfig.stats.map((s, i) => {
            const Ico = icons[i];
            return (
              <StaggerItem key={s.label}>
                <div className="flex flex-col items-center gap-2 text-center">
                  <div className="flex size-11 items-center justify-center rounded-full bg-accent text-secondary">
                    <Ico className="size-5" />
                  </div>
                  <span className="font-display text-3xl font-bold text-primary sm:text-4xl">
                    {s.value}
                  </span>
                  <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    {s.label}
                  </span>
                </div>
              </StaggerItem>
            );
          })}
        </Stagger>
      </div>
    </section>
  );
}
