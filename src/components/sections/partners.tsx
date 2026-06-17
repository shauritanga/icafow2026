import { Check, ArrowRight } from "lucide-react";
import { Section, SectionHeading } from "@/components/layout/section";
import { Reveal } from "@/components/motion/reveal";
import { PartnerApplyButton } from "@/components/forms/register-triggers";
import { LogoGrid } from "@/components/sections/logo-grid";
import { partnerLogos, partnerReasons } from "@/lib/content/partners";

export function Partners() {
  return (
    <Section id="partners" tone="dark">
      <SectionHeading
        onDark
        eyebrow="Partners & Organizers"
        title={<>Join the movement shaping <span className="text-gradient-light">Africa&apos;s AI future</span></>}
        description="ICAFoW 2026 brings together visionary leaders, innovators, policymakers, researchers and development partners committed to harnessing AI for sustainable development."
      />

      {/* Why partner — full-width gradient banner (fixed height regardless of partner count) */}
      <Reveal>
        <div className="relative overflow-hidden rounded-3xl bg-brand-gradient p-8 text-white sm:p-10">
          <div className="pointer-events-none absolute inset-0 bg-mesh opacity-30" aria-hidden />
          <div className="glow-blob -right-16 -top-16 size-64 bg-gold" aria-hidden />
          <div className="relative">
            <h3 className="text-2xl font-bold">Why partner with ICAFoW 2026?</h3>
            <ul className="mt-6 grid gap-x-8 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
              {partnerReasons.map((r) => (
                <li key={r} className="flex gap-3 text-sm text-white/90">
                  <Check className="mt-0.5 size-4 shrink-0 text-gold" /> {r}
                </li>
              ))}
            </ul>
            <PartnerApplyButton variant="white" size="lg" className="mt-8">
              Become a Partner <ArrowRight className="size-4" />
            </PartnerApplyButton>
          </div>
        </div>
      </Reveal>

      {/* Logos — full-width auto-fit grid that scales to any number */}
      <div className="mt-16">
        <h3 className="mb-6 text-sm font-semibold uppercase tracking-wider text-white/60">
          Our Partners
        </h3>
        <LogoGrid logos={partnerLogos} />
      </div>
    </Section>
  );
}
