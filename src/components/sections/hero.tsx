"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { CalendarDays, MapPin, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AttendeeRegisterButton } from "@/components/forms/register-triggers";
import { Countdown } from "./countdown";
import { useSiteSettings } from "@/components/site-provider";

export function Hero() {
  const siteConfig = useSiteSettings();
  
  return (
    <section
      id="hero"
      className="relative flex min-h-dvh items-center overflow-hidden bg-brand-gradient pt-20 text-white"
    >
      {/* Background conference video (the section's bg-brand-gradient shows as
          the fallback before load, on error, and for reduced-motion users). */}
      <video
        className="absolute inset-0 size-full object-cover motion-reduce:hidden"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        poster="/assets/hero-poster.jpg"
        aria-hidden
      >
        <source src="/assets/hero.mp4" type="video/mp4" />
      </video>

      {/* Brand-tinted + contrast overlays so the white text stays legible. */}
      <div className="absolute inset-0 bg-maroon-dark/55 mix-blend-multiply" aria-hidden />
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/65" aria-hidden />
      <div className="absolute inset-0 bg-mesh opacity-30" aria-hidden />

      <div className="container-edge relative z-10 py-16 lg:py-24">
        <div className="mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm font-medium backdrop-blur-sm"
          >
            <Sparkles className="size-4 text-gold" />
            Hosted by {siteConfig.hostShort} · Pan-African AI Conference
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.05 }}
            className="text-balance text-4xl font-extrabold leading-[1.05] sm:text-6xl lg:text-7xl"
          >
            AI &amp; the Future
            <br />
            of Work
            <span className="block bg-gradient-to-r from-white via-gold to-green-light bg-clip-text text-transparent">
              Reimagined for Africa
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="mx-auto mt-6 max-w-2xl text-pretty text-base text-white/80 sm:text-lg"
          >
            Join 1,000+ leaders, researchers and innovators at the International
            Conference on AI &amp; the Future of Work, exploring how artificial
            intelligence is transforming industries, economies and societies.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="mt-7 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm font-medium text-white/90"
          >
            <span className="inline-flex items-center gap-2">
              <CalendarDays className="size-4 text-gold" /> {siteConfig.dates.label}
            </span>
            <span className="inline-flex items-center gap-2">
              <MapPin className="size-4 text-gold" /> {siteConfig.venue.short}, {siteConfig.venue.city}, {siteConfig.venue.country}
            </span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row"
          >
            <Button asChild variant="white" size="xl" className="w-full sm:w-auto">
              <Link href="#registration">
                Register Now <ArrowRight className="size-4" />
              </Link>
            </Button>
            <AttendeeRegisterButton
              initialPass="researcher"
              size="xl"
              variant="outline"
              className="w-full border-white/30 bg-white/5 text-white hover:bg-white/15 hover:text-white sm:w-auto"
            >
              Submit a Paper
            </AttendeeRegisterButton>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.45 }}
            className="mt-12 flex flex-col items-center gap-3"
          >
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-white/60">
              Conference begins in
            </span>
            <Countdown light />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
