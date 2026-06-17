"use client";

import * as React from "react";
import { Check, Star, ArrowRight } from "lucide-react";
import { Section, SectionHeading } from "@/components/layout/section";
import { Stagger, StaggerItem, Reveal } from "@/components/motion/reveal";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PassRegisterDialog } from "@/components/forms/pass-register-dialog";
import { cn, formatCurrency } from "@/lib/utils";
import { passes, type Pass } from "@/lib/content/passes";

export function Registration() {
  const [selectedPass, setSelectedPass] = React.useState<Pass | null>(null);
  const [open, setOpen] = React.useState(false);

  function openPass(pass: Pass) {
    setSelectedPass(pass);
    setOpen(true);
  }

  return (
    <Section id="registration" tone="dark">
      <SectionHeading
        onDark
        eyebrow="Registration"
        title={<>Choose the pass that fits <span className="text-gradient-light">your goals</span></>}
        description="All participants receive an official certificate of participation, conference materials, refreshments, lunches and access to networking sessions."
      />

      <Stagger className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {passes.map((p) => (
          <StaggerItem key={p.id}>
            <Card
              className={cn(
                "relative flex h-full flex-col p-6 transition-all hover:-translate-y-1",
                p.highlight
                  ? "ring-2 ring-gold shadow-[0_24px_70px_-20px] shadow-gold/50"
                  : "hover:ring-1 hover:ring-white/20"
              )}
            >
              {p.badge && (
                <Badge
                  variant={p.highlight ? "gold" : "outline"}
                  className="absolute -top-3 left-1/2 -translate-x-1/2 gap-1 shadow-sm"
                >
                  {p.highlight && <Star className="size-3" />} {p.badge}
                </Badge>
              )}
              <h3 className="text-xl font-bold">{p.name}</h3>
              <p className="mt-3 font-display text-3xl font-extrabold text-primary">
                {formatCurrency(p.priceUSD)}
              </p>
              <p className="mt-2 min-h-[2.5rem] text-sm text-muted-foreground">{p.subtitle}</p>
              <ul className="mt-5 flex-1 space-y-2.5">
                {p.features.map((f) => (
                  <li key={f} className="flex gap-2 text-sm text-muted-foreground">
                    <Check className="mt-0.5 size-4 shrink-0 text-secondary" /> {f}
                  </li>
                ))}
              </ul>
              <Button
                variant={p.highlight ? "gradient" : "outline"}
                size="lg"
                className="mt-6 w-full"
                onClick={() => openPass(p)}
              >
                {p.ctaLabel} <ArrowRight className="size-4" />
              </Button>
            </Card>
          </StaggerItem>
        ))}
      </Stagger>

      <Reveal className="mt-8 text-center text-sm text-muted-foreground">
        Group and institutional rates available. Pick any pass above to register, or contact the registration team.
      </Reveal>

      <PassRegisterDialog pass={selectedPass} open={open} onOpenChange={setOpen} />
    </Section>
  );
}
