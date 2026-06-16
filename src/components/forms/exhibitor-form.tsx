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
import { booths, type BoothId } from "@/lib/content/booths";
import { exhibitorSchema, type ExhibitorInput } from "@/lib/validations/registration";
import { submitRegistration, startPayment } from "@/lib/client/submit";
import { formatCurrency, cn } from "@/lib/utils";
import { approxTZS } from "@/lib/rate";

export function ExhibitorForm({ initialBooth }: { initialBooth?: string }) {
  const [serverError, setServerError] = React.useState<string | null>(null);
  const defaultBooth = (booths.find((b) => b.id === initialBooth)?.id ?? "innovation") as BoothId;

  const { register, handleSubmit, watch, control, formState: { errors, isSubmitting } } = useForm<ExhibitorInput>({
    resolver: zodResolver(exhibitorSchema),
    defaultValues: { boothId: defaultBooth, country: "" },
  });

  const boothId = watch("boothId");
  const selected = booths.find((b) => b.id === boothId)!;

  async function onSubmit(data: ExhibitorInput) {
    setServerError(null);
    try {
      const { reference, requiresPayment } = await submitRegistration("exhibitor", data);
      if (requiresPayment) await startPayment(reference, data.method);
      else window.location.href = `/payment/${reference}`;
    } catch (e) {
      setServerError(e instanceof Error ? e.message : "Something went wrong");
    }
  }

  return (
    <RegisterShell
      eyebrow="Exhibition"
      title="Reserve your exhibition booth"
      description="Showcase your AI solutions to decision-makers across Africa. Complete the form below to secure your booth at ICAFoW 2026."
      summary={
        <Card className="overflow-hidden">
          <div className="bg-brand-gradient p-5 text-white">
            <p className="text-xs uppercase tracking-wide text-white/70">Selected booth</p>
            <p className="mt-1 text-lg font-bold">{selected.name}</p>
            <p className="text-sm text-white/80">{selected.size} shell scheme</p>
          </div>
          <div className="space-y-3 p-5">
            <div className="flex items-baseline justify-between">
              <span className="text-sm text-muted-foreground">Total</span>
              <span className="font-display text-2xl font-extrabold text-primary">
                {formatCurrency(selected.priceUSD)}
              </span>
            </div>
            <p className="text-right text-xs text-muted-foreground">
              TZS {selected.priceTZS.toLocaleString()} · ≈ {approxTZS(selected.priceUSD).toLocaleString()} charged
            </p>
            <ul className="space-y-2 border-t border-border pt-3">
              {selected.features.slice(0, 5).map((f) => (
                <li key={f} className="flex gap-2 text-xs text-muted-foreground">
                  <Check className="mt-0.5 size-3.5 shrink-0 text-secondary" /> {f}
                </li>
              ))}
            </ul>
          </div>
        </Card>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-9" noValidate>
        <ErrorBanner message={serverError} />

        <FormSection step={1} title="Booth package selection">
          <div className="grid gap-3 sm:grid-cols-2">
            {booths.map((b) => (
              <label key={b.id} className={cn(
                "flex cursor-pointer flex-col rounded-xl border p-4 transition-all",
                boothId === b.id ? "border-primary bg-accent/40 ring-1 ring-primary" : "border-input hover:border-primary/40"
              )}>
                <input type="radio" value={b.id} className="sr-only" {...register("boothId")} />
                <span className="font-semibold">{b.name}</span>
                <span className="text-xs text-muted-foreground">{b.size}</span>
                <span className="mt-2 font-display text-lg font-bold text-primary">{formatCurrency(b.priceUSD)}</span>
                <span className="text-xs text-muted-foreground">TZS {b.priceTZS.toLocaleString()}</span>
              </label>
            ))}
          </div>
        </FormSection>

        <FormSection step={2} title="Organization information">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Company / Organization" htmlFor="organization" required error={errors.organization?.message} className="sm:col-span-2">
              <Input id="organization" {...register("organization")} placeholder="Company name" aria-invalid={!!errors.organization} />
            </Field>
            <Field label="Contact Person" htmlFor="contactName" required error={errors.contactName?.message}>
              <Input id="contactName" {...register("contactName")} placeholder="Full name" aria-invalid={!!errors.contactName} />
            </Field>
            <Field label="Job Title" htmlFor="jobTitle" error={errors.jobTitle?.message}>
              <Input id="jobTitle" {...register("jobTitle")} placeholder="e.g. CEO" />
            </Field>
            <Field label="Email" htmlFor="email" required error={errors.email?.message}>
              <Input id="email" type="email" {...register("email")} placeholder="you@example.com" aria-invalid={!!errors.email} />
            </Field>
            <Field label="Phone" htmlFor="phone" required error={errors.phone?.message}>
              <Input id="phone" {...register("phone")} placeholder="+255 712 345 678" aria-invalid={!!errors.phone} />
            </Field>
            <Field label="Country" htmlFor="country" required error={errors.country?.message} className="sm:col-span-2">
              <CountryField control={control} name="country" id="country" invalid={!!errors.country} />
            </Field>
          </div>
        </FormSection>

        <FormSection step={3} title="Organization profile">
          <Field label="Brief description of your organization" htmlFor="profile" required error={errors.profile?.message}>
            <Textarea id="profile" rows={4} {...register("profile")} placeholder="Tell us about your organization (min 20 characters)" aria-invalid={!!errors.profile} />
          </Field>
          <Field label="Products, services, solutions or innovations to exhibit" htmlFor="products" error={errors.products?.message}>
            <Textarea id="products" rows={3} {...register("products")} placeholder="What will you showcase?" />
          </Field>
          <Field label="Company logo URL" htmlFor="logoUrl" error={errors.logoUrl?.message} hint="Paste a link to your logo (PNG, JPG or SVG). File upload available after registration.">
            <Input id="logoUrl" {...register("logoUrl")} placeholder="https://.../logo.png" />
          </Field>
        </FormSection>

        <div className="space-y-3">
          <ConsentRow id="consentInfo" error={errors.consentInfo?.message} register={register("consentInfo")}>
            I confirm that the information provided is accurate.
          </ConsentRow>
          <ConsentRow id="consentTerms" error={errors.consentTerms?.message} register={register("consentTerms")}>
            I agree to the ICAFoW 2026 Exhibition Terms and Conditions.
          </ConsentRow>
        </div>

        <div className="flex items-center justify-between gap-4 border-t border-border pt-6">
          <p className="text-sm text-muted-foreground">
            Total: <span className="font-bold text-primary">{formatCurrency(selected.priceUSD)}</span>
          </p>
          <SubmitButton loading={isSubmitting}>
            Proceed to Payment <ArrowRight className="size-4" />
          </SubmitButton>
        </div>
      </form>
    </RegisterShell>
  );
}
