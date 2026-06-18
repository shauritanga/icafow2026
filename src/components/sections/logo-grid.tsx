
import { cn } from "@/lib/utils";
import type { OrgLogo } from "@/lib/content/partners";

/**
 * Full-width infinite scrolling logo marquee.
 * Tiles have no background to fit the sleek dark theme.
 */
export function LogoGrid({
  logos,
  className,
}: {
  logos: OrgLogo[];
  className?: string;
}) {
  // Duplicate logos for seamless scrolling
  const doubledLogos = [...logos, ...logos];

  return (
    <div
      className={cn(
        "group relative flex overflow-hidden w-[100vw] left-[50%] -ml-[50vw] [mask-image:_linear-gradient(to_right,transparent_0,_black_128px,_black_calc(100%-128px),transparent_100%)]",
        className
      )}
    >
      <div className="animate-infinite-scroll flex w-max items-center gap-16 py-6">
        {doubledLogos.map((org, i) => (
          <div key={`${org.name}-${i}`} className="flex w-[250px] shrink-0 items-center justify-center transition-all hover:scale-105">
            <img
              src={org.logo}
              alt={org.name}
              title={org.name}
              width={500}
              height={300}
              className="max-h-40 w-full object-contain drop-shadow-md"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
