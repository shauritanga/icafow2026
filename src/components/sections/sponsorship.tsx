import Link from "next/link";
import Image from "next/image";
import { Check, ArrowRight, Star } from "lucide-react";
import { Section, SectionHeading } from "@/components/layout/section";
import { Stagger, StaggerItem, Reveal } from "@/components/motion/reveal";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn, formatCurrency } from "@/lib/utils";
import { sponsorTiers, sponsorReasons } from "@/lib/content/sponsors";
import { sponsorLogos } from "@/lib/content/partners";

export function Sponsorship() {
  return (
    <Section id="sponsorship">
      <SectionHeading
        eyebrow="Sponsorship Opportunities"
        title={<>Be seen. Be heard. <span className="text-gradient-brand">Be remembered.</span></>}
        description="Position your organization at the forefront of Africa's AI revolution. Gain unparalleled access to policymakers, industry leaders, researchers, investors and emerging talent."
      />

      <Reveal className="mx-auto mb-12 grid max-w-4xl gap-3 sm:grid-cols-2">
        {sponsorReasons.map((r) => (
          <div key={r} className="flex items-start gap-2.5 rounded-lg border border-border bg-card p-3.5 text-sm">
            <Check className="mt-0.5 size-4 shrink-0 text-secondary" /> {r}
          </div>
        ))}
      </Reveal>

      <Stagger className="grid gap-6 lg:grid-cols-3">
        {sponsorTiers.map((tier) => (
          <StaggerItem key={tier.id}>
            <Card
              className={cn(
                "relative flex h-full flex-col p-6 transition-all hover:-translate-y-1 hover:shadow-xl",
                tier.highlight && "ring-2 ring-gold shadow-lg"
              )}
            >
              {tier.highlight && (
                <Badge variant="gold" className="absolute -top-3 left-1/2 -translate-x-1/2 gap-1">
                  <Star className="size-3" /> Most Popular
                </Badge>
              )}
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-xl font-bold">{tier.name}</h3>
              </div>
              <div className="mt-3">
                {tier.priceUSD ? (
                  <p className="font-display text-3xl font-extrabold text-primary">
                    {formatCurrency(tier.priceUSD)}
                  </p>
                ) : (
                  <p className="font-display text-2xl font-bold text-primary">By negotiation</p>
                )}
                {tier.slots && (
                  <p className="mt-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    {tier.slots}
                  </p>
                )}
              </div>
              <p className="mt-3 text-sm text-muted-foreground">{tier.summary}</p>
              <ul className="mt-5 flex-1 space-y-2.5">
                {tier.benefits.map((b) => (
                  <li key={b} className="flex gap-2 text-sm text-muted-foreground">
                    <Check className="mt-0.5 size-4 shrink-0 text-secondary" /> {b}
                  </li>
                ))}
              </ul>
              <Button
                asChild
                variant={tier.highlight ? "gradient" : "outline"}
                size="lg"
                className="mt-6 w-full"
              >
                <Link href={`/register/sponsor?tier=${tier.id}`}>
                  Become a Sponsor <ArrowRight className="size-4" />
                </Link>
              </Button>
            </Card>
          </StaggerItem>
        ))}
      </Stagger>

      {/* Confirmed sponsors */}
      <Reveal className="mt-16">
        <p className="mb-6 text-center text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Our Sponsors
        </p>
        <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10">
          {sponsorLogos.map((org) => (
            <div
              key={org.name}
              className="group flex h-24 w-44 items-center justify-center rounded-xl border border-border bg-card p-5 transition-all hover:-translate-y-0.5 hover:shadow-md"
            >
              <Image
                src={org.logo}
                alt={org.name}
                title={org.name}
                width={200}
                height={100}
                className="max-h-14 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
              />
            </div>
          ))}
        </div>
      </Reveal>
    </Section>
  );
}
