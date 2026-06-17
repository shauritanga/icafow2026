"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { Menu, X, CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { navItems } from "@/lib/content/nav";
import { siteConfig } from "@/lib/content/site";

export function Navbar() {
  const [scrolled, setScrolled] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (y) => setScrolled(y > 24));

  React.useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <motion.header
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-all duration-300",
          scrolled
            ? "border-b border-white/10 bg-[oklch(0.17_0.025_25_/_0.82)] shadow-lg shadow-black/30 backdrop-blur-lg"
            : "bg-transparent"
        )}
      >
        <nav className="container-edge flex h-16 items-center justify-between gap-4 lg:h-20">
          <Link href="#hero" className="flex items-center gap-2 shrink-0" aria-label={siteConfig.name}>
            <Image
              src="/assets/logo-icafow.png"
              alt={`${siteConfig.name} logo`}
              width={150}
              height={48}
              priority
              className="h-9 w-auto drop-shadow-[0_2px_10px_rgba(0,0,0,0.55)] transition-all lg:h-11"
            />
          </Link>

          <div className="hidden items-center gap-1 xl:flex">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  scrolled
                    ? "text-white/85 hover:bg-white/10 hover:text-white"
                    : "text-white/90 hover:bg-white/10 hover:text-white"
                )}
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <Button asChild variant="gradient" size="sm" className="hidden sm:inline-flex">
              <Link href="#registration">Register Now</Link>
            </Button>
            <button
              className={cn(
                "inline-flex size-10 items-center justify-center rounded-lg text-white transition-colors xl:hidden"
              )}
              onClick={() => setOpen((o) => !o)}
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
            >
              {open ? <X className="size-6" /> : <Menu className="size-6" />}
            </button>
          </div>
        </nav>
      </motion.header>

      {/* Mobile drawer */}
      <motion.div
        initial={false}
        animate={open ? { opacity: 1, pointerEvents: "auto" } : { opacity: 0, pointerEvents: "none" }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm xl:hidden"
        onClick={() => setOpen(false)}
      />
      <motion.aside
        initial={false}
        animate={open ? { x: 0 } : { x: "100%" }}
        transition={{ type: "spring", damping: 28, stiffness: 240 }}
        className="fixed right-0 top-0 z-50 flex h-dvh w-[82%] max-w-sm flex-col bg-background shadow-2xl xl:hidden"
      >
        <div className="flex h-16 items-center justify-between border-b px-5">
          <Image src="/assets/logo-icafow.png" alt="" width={120} height={40} className="h-8 w-auto" />
          <button
            onClick={() => setOpen(false)}
            aria-label="Close menu"
            className="inline-flex size-10 items-center justify-center rounded-lg hover:bg-muted"
          >
            <X className="size-6" />
          </button>
        </div>
        <div className="flex items-center gap-2 border-b bg-muted/40 px-5 py-3 text-sm text-muted-foreground">
          <CalendarDays className="size-4 text-primary" />
          {siteConfig.dates.label} · {siteConfig.venue.short}
        </div>
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="block rounded-lg px-4 py-3 text-base font-medium text-foreground/90 transition-colors hover:bg-muted hover:text-primary"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="border-t p-4">
          <Button asChild variant="gradient" size="lg" className="w-full" onClick={() => setOpen(false)}>
            <Link href="#registration">Register Now</Link>
          </Button>
        </div>
      </motion.aside>
    </>
  );
}
