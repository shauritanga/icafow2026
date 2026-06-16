import { Section, SectionHeading } from "@/components/layout/section";
import { Stagger, StaggerItem } from "@/components/motion/reveal";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/icon";
import { thematicAreas } from "@/lib/content/about";

export function ThematicAreas() {
  return (
    <Section id="thematic-areas" muted>
      <SectionHeading
        eyebrow="Thematic Areas"
        title={<>Exploring the <span className="text-gradient-brand">key frontiers</span> of AI &amp; work</>}
        description="ICAFoW 2026 convenes conversations across six interconnected thematic areas shaping the future of work."
      />

      <Stagger className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {thematicAreas.map((area) => (
          <StaggerItem key={area.numeral}>
            <Card className="group h-full p-6 transition-all hover:-translate-y-1 hover:shadow-lg">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex size-12 items-center justify-center rounded-xl bg-brand-gradient text-white">
                  <Icon name={area.icon} className="size-6" />
                </div>
                <span className="text-2xl font-bold text-muted-foreground/30">
                  {area.numeral}.
                </span>
              </div>
              <h4 className="text-lg font-semibold">{area.title}</h4>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {area.description}
              </p>
            </Card>
          </StaggerItem>
        ))}
      </Stagger>
    </Section>
  );
}
