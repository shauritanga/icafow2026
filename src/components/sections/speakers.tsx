import Image from "next/image";
import { Mic2, ArrowRight } from "lucide-react";
import { Section, SectionHeading } from "@/components/layout/section";
import { Stagger, StaggerItem, Reveal } from "@/components/motion/reveal";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SpeakerApplyButton } from "@/components/forms/register-triggers";
import { speakers as placeholderSpeakers, initials, type Speaker } from "@/lib/content/speakers";
import { prisma } from "@/lib/prisma";

export async function Speakers() {
  const dbRegistrations = await prisma.registration.findMany({
    where: { type: "SPEAKER", status: "CONFIRMED" },
    orderBy: { createdAt: "asc" },
  });

  const dynamicSpeakers: Speaker[] = dbRegistrations.map((r) => {
    const details = r.details as any;
    return {
      id: r.id,
      name: r.fullName,
      role: r.jobTitle || "",
      organization: r.organization || "",
      country: r.country || "",
      topic: details?.topic,
      image: details?.photoData || null,
      keynote: false,
    };
  });

  const allSpeakers = [...dynamicSpeakers, ...placeholderSpeakers];

  return (
    <Section id="speakers" tone="dark">
      <SectionHeading
        onDark
        eyebrow="Speakers & Keynote Guests"
        title={<>Learn from <span className="text-gradient-light">100+ visionary leaders</span></>}
        description="Ministers, researchers, executives and innovators from across Africa and beyond will share insights on AI and the future of work. Full speaker line-up announced soon."
      />

      <Stagger className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {allSpeakers.map((s) => (
          <StaggerItem key={s.id}>
            <Card className="group relative h-full overflow-hidden border-white/10 p-0 transition-all hover:-translate-y-1 hover:ring-1 hover:ring-white/20">
              <div className="relative aspect-[3/4] w-full overflow-hidden bg-brand-gradient">
                {s.image ? (
                  <Image
                    src={s.image}
                    alt={s.name}
                    fill
                    sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <span className="font-display text-5xl font-bold text-white/90">
                      {initials(s.name)}
                    </span>
                  </div>
                )}

                {/* Brand gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-maroon-dark/95 via-maroon/30 to-transparent" />

                {s.keynote && (
                  <Badge variant="gold" className="absolute left-3 top-3 z-10 gap-1">
                    <Mic2 className="size-3" /> Keynote
                  </Badge>
                )}

                {/* Name / role / organization overlay */}
                <div className="absolute inset-x-0 bottom-0 p-4 text-left">
                  <h3 className="font-semibold leading-tight text-white">{s.name}</h3>
                  <p className="mt-0.5 text-xs font-medium text-white/85">{s.role}</p>
                  <p className="text-xs text-green-light">{s.organization}</p>
                </div>
              </div>
            </Card>
          </StaggerItem>
        ))}
      </Stagger>

      <Reveal className="mt-12 text-center">
        <p className="mb-4 text-muted-foreground">Want to share your expertise on the ICAFoW stage?</p>
        <SpeakerApplyButton variant="gradient" size="lg">
          Apply to Speak <ArrowRight className="size-4" />
        </SpeakerApplyButton>
      </Reveal>
    </Section>
  );
}
