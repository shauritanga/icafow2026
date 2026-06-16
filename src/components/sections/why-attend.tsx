import { Section, SectionHeading } from "@/components/layout/section";
import { Stagger, StaggerItem } from "@/components/motion/reveal";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/icon";
import { whyAttend } from "@/lib/content/about";

export function WhyAttend() {
  return (
    <Section id="why-attend">
      <SectionHeading
        eyebrow="Why Attend?"
        title={<>Reasons to be part of <span className="text-gradient-brand">ICAFoW 2026</span></>}
        description="Discover the benefits of attending the International Conference on AI & Future of Work (ICAFoW 2026)."
      />

      <Stagger className="grid gap-6 md:grid-cols-3">
        {whyAttend.map((benefit) => (
          <StaggerItem key={benefit.title}>
            <Card className="group h-full p-8 text-center transition-all hover:-translate-y-1 hover:shadow-lg">
              <div className="mx-auto mb-5 flex size-14 items-center justify-center rounded-2xl bg-brand-gradient text-white">
                <Icon name={benefit.icon} className="size-7" />
              </div>
              <h4 className="text-lg font-semibold">{benefit.title}</h4>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {benefit.description}
              </p>
            </Card>
          </StaggerItem>
        ))}
      </Stagger>
    </Section>
  );
}
