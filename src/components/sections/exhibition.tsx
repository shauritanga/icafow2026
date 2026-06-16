import Link from "next/link";
import { Check, ArrowRight, Star } from "lucide-react";
import { Section, SectionHeading } from "@/components/layout/section";
import { Stagger, StaggerItem, Reveal } from "@/components/motion/reveal";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/icon";
import { cn } from "@/lib/utils";
import { booths, exhibitBenefits } from "@/lib/content/booths";

export function Exhibition() {
  return (
    <Section id="exhibition" muted>
      <SectionHeading
        eyebrow="Exhibition Opportunities"
        title={<>Showcase the future of <span className="text-gradient-brand">AI and work</span></>}
        description="The premier showcase of artificial intelligence, emerging technologies and future-of-work solutions in Africa. Demonstrate your products, services and research to decision-makers and stakeholders."
      />

      {/* Why exhibit */}
      <Stagger className="mb-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {exhibitBenefits.map((b, i) => (
          <StaggerItem key={b.title}>
            <div className="flex h-full items-start gap-3 rounded-xl border border-border bg-card p-4">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-accent text-secondary">
                <Icon name={b.icon} className="size-5" />
              </span>
              <div>
                <span className="text-xs font-bold text-muted-foreground">0{i + 1}</span>
                <p className="text-sm font-medium leading-snug">{b.title}</p>
              </div>
            </div>
          </StaggerItem>
        ))}
      </Stagger>

      {/* Booth packages */}
      <div className="grid gap-6 lg:grid-cols-2">
        {booths.map((booth) => (
          <Reveal key={booth.id}>
            <Card
              className={cn(
                "relative flex h-full flex-col overflow-hidden transition-all hover:shadow-xl",
                booth.highlight && "ring-2 ring-secondary"
              )}
            >
              <div className="bg-brand-gradient p-6 text-white">
                {booth.highlight && (
                  <Badge variant="gold" className="mb-2 gap-1">
                    <Star className="size-3" /> Premium
                  </Badge>
                )}
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <h3 className="text-2xl font-bold">{booth.name}</h3>
                    <p className="text-sm text-white/80">{booth.size} shell scheme</p>
                  </div>
                  <div className="text-right">
                    <p className="font-display text-3xl font-extrabold">${booth.priceUSD.toLocaleString()}</p>
                    <p className="text-xs text-white/70">TZS {booth.priceTZS.toLocaleString()}</p>
                  </div>
                </div>
              </div>
              <div className="flex flex-1 flex-col p-6">
                <p className="text-sm text-muted-foreground">{booth.audience}</p>
                <ul className="mt-5 flex-1 space-y-2.5">
                  {booth.features.map((f) => (
                    <li key={f} className="flex gap-2 text-sm text-muted-foreground">
                      <Check className="mt-0.5 size-4 shrink-0 text-secondary" /> {f}
                    </li>
                  ))}
                </ul>
                <Button
                  asChild
                  variant={booth.highlight ? "green" : "default"}
                  size="lg"
                  className="mt-6 w-full"
                >
                  <Link href={`/register/exhibitor?booth=${booth.id}`}>
                    Reserve this Booth <ArrowRight className="size-4" />
                  </Link>
                </Button>
              </div>
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
