import { Section, SectionHeading } from "@/components/layout/section";
import { Stagger, StaggerItem } from "@/components/motion/reveal";
import { Icon } from "@/components/icon";
import { whyAttend } from "@/lib/content/about";

export function WhyAttend() {
  return (
    <Section id="why-attend" tone="gradient">
      <SectionHeading
        onDark
        eyebrow="Why Attend?"
        title={<>Reasons to be part of <span className="text-gold">ICAFoW 2026</span></>}
        description="Discover the benefits of attending the International Conference on AI & Future of Work (ICAFoW 2026)."
      />

      <Stagger className="grid gap-5 md:grid-cols-3">
        {whyAttend.map((benefit) => (
          <StaggerItem key={benefit.title}>
            <div className="group flex h-full gap-4 rounded-2xl border border-white/15 bg-white/10 p-6 backdrop-blur-sm transition-colors hover:bg-white/[0.16]">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-white/15 text-white ring-1 ring-white/20 transition-transform group-hover:-translate-y-0.5">
                <Icon name={benefit.icon} className="size-6" />
              </div>
              <div>
                <h4 className="font-semibold text-white">{benefit.title}</h4>
                <p className="mt-1.5 text-sm leading-relaxed text-white/75">
                  {benefit.description}
                </p>
              </div>
            </div>
          </StaggerItem>
        ))}
      </Stagger>
    </Section>
  );
}
