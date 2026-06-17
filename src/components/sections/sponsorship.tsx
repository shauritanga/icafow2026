import { Check, ArrowRight, Star } from "lucide-react";
import { Section, SectionHeading } from "@/components/layout/section";
import { Stagger, StaggerItem, Reveal } from "@/components/motion/reveal";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SponsorTierButton } from "@/components/forms/register-triggers";
import { LogoGrid } from "@/components/sections/logo-grid";
import { cn, formatCurrency } from "@/lib/utils";
import { sponsorTiers, sponsorReasons } from "@/lib/content/sponsors";
import { sponsorLogos } from "@/lib/content/partners";

export function Sponsorship() {
  return (
    <Section id="sponsorship" tone="dark">
      <SectionHeading
        onDark
        eyebrow="Sponsorship Opportunities"
        title={<>Be seen. Be heard. <span className="text-gradient-light">Be remembered.</span></>}
        description="Position your organization at the forefront of Africa's AI revolution. Gain unparalleled access to policymakers, industry leaders, researchers, investors and emerging talent."
      />

      <Reveal className="mx-auto mb-12 grid max-w-4xl gap-3 sm:grid-cols-2">
        {sponsorReasons.map((r) => (
          <div key={r} className="glow-card flex items-start gap-2.5 rounded-lg p-3.5 text-sm text-white/85">
            <Check className="mt-0.5 size-4 shrink-0 text-green-light" /> {r}
          </div>
        ))}
      </Reveal>

      <Stagger className="grid gap-6 lg:grid-cols-3">
        {sponsorTiers.map((tier) => (
          <StaggerItem key={tier.id}>
            <Card
              className={cn(
                "relative flex h-full flex-col p-6 transition-all hover:-translate-y-1",
                tier.highlight
                  ? "ring-2 ring-gold shadow-[0_24px_70px_-20px] shadow-gold/50"
                  : "hover:ring-1 hover:ring-white/20"
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
              <SponsorTierButton
                tierId={tier.id}
                variant={tier.highlight ? "gradient" : "outline"}
                size="lg"
                className="mt-6 w-full"
              >
                Become a Sponsor <ArrowRight className="size-4" />
              </SponsorTierButton>
            </Card>
          </StaggerItem>
        ))}
      </Stagger>

      {/* Confirmed sponsors — full-width auto-fit grid (scales to any number) */}
      <Reveal className="mt-16">
        <p className="mb-6 text-center text-sm font-semibold uppercase tracking-wider text-white/60">
          Our Sponsors
        </p>
        <LogoGrid logos={sponsorLogos} className="mx-auto max-w-4xl justify-center" />
      </Reveal>
    </Section>
  );
}
