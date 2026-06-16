"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Field, FormSection } from "@/components/forms/field";
import { CountryField, ConsentRow, ErrorBanner, SubmitButton } from "@/components/forms/shared";
import { RegisterShell } from "@/components/forms/register-shell";
import { sponsorTiers, type SponsorTierId } from "@/lib/content/sponsors";
import { sponsorSchema, type SponsorInput } from "@/lib/validations/registration";
import { submitRegistration, startPayment } from "@/lib/client/submit";
import { formatCurrency, cn } from "@/lib/utils";

export function SponsorForm({ initialTier }: { initialTier?: string }) {
  const [serverError, setServerError] = React.useState<string | null>(null);
  const defaultTier = (sponsorTiers.find((t) => t.id === initialTier)?.id ?? "platinum") as SponsorTierId;

  const { register, handleSubmit, watch, control, formState: { errors, isSubmitting } } = useForm<SponsorInput>({
    resolver: zodResolver(sponsorSchema),
    defaultValues: { tierId: defaultTier, country: "" },
  });

  const tierId = watch("tierId");
  const selected = sponsorTiers.find((t) => t.id === tierId)!;
  const negotiated = selected.priceUSD == null;

  async function onSubmit(data: SponsorInput) {
    setServerError(null);
    try {
      const { reference, requiresPayment } = await submitRegistration("sponsor", data);
      if (requiresPayment) await startPayment(reference, data.method);
      else window.location.href = `/payment/${reference}`;
    } catch (e) {
      setServerError(e instanceof Error ? e.message : "Something went wrong");
    }
  }

  return (
    <RegisterShell
      eyebrow="Sponsorship"
      title="Become an ICAFoW 2026 Sponsor"
      description="Position your organization at the forefront of Africa's AI revolution. Select a tier and our team will confirm your benefits and branding."
      summary={
        <Card className="overflow-hidden">
          <div className="bg-brand-gradient p-5 text-white">
            <p className="text-xs uppercase tracking-wide text-white/70">Selected tier</p>
            <p className="mt-1 text-lg font-bold">{selected.name}</p>
          </div>
          <div className="space-y-3 p-5">
            <div className="flex items-baseline justify-between">
              <span className="text-sm text-muted-foreground">Investment</span>
              <span className="font-display text-2xl font-extrabold text-primary">
                {negotiated ? "By negotiation" : formatCurrency(selected.priceUSD!)}
              </span>
            </div>
            <ul className="space-y-2 border-t border-border pt-3">
              {selected.benefits.slice(0, 5).map((b) => (
                <li key={b} className="flex gap-2 text-xs text-muted-foreground">
                  <Check className="mt-0.5 size-3.5 shrink-0 text-secondary" /> {b}
                </li>
              ))}
            </ul>
          </div>
        </Card>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-9" noValidate>
        <ErrorBanner message={serverError} />

        <FormSection step={1} title="Choose a sponsorship tier">
          <div className="grid gap-3 sm:grid-cols-2">
            {sponsorTiers.map((t) => (
              <label key={t.id} className={cn(
                "flex cursor-pointer flex-col rounded-xl border p-4 transition-all",
                tierId === t.id ? "border-primary bg-accent/40 ring-1 ring-primary" : "border-input hover:border-primary/40"
              )}>
                <input type="radio" value={t.id} className="sr-only" {...register("tierId")} />
                <span className="font-semibold">{t.name}</span>
                <span className="mt-1 font-display text-lg font-bold text-primary">
                  {t.priceUSD == null ? "By negotiation" : formatCurrency(t.priceUSD)}
                </span>
              </label>
            ))}
          </div>
        </FormSection>

        <FormSection step={2} title="Organization details">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Organization" htmlFor="organization" required error={errors.organization?.message} className="sm:col-span-2">
              <Input id="organization" {...register("organization")} placeholder="Organization name" aria-invalid={!!errors.organization} />
            </Field>
            <Field label="Website" htmlFor="website" error={errors.website?.message}>
              <Input id="website" {...register("website")} placeholder="https://example.com" />
            </Field>
            <Field label="Country" htmlFor="country" required error={errors.country?.message}>
              <CountryField control={control} name="country" id="country" invalid={!!errors.country} />
            </Field>
            <Field label="Contact Name" htmlFor="contactName" required error={errors.contactName?.message}>
              <Input id="contactName" {...register("contactName")} placeholder="Full name" aria-invalid={!!errors.contactName} />
            </Field>
            <Field label="Job Title" htmlFor="jobTitle" error={errors.jobTitle?.message}>
              <Input id="jobTitle" {...register("jobTitle")} placeholder="e.g. Marketing Director" />
            </Field>
            <Field label="Email" htmlFor="email" required error={errors.email?.message}>
              <Input id="email" type="email" {...register("email")} placeholder="you@example.com" aria-invalid={!!errors.email} />
            </Field>
            <Field label="Phone" htmlFor="phone" required error={errors.phone?.message}>
              <Input id="phone" {...register("phone")} placeholder="+255 712 345 678" aria-invalid={!!errors.phone} />
            </Field>
            <Field label="Sponsorship objectives" htmlFor="objectives" className="sm:col-span-2" error={errors.objectives?.message}>
              <Textarea id="objectives" rows={4} {...register("objectives")} placeholder="What do you hope to achieve as a sponsor? (optional)" />
            </Field>
          </div>
        </FormSection>

        <ConsentRow id="consent" error={errors.consent?.message} register={register("consent")}>
          I confirm the information provided is accurate and authorize ICAFoW 2026 to contact me regarding this sponsorship.
        </ConsentRow>

        <div className="flex items-center justify-end border-t border-border pt-6">
          <SubmitButton loading={isSubmitting}>
            {negotiated ? "Submit Sponsorship Request" : "Proceed to Payment"} <ArrowRight className="size-4" />
          </SubmitButton>
        </div>
      </form>
    </RegisterShell>
  );
}
