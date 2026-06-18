"use client";

import { Mic, Building2, Layers, Users, Store } from "lucide-react";
import { Stagger, StaggerItem } from "@/components/motion/reveal";
import { useSiteSettings } from "@/components/site-provider";

const icons = [Mic, Building2, Layers, Users, Store];

export function Stats() {
  const siteConfig = useSiteSettings();
  
  return (
    <section className="section-dark relative z-20 -mt-px overflow-hidden border-y border-white/10">
      <div className="pointer-events-none absolute inset-0 bg-mesh opacity-50" aria-hidden />
      <div className="pointer-events-none absolute inset-0 bg-grid" aria-hidden />
      <div className="glow-blob -left-20 top-0 size-64 bg-maroon" aria-hidden />
      <div className="glow-blob -right-20 bottom-0 size-64 bg-green" aria-hidden />

      <div className="container-edge relative py-12 sm:py-16">
        <Stagger className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-5">
          {siteConfig.stats.map((s, i) => {
            const Ico = icons[i] ?? Layers;
            return (
              <StaggerItem key={s.label}>
                <div className="group flex flex-col items-center gap-2.5 text-center">
                  <div className="flex size-12 items-center justify-center rounded-2xl bg-brand-gradient text-white shadow-lg ring-1 ring-white/15 transition-transform group-hover:-translate-y-0.5">
                    <Ico className="size-5" />
                  </div>
                  <span className="bg-gradient-to-b from-white to-green-light bg-clip-text font-display text-4xl font-extrabold tracking-tight text-transparent sm:text-5xl">
                    {s.value}
                  </span>
                  <span className="text-xs font-semibold uppercase tracking-wider text-white/60">
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
