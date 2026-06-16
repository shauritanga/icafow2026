import Link from "next/link";
import { Trophy, ArrowRight, Rocket } from "lucide-react";
import { Section, SectionHeading } from "@/components/layout/section";
import { Reveal } from "@/components/motion/reveal";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { pitchTimeline } from "@/lib/content/dates";

export function Pitch() {
  return (
    <Section id="pitch" muted>
      <SectionHeading
        eyebrow="Pitch Competition"
        title={<>The <span className="text-gradient-brand">ICAFoW Future of Work</span> Innovation Award 2026</>}
        description="Showcasing innovative AI startups and emerging ventures transforming industries, empowering people and shaping the future of work. Finalists pitch on the main stage before an international audience of investors and leaders."
      />

      <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr]">
        <Reveal>
          <Card className="flex h-full flex-col justify-between overflow-hidden bg-brand-gradient p-8 text-white">
            <div>
              <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-white/15">
                <Trophy className="size-7 text-gold" />
              </div>
              <h3 className="text-2xl font-bold">Win recognition as one of Africa&apos;s leading AI innovators</h3>
              <p className="mt-3 text-white/80">
                A panel of investors, industry leaders and AI experts will evaluate shortlisted
                startups through live pitches. The top finalists compete on the main stage at the Grand Finale.
              </p>
            </div>
            <Button asChild variant="white" size="lg" className="mt-8 self-start">
              <Link href="/register/pitch">
                Apply Now <ArrowRight className="size-4" />
              </Link>
            </Button>
          </Card>
        </Reveal>

        <Reveal delay={0.1}>
          <Card className="h-full p-6 sm:p-8">
            <div className="mb-6 flex items-center gap-2">
              <Rocket className="size-5 text-secondary" />
              <h3 className="font-semibold">Competition Timeline</h3>
            </div>
            <ol className="relative space-y-6 border-l-2 border-border pl-6">
              {pitchTimeline.map((d, i) => (
                <li key={d.title} className="relative">
                  <span className="absolute -left-[31px] flex size-6 items-center justify-center rounded-full bg-brand-gradient text-xs font-bold text-white ring-4 ring-background">
                    {i + 1}
                  </span>
                  <Badge variant="maroonSoft" className="mb-1">{d.date}</Badge>
                  <p className="font-semibold">{d.title}</p>
                  <p className="text-sm text-muted-foreground">{d.description}</p>
                </li>
              ))}
            </ol>
          </Card>
        </Reveal>
      </div>
    </Section>
  );
}
