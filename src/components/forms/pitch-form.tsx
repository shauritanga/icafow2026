"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Trophy } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Field, FormSection } from "@/components/forms/field";
import { CountryField, ConsentRow, ErrorBanner, SubmitButton } from "@/components/forms/shared";
import { RegisterShell } from "@/components/forms/register-shell";
import { ApplicationSuccess } from "@/components/forms/application-success";
import { pitchSchema, type PitchInput } from "@/lib/validations/registration";
import { submitRegistration } from "@/lib/client/submit";
import { pitchTimeline } from "@/lib/content/dates";

const stages = [
  { value: "idea", label: "Idea / Concept" },
  { value: "mvp", label: "MVP / Prototype" },
  { value: "early-revenue", label: "Early Revenue" },
  { value: "growth", label: "Growth / Scaling" },
];

export function PitchForm() {
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [reference, setReference] = React.useState<string | null>(null);

  const { register, handleSubmit, control, formState: { errors, isSubmitting } } = useForm<PitchInput>({
    resolver: zodResolver(pitchSchema),
    defaultValues: { country: "", stage: undefined },
  });

  async function onSubmit(data: PitchInput) {
    setServerError(null);
    try {
      const { reference } = await submitRegistration("pitch", data);
      setReference(reference);
    } catch (e) {
      setServerError(e instanceof Error ? e.message : "Something went wrong");
    }
  }

  return (
    <RegisterShell
      eyebrow="Pitch Competition"
      title="Apply for the ICAFoW 2026 Pitch Competition"
      description="Showcase your AI startup before investors, industry leaders and an international audience. Compete for the ICAFoW Future of Work Innovation Award 2026."
      summary={
        <Card className="overflow-hidden">
          <div className="bg-brand-gradient p-5 text-white">
            <Trophy className="size-7 text-gold" />
            <h3 className="mt-2 text-lg font-bold">Competition timeline</h3>
          </div>
          <ul className="space-y-3 p-5">
            {pitchTimeline.map((d) => (
              <li key={d.title} className="flex flex-col">
                <Badge variant="maroonSoft" className="w-fit">{d.date}</Badge>
                <span className="mt-1 text-sm font-medium">{d.title}</span>
              </li>
            ))}
          </ul>
        </Card>
      }
    >
      {reference ? (
        <ApplicationSuccess
          title="Pitch application received!"
          reference={reference}
          message="Thank you for applying to the ICAFoW 2026 Pitch Competition. Shortlisted startups will be notified ahead of the semi-finals."
        />
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-9" noValidate>
          <ErrorBanner message={serverError} />
          <FormSection step={1} title="Startup details">
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Startup Name" htmlFor="startupName" required error={errors.startupName?.message}>
                <Input id="startupName" {...register("startupName")} placeholder="Your startup" aria-invalid={!!errors.startupName} />
              </Field>
              <Field label="Website" htmlFor="website" error={errors.website?.message}>
                <Input id="website" {...register("website")} placeholder="https://example.com" />
              </Field>
              <Field label="Sector" htmlFor="sector" required error={errors.sector?.message}>
                <Input id="sector" {...register("sector")} placeholder="e.g. HealthTech, FinTech" aria-invalid={!!errors.sector} />
              </Field>
              <Field label="Stage" htmlFor="stage" required error={errors.stage?.message}>
                <Select id="stage" defaultValue="" {...register("stage")} aria-invalid={!!errors.stage}>
                  <option value="" disabled>Select stage</option>
                  {stages.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                </Select>
              </Field>
            </div>
          </FormSection>

          <FormSection step={2} title="Founder details">
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Founder Name" htmlFor="founderName" required error={errors.founderName?.message}>
                <Input id="founderName" {...register("founderName")} placeholder="Full name" aria-invalid={!!errors.founderName} />
              </Field>
              <Field label="Country" htmlFor="country" required error={errors.country?.message}>
                <CountryField control={control} name="country" id="country" invalid={!!errors.country} />
              </Field>
              <Field label="Email" htmlFor="email" required error={errors.email?.message}>
                <Input id="email" type="email" {...register("email")} placeholder="you@example.com" aria-invalid={!!errors.email} />
              </Field>
              <Field label="Phone" htmlFor="phone" required error={errors.phone?.message}>
                <Input id="phone" {...register("phone")} placeholder="+255 712 345 678" aria-invalid={!!errors.phone} />
              </Field>
            </div>
          </FormSection>

          <FormSection step={3} title="Your solution">
            <Field label="Describe your AI solution and impact" htmlFor="pitch" required error={errors.pitch?.message}>
              <Textarea id="pitch" rows={6} {...register("pitch")} placeholder="What problem do you solve, how does AI power it, and what impact have you achieved? (min 50 characters)" aria-invalid={!!errors.pitch} />
            </Field>
          </FormSection>

          <ConsentRow id="consent" error={errors.consent?.message} register={register("consent")}>
            I confirm the information is accurate and agree to the ICAFoW 2026 Pitch Competition rules.
          </ConsentRow>

          <div className="flex justify-end border-t border-border pt-6">
            <SubmitButton loading={isSubmitting}>
              Submit Pitch Application <ArrowRight className="size-4" />
            </SubmitButton>
          </div>
        </form>
      )}
    </RegisterShell>
  );
}
