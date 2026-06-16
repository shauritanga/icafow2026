import Image from "next/image";
import { CheckCircle2, Target, ArrowRight } from "lucide-react";
import { Section, SectionHeading } from "@/components/layout/section";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/icon";
import { aboutIntro, objectives, outcomes } from "@/lib/content/about";
import { organizer } from "@/lib/content/partners";

export function About() {
  return (
    <Section id="about">
      <SectionHeading
        eyebrow="About ICAFoW 2026"
        title={<>A pioneering platform for <span className="text-gradient-brand">AI &amp; the future of work</span></>}
        description={aboutIntro}
      />

      {/* Host */}
      <Reveal>
        <Card className="mb-16 overflow-hidden">
          <div className="grid items-center gap-8 p-6 sm:p-8 lg:grid-cols-[260px_1fr] lg:gap-10">
            <div className="flex items-center justify-center rounded-xl bg-muted/50 p-6">
              <Image
                src={organizer.logo}
                alt={organizer.name}
                width={220}
                height={220}
                className="h-auto w-full max-w-[200px] object-contain"
              />
            </div>
            <div>
              <span className="text-sm font-semibold uppercase tracking-wider text-secondary">
                {organizer.role}
              </span>
              <h3 className="mt-1 text-2xl font-bold">{organizer.name}</h3>
              <p className="mt-3 leading-relaxed text-muted-foreground">
                {organizer.description}
              </p>
            </div>
          </div>
        </Card>
      </Reveal>

      {/* Objectives */}
      <div className="mb-6 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-primary">
        <Target className="size-4" /> Event Objectives
      </div>
      <Stagger className="grid gap-5 sm:grid-cols-2">
        {objectives.map((o) => (
          <StaggerItem key={o.title}>
            <Card className="group h-full p-6 transition-all hover:-translate-y-1 hover:shadow-lg">
              <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-brand-gradient text-white">
                <Icon name={o.icon} className="size-6" />
              </div>
              <h4 className="text-lg font-semibold">{o.title}</h4>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{o.objective}</p>
              <p className="mt-3 flex gap-2 text-sm leading-relaxed text-foreground/80">
                <ArrowRight className="mt-0.5 size-4 shrink-0 text-secondary" />
                {o.action}
              </p>
            </Card>
          </StaggerItem>
        ))}
      </Stagger>

      {/* Outcomes */}
      <div className="mt-12 grid gap-6 lg:grid-cols-2">
        <Reveal>
          <Card className="h-full border-l-4 border-l-maroon p-6">
            <h4 className="text-lg font-semibold">Short-Term Outcomes</h4>
            <ul className="mt-4 space-y-3">
              {outcomes.shortTerm.map((o) => (
                <li key={o} className="flex gap-3 text-sm text-muted-foreground">
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-maroon" /> {o}
                </li>
              ))}
            </ul>
          </Card>
        </Reveal>
        <Reveal delay={0.1}>
          <Card className="h-full border-l-4 border-l-green p-6">
            <h4 className="text-lg font-semibold">Long-Term Outcomes</h4>
            <ul className="mt-4 space-y-3">
              {outcomes.longTerm.map((o) => (
                <li key={o} className="flex gap-3 text-sm text-muted-foreground">
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-secondary" /> {o}
                </li>
              ))}
            </ul>
          </Card>
        </Reveal>
      </div>
    </Section>
  );
}
