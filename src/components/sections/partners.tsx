import Link from "next/link";
import Image from "next/image";
import { Check, ArrowRight } from "lucide-react";
import { Section, SectionHeading } from "@/components/layout/section";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { partnerLogos, partnerReasons, type OrgLogo } from "@/lib/content/partners";

function LogoTile({ org }: { org: OrgLogo }) {
  return (
    <div className="group flex aspect-[3/2] items-center justify-center rounded-xl border border-border bg-card p-5 transition-all hover:-translate-y-0.5 hover:shadow-md">
      <Image
        src={org.logo}
        alt={org.name}
        title={org.name}
        width={200}
        height={120}
        className="max-h-16 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
      />
    </div>
  );
}

export function Partners() {
  return (
    <Section id="partners">
      <SectionHeading
        eyebrow="Partners & Organizers"
        title={<>Join the movement shaping <span className="text-gradient-brand">Africa&apos;s AI future</span></>}
        description="ICAFoW 2026 brings together visionary leaders, innovators, policymakers, researchers and development partners committed to harnessing AI for sustainable development."
      />

      <div className="grid gap-10 lg:grid-cols-[1fr_1.4fr]">
        <Reveal>
          <Card className="h-full bg-brand-gradient p-8 text-white">
            <h3 className="text-2xl font-bold">Why partner with ICAFoW 2026?</h3>
            <ul className="mt-6 space-y-3">
              {partnerReasons.map((r) => (
                <li key={r} className="flex gap-3 text-sm text-white/90">
                  <Check className="mt-0.5 size-4 shrink-0 text-gold" /> {r}
                </li>
              ))}
            </ul>
            <Button asChild variant="white" size="lg" className="mt-8">
              <Link href="/register/partner">
                Become a Partner <ArrowRight className="size-4" />
              </Link>
            </Button>
          </Card>
        </Reveal>

        <div>
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Our Partners
          </h3>
          <Stagger className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {partnerLogos.map((org) => (
              <StaggerItem key={org.name}>
                <LogoTile org={org} />
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </div>
    </Section>
  );
}
