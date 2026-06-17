import * as React from "react";
import { cn } from "@/lib/utils";
import { Reveal } from "@/components/motion/reveal";
import { Badge } from "@/components/ui/badge";

export type SectionTone = "light" | "dark" | "gradient";

export function Section({
  id,
  className,
  children,
  muted,
  tone = "light",
}: {
  id?: string;
  className?: string;
  children: React.ReactNode;
  /** Light-grey background (only applies when tone === "light"). */
  muted?: boolean;
  /** Visual treatment: plain light, dark tech surface, or brand-gradient band. */
  tone?: SectionTone;
}) {
  const isDark = tone === "dark";
  const isGradient = tone === "gradient";
  return (
    <section
      id={id}
      className={cn(
        "scroll-mt-20 py-20 sm:py-24 lg:py-28",
        tone === "light" && muted && "bg-muted/40",
        isDark && "section-dark relative overflow-hidden",
        isGradient && "bg-brand-gradient relative overflow-hidden text-white",
        className
      )}
    >
      {isDark && (
        <>
          <div className="pointer-events-none absolute inset-0 bg-mesh opacity-60" aria-hidden />
          <div className="pointer-events-none absolute inset-0 bg-grid" aria-hidden />
        </>
      )}
      {isGradient && (
        <div className="pointer-events-none absolute inset-0 bg-mesh opacity-30" aria-hidden />
      )}
      <div className={cn("container-edge", (isDark || isGradient) && "relative")}>
        {children}
      </div>
    </section>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
  className,
  onDark = false,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  align?: "center" | "left";
  className?: string;
  /** Use the light-on-dark eyebrow chip when the section is dark/gradient. */
  onDark?: boolean;
}) {
  return (
    <Reveal
      className={cn(
        "mb-12 flex flex-col gap-4",
        align === "center" ? "items-center text-center" : "items-start text-left",
        className
      )}
    >
      {eyebrow && (
        <Badge
          variant={onDark ? "outline" : "maroonSoft"}
          className={cn(
            "uppercase tracking-wider",
            onDark && "border-white/15 bg-white/10 text-white backdrop-blur"
          )}
        >
          {eyebrow}
        </Badge>
      )}
      <h2
        className={cn(
          "max-w-3xl text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl",
          align === "center" && "mx-auto"
        )}
      >
        {title}
      </h2>
      {description && (
        <p
          className={cn(
            "max-w-2xl text-base leading-relaxed sm:text-lg",
            onDark ? "text-white/75" : "text-muted-foreground",
            align === "center" && "mx-auto"
          )}
        >
          {description}
        </p>
      )}
    </Reveal>
  );
}
