import Image from "next/image";
import { CheckCircle2, Target, ArrowRight } from "lucide-react";
import { Section, SectionHeading } from "@/components/layout/section";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
import { Icon } from "@/components/icon";
import { aboutIntro, objectives, outcomes } from "@/lib/content/about";
import { organizer } from "@/lib/content/partners";

export function About() {
  return (
    <Section id="about" tone="dark">
      <SectionHeading
        onDark
        eyebrow="About ICAFoW 2026"
        title={<>A pioneering platform for <span className="text-gradient-light">AI &amp; the future of work</span></>}
        description={aboutIntro}
      />

      {/* Host — gradient feature banner */}
      <Reveal>
        <div className="relative mb-16 overflow-hidden rounded-3xl bg-brand-gradient p-8 sm:p-10">
          <div className="pointer-events-none absolute inset-0 bg-mesh opacity-30" aria-hidden />
          <div className="glow-blob -right-16 -top-16 size-64 bg-gold" aria-hidden />
          <div className="relative grid items-center gap-8 lg:grid-cols-[260px_1fr] lg:gap-12">
            <div className="flex items-center justify-center rounded-2xl bg-white/95 p-6 shadow-lg ring-1 ring-white/30">
              <Image
                src={organizer.logo}
                alt={organizer.name}
                width={220}
                height={220}
                className="h-auto w-full max-w-[200px] object-contain"
              />
            </div>
            <div className="text-white">
              <span className="text-sm font-semibold uppercase tracking-wider text-gold">
                {organizer.role}
              </span>
              <h3 className="mt-1 text-2xl font-bold">{organizer.name}</h3>
              <p className="mt-3 leading-relaxed text-white/85">{organizer.description}</p>
            </div>
          </div>
        </div>
      </Reveal>

      {/* Objectives — horizontal feature rows */}
      <div className="mb-6 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-green-light">
        <Target className="size-4" /> Event Objectives
      </div>
      <Stagger className="grid gap-4 lg:grid-cols-2">
        {objectives.map((o) => (
          <StaggerItem key={o.title}>
            <div className="glow-card group flex h-full gap-4 rounded-2xl p-6">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-brand-gradient text-white shadow-lg ring-1 ring-white/15">
                <Icon name={o.icon} className="size-6" />
              </div>
              <div>
                <h4 className="font-semibold text-white">{o.title}</h4>
                <p className="mt-1.5 text-sm leading-relaxed text-white/60">{o.objective}</p>
                <p className="mt-2.5 flex gap-2 text-sm leading-relaxed text-white/80">
                  <ArrowRight className="mt-0.5 size-4 shrink-0 text-green-light" />
                  {o.action}
                </p>
              </div>
            </div>
          </StaggerItem>
        ))}
      </Stagger>

      {/* Outcomes */}
      <div className="mt-12 grid gap-5 lg:grid-cols-2">
        <Reveal>
          <div className="glow-card h-full rounded-2xl border-t-2 border-t-maroon-soft p-6">
            <h4 className="text-lg font-semibold text-white">Short-Term Outcomes</h4>
            <ul className="mt-4 space-y-3">
              {outcomes.shortTerm.map((o) => (
                <li key={o} className="flex gap-3 text-sm text-white/70">
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-maroon-soft" /> {o}
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <div className="glow-card h-full rounded-2xl border-t-2 border-t-green-light p-6">
            <h4 className="text-lg font-semibold text-white">Long-Term Outcomes</h4>
            <ul className="mt-4 space-y-3">
              {outcomes.longTerm.map((o) => (
                <li key={o} className="flex gap-3 text-sm text-white/70">
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-green-light" /> {o}
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
