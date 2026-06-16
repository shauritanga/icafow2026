"use client";

import * as React from "react";
import { Check, Star, ArrowRight, Sparkles } from "lucide-react";
import { Section, SectionHeading } from "@/components/layout/section";
import { Stagger, StaggerItem, Reveal } from "@/components/motion/reveal";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PassRegisterDialog } from "@/components/forms/pass-register-dialog";
import { cn, formatCurrency } from "@/lib/utils";
import { passes, type Pass } from "@/lib/content/passes";

const accentRing = {
  maroon: "ring-maroon/20",
  green: "ring-green/30",
  gold: "ring-gold/40",
} as const;

export function Registration() {
  const conferencePasses = passes.filter((p) => !p.standalone);
  const safari = passes.find((p) => p.standalone)!;

  const [selectedPass, setSelectedPass] = React.useState<Pass | null>(null);
  const [open, setOpen] = React.useState(false);

  function openPass(pass: Pass) {
    setSelectedPass(pass);
    setOpen(true);
  }

  return (
    <Section id="registration" muted>
      <SectionHeading
        eyebrow="Registration"
        title={<>Choose the pass that fits <span className="text-gradient-brand">your goals</span></>}
        description="All participants receive an official certificate of participation, conference materials, refreshments, lunches and access to networking sessions."
      />

      <Stagger className="grid gap-6 lg:grid-cols-4">
        {conferencePasses.map((p) => (
          <StaggerItem key={p.id}>
            <Card
              className={cn(
                "relative flex h-full flex-col p-6 transition-all hover:-translate-y-1 hover:shadow-xl",
                p.highlight && "ring-2 ring-secondary shadow-lg lg:scale-[1.03]",
                !p.highlight && "hover:ring-1",
                accentRing[p.accent]
              )}
            >
              {p.badge && (
                <Badge
                  variant={p.accent === "gold" ? "gold" : p.highlight ? "green" : "maroonSoft"}
                  className="absolute -top-3 left-1/2 -translate-x-1/2 gap-1 shadow-sm"
                >
                  {p.highlight && <Star className="size-3" />} {p.badge}
                </Badge>
              )}
              <h3 className="text-lg font-bold">{p.name}</h3>
              <p className="mt-1 min-h-[2.5rem] text-xs text-muted-foreground">{p.subtitle}</p>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-sm font-medium text-muted-foreground">USD</span>
                <span className="font-display text-4xl font-extrabold text-primary">
                  {p.priceUSD}
                </span>
              </div>
              <ul className="mt-5 flex-1 space-y-2.5">
                {p.features.map((f) => (
                  <li key={f} className="flex gap-2 text-sm text-muted-foreground">
                    <Check className="mt-0.5 size-4 shrink-0 text-secondary" /> {f}
                  </li>
                ))}
              </ul>
              <Button
                variant={p.highlight ? "green" : "default"}
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

      {/* Safari add-on */}
      <Reveal className="mt-8">
        <Card className="overflow-hidden border-secondary/30 bg-accent/30">
          <div className="grid items-center gap-6 p-6 sm:p-8 lg:grid-cols-[1fr_auto]">
            <div className="flex items-start gap-4">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-brand-gradient text-white">
                <Sparkles className="size-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold">{safari.name}</h3>
                  <Badge variant="green">{safari.badge}</Badge>
                </div>
                <p className="mt-1 max-w-xl text-sm text-muted-foreground">{safari.tagline}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <span className="text-xs text-muted-foreground">from</span>
                <p className="font-display text-3xl font-extrabold text-primary">
                  {formatCurrency(safari.priceUSD)}
                </p>
              </div>
              <Button variant="green" size="lg" onClick={() => openPass(safari)}>
                {safari.ctaLabel}
              </Button>
            </div>
          </div>
        </Card>
      </Reveal>

      <Reveal className="mt-6 text-center text-sm text-muted-foreground">
        Group and institutional rates available. Pick any pass above to register, or contact the registration team.
      </Reveal>

      <PassRegisterDialog pass={selectedPass} open={open} onOpenChange={setOpen} />
    </Section>
  );
}
