"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Mic2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Field, FormSection } from "@/components/forms/field";
import { CountryField, ConsentRow, ErrorBanner, SubmitButton } from "@/components/forms/shared";
import { RegisterShell } from "@/components/forms/register-shell";
import { ApplicationSuccess } from "@/components/forms/application-success";
import { speakerSchema, type SpeakerInput } from "@/lib/validations/registration";
import { submitRegistration } from "@/lib/client/submit";
import { tracks } from "@/lib/content/tracks";

export function SpeakerForm() {
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [reference, setReference] = React.useState<string | null>(null);

  const { register, handleSubmit, control, formState: { errors, isSubmitting } } = useForm<SpeakerInput>({
    resolver: zodResolver(speakerSchema),
    defaultValues: { country: "" },
  });

  async function onSubmit(data: SpeakerInput) {
    setServerError(null);
    try {
      const { reference } = await submitRegistration("speaker", data);
      setReference(reference);
    } catch (e) {
      setServerError(e instanceof Error ? e.message : "Something went wrong");
    }
  }

  return (
    <RegisterShell
      eyebrow="Call for Speakers"
      title="Apply to speak at ICAFoW 2026"
      description="Share your expertise on AI and the future of work with an international audience of leaders, researchers and innovators."
      summary={
        <Card className="bg-brand-gradient p-6 text-white">
          <Mic2 className="size-8 text-gold" />
          <h3 className="mt-3 text-lg font-bold">Speak on the ICAFoW stage</h3>
          <p className="mt-2 text-sm text-white/80">
            Selected speakers receive a complimentary delegate pass, speaker recognition and the opportunity to address 1,000+ attendees.
          </p>
        </Card>
      }
    >
      {reference ? (
        <ApplicationSuccess
          title="Speaker application received!"
          reference={reference}
          message="Thank you for applying to speak at ICAFoW 2026. Our programme committee will review your proposal and get back to you."
        />
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-9" noValidate>
          <ErrorBanner message={serverError} />
          <FormSection step={1} title="About you">
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Full Name" htmlFor="fullName" required error={errors.fullName?.message}>
                <Input id="fullName" {...register("fullName")} placeholder="Full name" aria-invalid={!!errors.fullName} />
              </Field>
              <Field label="Email" htmlFor="email" required error={errors.email?.message}>
                <Input id="email" type="email" {...register("email")} placeholder="you@example.com" aria-invalid={!!errors.email} />
              </Field>
              <Field label="Phone" htmlFor="phone" required error={errors.phone?.message}>
                <Input id="phone" {...register("phone")} placeholder="+255 712 345 678" aria-invalid={!!errors.phone} />
              </Field>
              <Field label="Country" htmlFor="country" required error={errors.country?.message}>
                <CountryField control={control} name="country" id="country" invalid={!!errors.country} />
              </Field>
              <Field label="Job Title" htmlFor="jobTitle" required error={errors.jobTitle?.message}>
                <Input id="jobTitle" {...register("jobTitle")} placeholder="e.g. Chief AI Officer" aria-invalid={!!errors.jobTitle} />
              </Field>
              <Field label="Organization" htmlFor="organization" required error={errors.organization?.message}>
                <Input id="organization" {...register("organization")} placeholder="Organization" aria-invalid={!!errors.organization} />
              </Field>
              <Field label="LinkedIn / Profile URL" htmlFor="linkedin" className="sm:col-span-2" error={errors.linkedin?.message}>
                <Input id="linkedin" {...register("linkedin")} placeholder="https://linkedin.com/in/..." />
              </Field>
            </div>
          </FormSection>

          <FormSection step={2} title="Your proposed talk">
            <Field label="Talk topic / title" htmlFor="topic" required error={errors.topic?.message}>
              <Input id="topic" {...register("topic")} placeholder="Proposed talk title" aria-invalid={!!errors.topic} />
            </Field>
            <Field label="Preferred track" htmlFor="track" error={errors.track?.message}>
              <Select id="track" defaultValue="" {...register("track")}>
                <option value="">No preference</option>
                {tracks.map((t) => <option key={t.id} value={t.title}>{t.title}</option>)}
              </Select>
            </Field>
            <Field label="Speaker bio & talk summary" htmlFor="bio" required error={errors.bio?.message}>
              <Textarea id="bio" rows={5} {...register("bio")} placeholder="A short bio and a summary of your proposed talk (min 30 characters)" aria-invalid={!!errors.bio} />
            </Field>
          </FormSection>

          <ConsentRow id="consent" error={errors.consent?.message} register={register("consent")}>
            I confirm the information provided is accurate and consent to being contacted about this application.
          </ConsentRow>

          <div className="flex justify-end border-t border-border pt-6">
            <SubmitButton loading={isSubmitting}>
              Submit Speaker Application <ArrowRight className="size-4" />
            </SubmitButton>
          </div>
        </form>
      )}
    </RegisterShell>
  );
}
