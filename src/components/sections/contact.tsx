"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { MapPin, Mail, Phone, Clock, Send, CheckCircle2, Loader2 } from "lucide-react";
import { Section, SectionHeading } from "@/components/layout/section";
import { Reveal } from "@/components/motion/reveal";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { FieldError } from "@/components/ui/misc";
import { contactSchema, type ContactInput } from "@/lib/validations/contact";
import { siteConfig } from "@/lib/content/site";

const details = [
  {
    icon: MapPin,
    label: "Address",
    value: `${siteConfig.contact.address} · ${siteConfig.contact.poBox}`,
  },
  {
    icon: Mail,
    label: "Email",
    value: siteConfig.contact.email,
    href: `mailto:${siteConfig.contact.email}`,
  },
  {
    icon: Phone,
    label: "Phone",
    value: siteConfig.contact.phone,
    href: `tel:${siteConfig.contact.phone}`,
  },
  { icon: Clock, label: "Working Hours", value: siteConfig.contact.hours },
];

export function Contact() {
  const [done, setDone] = React.useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactInput>({ resolver: zodResolver(contactSchema) });

  async function onSubmit(data: ContactInput) {
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        setDone(true);
        reset();
      }
    } catch {
      // swallow; keep form usable
    }
  }

  return (
    <Section id="contact" muted>
      <SectionHeading
        eyebrow="Contact"
        title={<>Let&apos;s <span className="text-gradient-brand">talk</span></>}
        description="Questions about registration, sponsorship, exhibition or papers? Our team is here to help."
      />

      <Reveal>
        <Card className="overflow-hidden p-0 shadow-xl">
          <div className="grid lg:grid-cols-[0.9fr_1.1fr]">
            {/* ── Info rail ────────────────────────────────── */}
            <div className="relative overflow-hidden bg-brand-gradient p-8 text-white sm:p-10">
              {/* decorative glows */}
              <div className="pointer-events-none absolute -right-16 -top-16 size-52 rounded-full bg-white/10 blur-2xl" />
              <div className="pointer-events-none absolute -bottom-20 -left-12 size-52 rounded-full bg-white/10 blur-3xl" />

              <div className="relative">
                <h3 className="text-2xl font-bold">Our Contact Info</h3>
                <p className="mt-2 max-w-sm text-sm leading-relaxed text-white/80">
                  {siteConfig.contact.organization}. Reach out through any of the
                  channels below — we typically respond within one business day.
                </p>

                <ul className="mt-8 space-y-5">
                  {details.map((d) => (
                    <li key={d.label} className="flex items-start gap-4">
                      <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/25">
                        <d.icon className="size-5" />
                      </span>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold uppercase tracking-wider text-white/60">
                          {d.label}
                        </p>
                        {d.href ? (
                          <a
                            href={d.href}
                            className="break-words font-medium leading-snug text-white underline-offset-4 hover:underline"
                          >
                            {d.value}
                          </a>
                        ) : (
                          <p className="font-medium leading-snug text-white/95">{d.value}</p>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* ── Form ─────────────────────────────────────── */}
            <div className="p-8 sm:p-10">
              {done ? (
                <div className="flex h-full flex-col items-center justify-center gap-3 py-12 text-center">
                  <CheckCircle2 className="size-14 text-secondary" />
                  <h3 className="text-xl font-bold">Message sent!</h3>
                  <p className="max-w-sm text-muted-foreground">
                    Thank you for reaching out. Our team will get back to you shortly.
                  </p>
                  <Button variant="outline" onClick={() => setDone(false)}>
                    Send another message
                  </Button>
                </div>
              ) : (
                <>
                  <div className="mb-6">
                    <h3 className="text-xl font-bold sm:text-2xl">Send us a message</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Fill in the form and we&apos;ll be in touch shortly.
                    </p>
                  </div>

                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <Label htmlFor="c-name" required>Full Name</Label>
                        <Input id="c-name" className="mt-1.5" aria-invalid={!!errors.name} {...register("name")} placeholder="Your name" />
                        <FieldError message={errors.name?.message} />
                      </div>
                      <div>
                        <Label htmlFor="c-email" required>Email</Label>
                        <Input id="c-email" type="email" className="mt-1.5" aria-invalid={!!errors.email} {...register("email")} placeholder="you@example.com" />
                        <FieldError message={errors.email?.message} />
                      </div>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <Label htmlFor="c-phone">Phone Number</Label>
                        <Input id="c-phone" type="tel" className="mt-1.5" aria-invalid={!!errors.phone} {...register("phone")} placeholder="+255 ..." />
                        <FieldError message={errors.phone?.message} />
                      </div>
                      <div>
                        <Label htmlFor="c-org">Organization</Label>
                        <Input id="c-org" className="mt-1.5" {...register("organization")} placeholder="Company / institution" />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="c-subject" required>Subject</Label>
                      <Input id="c-subject" className="mt-1.5" aria-invalid={!!errors.subject} {...register("subject")} placeholder="How can we help?" />
                      <FieldError message={errors.subject?.message} />
                    </div>
                    <div>
                      <Label htmlFor="c-message" required>Message</Label>
                      <Textarea id="c-message" rows={5} className="mt-1.5" aria-invalid={!!errors.message} {...register("message")} placeholder="Write your message..." />
                      <FieldError message={errors.message?.message} />
                    </div>
                    <Button type="submit" variant="gradient" size="lg" disabled={isSubmitting} className="w-full">
                      {isSubmitting ? <><Loader2 className="size-4 animate-spin" /> Sending...</> : <>Send Message <Send className="size-4" /></>}
                    </Button>
                  </form>
                </>
              )}
            </div>
          </div>

          {/* ── Map (full-width footer) ──────────────────── */}
          <div className="flex items-center gap-2 border-t border-border px-8 py-3 sm:px-10">
            <MapPin className="size-4 text-primary" />
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Find Us Here
            </p>
          </div>
          <iframe
            src={siteConfig.contact.mapEmbedUrl}
            title={`Map to ${siteConfig.contact.organization}`}
            className="h-72 w-full border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
        </Card>
      </Reveal>
    </Section>
  );
}
