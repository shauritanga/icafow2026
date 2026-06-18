"use client";

import * as React from "react";
import { useSiteSettings } from "@/components/site-provider";

function diff(target: number) {
  const now = Date.now();
  const delta = Math.max(0, target - now);
  return {
    days: Math.floor(delta / 86400000),
    hours: Math.floor((delta / 3600000) % 24),
    minutes: Math.floor((delta / 60000) % 60),
    seconds: Math.floor((delta / 1000) % 60),
  };
}

export function Countdown({ light = false }: { light?: boolean }) {
  const siteConfig = useSiteSettings();
  const target = React.useMemo(
    () => new Date(siteConfig.dates.startISO).getTime(),
    [siteConfig.dates.startISO]
  );
  const [t, setT] = React.useState(() => diff(target));

  React.useEffect(() => {
    const id = setInterval(() => setT(diff(target)), 1000);
    return () => clearInterval(id);
  }, [target]);

  const units = [
    { label: "Days", value: t.days },
    { label: "Hours", value: t.hours },
    { label: "Minutes", value: t.minutes },
    { label: "Seconds", value: t.seconds },
  ];

  return (
    <div className="flex gap-2.5 sm:gap-3.5" role="timer" aria-label="Countdown to ICAFoW 2026">
      {units.map((u) => (
        <div
          key={u.label}
          className={
            light
              ? "flex min-w-[64px] flex-col items-center rounded-xl bg-white/10 px-3 py-2.5 backdrop-blur-sm sm:min-w-[78px]"
              : "flex min-w-[64px] flex-col items-center rounded-xl border border-border bg-card px-3 py-2.5 shadow-sm sm:min-w-[78px]"
          }
        >
          <span
            suppressHydrationWarning
            className={
              light
                ? "font-display text-2xl font-bold tabular-nums text-white sm:text-3xl"
                : "font-display text-2xl font-bold tabular-nums text-primary sm:text-3xl"
            }
          >
            {String(u.value).padStart(2, "0")}
          </span>
          <span
            className={
              light
                ? "text-[10px] font-medium uppercase tracking-wider text-white/70 sm:text-xs"
                : "text-[10px] font-medium uppercase tracking-wider text-muted-foreground sm:text-xs"
            }
          >
            {u.label}
          </span>
        </div>
      ))}
    </div>
  );
}
