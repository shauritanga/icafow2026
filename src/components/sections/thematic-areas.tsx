import { Section, SectionHeading } from "@/components/layout/section";
import { Stagger, StaggerItem } from "@/components/motion/reveal";
import { Icon } from "@/components/icon";
import { thematicAreas } from "@/lib/content/about";

export function ThematicAreas() {
  return (
    <Section id="thematic-areas" tone="dark">
      <SectionHeading
        onDark
        eyebrow="Thematic Areas"
        title={<>Exploring the <span className="text-gradient-light">key frontiers</span> of AI &amp; work</>}
        description="ICAFoW 2026 convenes conversations across six interconnected thematic areas shaping the future of work."
      />

      <Stagger className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {thematicAreas.map((area) => (
          <StaggerItem key={area.numeral}>
            <div className="glow-card group h-full overflow-hidden rounded-2xl p-6">
              <div className="relative">
                <div className="mb-5 flex size-12 items-center justify-center rounded-xl bg-brand-gradient text-white shadow-lg ring-1 ring-white/15">
                  <Icon name={area.icon} className="size-6" />
                </div>
                <h4 className="text-lg font-semibold text-white">{area.title}</h4>
                <p className="mt-2 text-sm leading-relaxed text-white/60">
                  {area.description}
                </p>
              </div>

              {/* Bottom gradient hairline that lights up on hover */}
              <div className="absolute inset-x-6 bottom-0 h-px bg-gradient-to-r from-transparent via-green-light/50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            </div>
          </StaggerItem>
        ))}
      </Stagger>
    </Section>
  );
}
