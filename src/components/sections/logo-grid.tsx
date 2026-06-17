import Image from "next/image";
import { cn } from "@/lib/utils";
import { Stagger, StaggerItem } from "@/components/motion/reveal";
import type { OrgLogo } from "@/lib/content/partners";

/**
 * Full-width, auto-fit logo grid that scales to any number of logos.
 * Columns are added automatically on wider screens and wrap as the list grows.
 * Tiles stay WHITE so dark-on-transparent logos remain visible on dark sections.
 */
export function LogoGrid({
  logos,
  className,
}: {
  logos: OrgLogo[];
  className?: string;
}) {
  return (
    <Stagger
      className={cn(
        "grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-4 sm:grid-cols-[repeat(auto-fill,minmax(160px,1fr))]",
        className
      )}
    >
      {logos.map((org) => (
        <StaggerItem key={org.name}>
          <div className="group flex aspect-[3/2] items-center justify-center rounded-xl border border-white/10 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg">
            <Image
              src={org.logo}
              alt={org.name}
              title={org.name}
              width={200}
              height={120}
              className="max-h-16 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
            />
          </div>
        </StaggerItem>
      ))}
    </Stagger>
  );
}
