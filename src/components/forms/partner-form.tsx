"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Field, FormSection } from "@/components/forms/field";
import { ConsentRow, ErrorBanner, SubmitButton } from "@/components/forms/shared";
import { RegisterShell } from "@/components/forms/register-shell";
import { ApplicationSuccess } from "@/components/forms/application-success";
import { partnerSchema, type PartnerInput } from "@/lib/validations/registration";
import { submitRegistration } from "@/lib/client/submit";
import { partnerReasons } from "@/lib/content/partners";

export function PartnerForm() {
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [reference, setReference] = React.useState<string | null>(null);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<PartnerInput>({
    resolver: zodResolver(partnerSchema),
  });

  async function onSubmit(data: PartnerInput) {
    setServerError(null);
    try {
      const { reference } = await submitRegistration("partner", data);
      setReference(reference);
    } catch (e) {
      setServerError(e instanceof Error ? e.message : "Something went wrong");
    }
  }

  return (
    <RegisterShell
      eyebrow="Partnership"
      title="Partner with ICAFoW 2026"
      description="Join the movement shaping Africa's AI-powered future. Submit your partnership application and our team will be in touch."
      summary={
        <Card className="bg-brand-gradient p-6 text-white">
          <h3 className="text-lg font-bold">Why partner?</h3>
          <ul className="mt-4 space-y-2.5">
            {partnerReasons.map((r) => (
              <li key={r} className="flex gap-2 text-sm text-white/90">
                <Check className="mt-0.5 size-4 shrink-0 text-gold" /> {r}
              </li>
            ))}
          </ul>
        </Card>
      }
    >
      {reference ? (
        <ApplicationSuccess
          title="Partnership application received!"
          reference={reference}
          message="Thank you for your interest in partnering with ICAFoW 2026. Our partnerships team will review your application and reach out shortly."
        />
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-9" noValidate>
          <ErrorBanner message={serverError} />
          <FormSection step={1} title="Your details">
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Full Name" htmlFor="fullName" required error={errors.fullName?.message}>
                <Input id="fullName" {...register("fullName")} placeholder="Full name" aria-invalid={!!errors.fullName} />
              </Field>
              <Field label="Job Title / Position" htmlFor="jobTitle" error={errors.jobTitle?.message}>
                <Input id="jobTitle" {...register("jobTitle")} placeholder="e.g. Director" />
              </Field>
              <Field label="Organization / Institution" htmlFor="organization" required error={errors.organization?.message}>
                <Input id="organization" {...register("organization")} placeholder="Organization name" aria-invalid={!!errors.organization} />
              </Field>
              <Field label="Email" htmlFor="email" required error={errors.email?.message}>
                <Input id="email" type="email" {...register("email")} placeholder="you@example.com" aria-invalid={!!errors.email} />
              </Field>
              <Field label="Phone" htmlFor="phone" required error={errors.phone?.message}>
                <Input id="phone" {...register("phone")} placeholder="+255 712 345 678" aria-invalid={!!errors.phone} />
              </Field>
              <Field label="Logo URL" htmlFor="logoUrl" error={errors.logoUrl?.message} hint="Link to your logo (PNG, JPG or SVG).">
                <Input id="logoUrl" {...register("logoUrl")} placeholder="https://.../logo.png" />
              </Field>
            </div>
          </FormSection>

          <FormSection step={2} title="Why partner with ICAFoW 2026?">
            <Field label="Brief summary" htmlFor="summary" required error={errors.summary?.message}>
              <Textarea id="summary" rows={5} {...register("summary")} placeholder="Tell us about your organization and why you'd like to partner (min 20 characters)" aria-invalid={!!errors.summary} />
            </Field>
          </FormSection>

          <ConsentRow id="consent" error={errors.consent?.message} register={register("consent")}>
            I confirm the information provided is accurate and authorize ICAFoW 2026 to contact me regarding partnership opportunities.
          </ConsentRow>

          <div className="flex justify-end border-t border-border pt-6">
            <SubmitButton loading={isSubmitting}>
              Submit Partnership Application <ArrowRight className="size-4" />
            </SubmitButton>
          </div>
        </form>
      )}
    </RegisterShell>
  );
}
