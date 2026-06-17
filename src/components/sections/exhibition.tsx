import { Check, ArrowRight, Star } from "lucide-react";
import { Section, SectionHeading } from "@/components/layout/section";
import { Stagger, StaggerItem, Reveal } from "@/components/motion/reveal";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/icon";
import { BoothReserveButton } from "@/components/forms/register-triggers";
import { cn, formatCurrency } from "@/lib/utils";
import { booths, exhibitBenefits } from "@/lib/content/booths";

export function Exhibition() {
  return (
    <Section id="exhibition" tone="dark">
      <SectionHeading
        onDark
        eyebrow="Exhibition Opportunities"
        title={<>Showcase the future of <span className="text-gradient-light">AI and work</span></>}
        description="The premier showcase of artificial intelligence, emerging technologies and future-of-work solutions in Africa. Demonstrate your products, services and research to decision-makers and stakeholders."
      />

      {/* Why exhibit */}
      <Stagger className="mb-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {exhibitBenefits.map((b, i) => (
          <StaggerItem key={b.title}>
            <div className="glow-card flex h-full items-start gap-3 rounded-xl p-4">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-gradient text-white ring-1 ring-white/15">
                <Icon name={b.icon} className="size-5" />
              </span>
              <div>
                <span className="text-xs font-bold text-green-light">0{i + 1}</span>
                <p className="text-sm font-medium leading-snug text-white">{b.title}</p>
              </div>
            </div>
          </StaggerItem>
        ))}
      </Stagger>

      {/* Booth packages */}
      <div className="mx-auto grid max-w-4xl gap-6 sm:grid-cols-2">
        {booths.map((booth) => (
          <Reveal key={booth.id}>
            <Card
              className={cn(
                "relative flex h-full flex-col p-6 transition-all hover:-translate-y-1",
                booth.highlight
                  ? "ring-2 ring-gold shadow-[0_24px_70px_-20px] shadow-gold/50"
                  : "hover:ring-1 hover:ring-white/20"
              )}
            >
              {booth.highlight && (
                <Badge
                  variant="gold"
                  className="absolute -top-3 left-1/2 -translate-x-1/2 gap-1 shadow-sm"
                >
                  <Star className="size-3" /> Premium
                </Badge>
              )}
              <h3 className="text-xl font-bold">{booth.name}</h3>
              <p className="mt-3 font-display text-3xl font-extrabold text-primary">
                {formatCurrency(booth.priceUSD)}
              </p>
              <p className="mt-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                TZS {booth.priceTZS.toLocaleString()} · {booth.size} shell scheme
              </p>
              <p className="mt-3 text-sm text-muted-foreground">{booth.audience}</p>
              <ul className="mt-5 flex-1 space-y-2.5">
                {booth.features.map((f) => (
                  <li key={f} className="flex gap-2 text-sm text-muted-foreground">
                    <Check className="mt-0.5 size-4 shrink-0 text-secondary" /> {f}
                  </li>
                ))}
              </ul>
              <BoothReserveButton
                boothId={booth.id}
                variant={booth.highlight ? "gradient" : "outline"}
                size="lg"
                className="mt-6 w-full"
              >
                Reserve this Booth <ArrowRight className="size-4" />
              </BoothReserveButton>
            </Card>
          </Reveal>
        ))}
      </div>

      <Reveal className="mt-8 text-center text-sm text-muted-foreground">
        Secure your exhibition space today and position your organization at the forefront of AI and the future of work.
      </Reveal>
    </Section>
  );
}
