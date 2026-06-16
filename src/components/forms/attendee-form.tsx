"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Field, FormSection } from "@/components/forms/field";
import { CountryField, ConsentRow, ErrorBanner, SubmitButton } from "@/components/forms/shared";
import { RegisterShell } from "@/components/forms/register-shell";
import { passes, type PassId } from "@/lib/content/passes";
import { tracks } from "@/lib/content/tracks";
import { attendeeSchema, type AttendeeInput } from "@/lib/validations/registration";
import { submitRegistration, startPayment } from "@/lib/client/submit";
import { formatCurrency, cn } from "@/lib/utils";
import { approxTZS } from "@/lib/rate";

export function AttendeeForm({ initialPass }: { initialPass?: string }) {
  const [serverError, setServerError] = React.useState<string | null>(null);
  const defaultPass = (passes.find((p) => p.id === initialPass)?.id ?? "delegate") as PassId;

  const form = useForm<AttendeeInput>({
    resolver: zodResolver(attendeeSchema),
    defaultValues: { passId: defaultPass, country: "" },
  });
  const { register, handleSubmit, watch, control, formState: { errors, isSubmitting } } = form;

  const passId = watch("passId");
  const selected = passes.find((p) => p.id === passId)!;
  const isResearcher = passId === "researcher";

  async function onSubmit(data: AttendeeInput) {
    setServerError(null);
    try {
      const { reference, requiresPayment } = await submitRegistration("attendee", data);
      if (requiresPayment) {
        await startPayment(reference, data.method);
      } else {
        window.location.href = `/payment/${reference}`;
      }
    } catch (e) {
      setServerError(e instanceof Error ? e.message : "Something went wrong");
    }
  }

  const tzs = approxTZS(selected.priceUSD);

  return (
    <RegisterShell
      eyebrow="Attendee / Author Registration"
      title="Register for ICAFoW 2026"
      description="Select your pass, tell us about yourself, and complete payment securely. Researchers can submit a paper for publication in IJAIT."
      summary={
        <Card className="overflow-hidden">
          <div className="bg-brand-gradient p-5 text-white">
            <p className="text-xs uppercase tracking-wide text-white/70">Your selection</p>
            <p className="mt-1 text-lg font-bold">{selected.name}</p>
            <p className="text-sm text-white/80">{selected.subtitle}</p>
          </div>
          <div className="space-y-3 p-5">
            <div className="flex items-baseline justify-between">
              <span className="text-sm text-muted-foreground">Total</span>
              <span className="font-display text-3xl font-extrabold text-primary">
                {formatCurrency(selected.priceUSD)}
              </span>
            </div>
            <p className="text-right text-xs text-muted-foreground">
              ≈ TZS {tzs.toLocaleString()} charged via Selcom
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

        {/* Pass selection */}
        <FormSection step={1} title="Select your pass">
          <div className="grid gap-3 sm:grid-cols-2">
            {passes.map((p) => (
              <label
                key={p.id}
                className={cn(
                  "relative flex cursor-pointer flex-col rounded-xl border p-4 transition-all",
                  passId === p.id ? "border-primary bg-accent/40 ring-1 ring-primary" : "border-input hover:border-primary/40"
                )}
              >
                <input type="radio" value={p.id} className="sr-only" {...register("passId")} />
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold">{p.name}</span>
                  {p.badge && <Badge variant={p.highlight ? "green" : "soft"}>{p.badge}</Badge>}
                </div>
                <span className="mt-0.5 text-xs text-muted-foreground">{p.subtitle}</span>
                <span className="mt-2 font-display text-xl font-bold text-primary">
                  {formatCurrency(p.priceUSD)}
                </span>
              </label>
            ))}
          </div>
        </FormSection>

        {/* Personal details */}
        <FormSection step={2} title="Your details">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Full Name" htmlFor="fullName" required error={errors.fullName?.message}>
              <Input id="fullName" {...register("fullName")} placeholder="Jane Doe" aria-invalid={!!errors.fullName} />
            </Field>
            <Field label="Email" htmlFor="email" required error={errors.email?.message}>
              <Input id="email" type="email" {...register("email")} placeholder="you@example.com" aria-invalid={!!errors.email} />
            </Field>
            <Field label="Phone" htmlFor="phone" required error={errors.phone?.message} hint="Used for mobile-money payment (e.g. 0712 345 678).">
              <Input id="phone" {...register("phone")} placeholder="+255 712 345 678" aria-invalid={!!errors.phone} />
            </Field>
            <Field label="Country" htmlFor="country" required error={errors.country?.message}>
              <CountryField control={control} name="country" id="country" invalid={!!errors.country} />
            </Field>
            <Field label="Organization" htmlFor="organization" error={errors.organization?.message}>
              <Input id="organization" {...register("organization")} placeholder="Company / institution" />
            </Field>
            <Field label="Job Title" htmlFor="jobTitle" error={errors.jobTitle?.message}>
              <Input id="jobTitle" {...register("jobTitle")} placeholder="e.g. Data Scientist" />
            </Field>
            <Field label="Dietary requirements" htmlFor="dietary" className="sm:col-span-2" error={errors.dietary?.message}>
              <Input id="dietary" {...register("dietary")} placeholder="Optional — e.g. vegetarian, allergies" />
            </Field>
          </div>
        </FormSection>

        {/* Paper (researcher only) */}
        {isResearcher && (
          <FormSection step={3} title="Paper submission" description="Required for the Researcher Pass. Accepted papers are published in IJAIT.">
            <div className="grid gap-5">
              <Field label="Paper Title" htmlFor="paperTitle" required error={errors.paperTitle?.message}>
                <Input id="paperTitle" {...register("paperTitle")} placeholder="Title of your paper" aria-invalid={!!errors.paperTitle} />
              </Field>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Track" htmlFor="paperTrack" required error={errors.paperTrack?.message}>
                  <Select id="paperTrack" defaultValue="" {...register("paperTrack")} aria-invalid={!!errors.paperTrack}>
                    <option value="" disabled>Select a track</option>
                    {tracks.map((t) => <option key={t.id} value={t.title}>{t.title}</option>)}
                  </Select>
                </Field>
                <Field label="Keywords" htmlFor="paperKeywords" error={errors.paperKeywords?.message}>
                  <Input id="paperKeywords" {...register("paperKeywords")} placeholder="comma, separated, keywords" />
                </Field>
              </div>
              <Field label="Abstract" htmlFor="paperAbstract" required error={errors.paperAbstract?.message}>
                <Textarea id="paperAbstract" rows={5} {...register("paperAbstract")} placeholder="Paste your abstract (min 30 characters)" aria-invalid={!!errors.paperAbstract} />
              </Field>
            </div>
          </FormSection>
        )}

        <ConsentRow id="consent" error={errors.consent?.message} register={register("consent")}>
          I confirm the information provided is accurate and I accept the ICAFoW 2026 terms and the refund policy.
        </ConsentRow>

        <div className="flex items-center justify-between gap-4 border-t border-border pt-6">
          <p className="text-sm text-muted-foreground">
            Total due: <span className="font-bold text-primary">{formatCurrency(selected.priceUSD)}</span>
          </p>
          <SubmitButton loading={isSubmitting}>
            Proceed to Payment <ArrowRight className="size-4" />
          </SubmitButton>
        </div>
      </form>
    </RegisterShell>
  );
}
