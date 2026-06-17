"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Field, FormSection } from "@/components/forms/field";
import { CountryField, ConsentRow, ErrorBanner, SubmitButton } from "@/components/forms/shared";
import { ApplicationSuccess } from "@/components/forms/application-success";
import {
  FormDialog,
  ModalForm,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@/components/forms/modal-form";
import { speakerSchema, type SpeakerInput } from "@/lib/validations/registration";
import { submitRegistration } from "@/lib/client/submit";
import { tracks } from "@/lib/content/tracks";

export function SpeakerDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <FormDialog open={open} onOpenChange={onOpenChange}>
      <SpeakerForm onClose={() => onOpenChange(false)} />
    </FormDialog>
  );
}

function SpeakerForm({ onClose }: { onClose?: () => void }) {
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
    <ModalForm onSubmit={handleSubmit(onSubmit)}>
      <ModalHeader
        eyebrow="Call for Speakers"
        title="Apply to speak at ICAFoW 2026"
        subtitle="Share your expertise with an international audience of leaders, researchers and innovators."
      />
      <ModalBody>
        {reference ? (
          <ApplicationSuccess
            title="Speaker application received!"
            reference={reference}
            message="Thank you for applying to speak at ICAFoW 2026. Our programme committee will review your proposal and get back to you."
            onClose={onClose}
          />
        ) : (
          <>
            <ErrorBanner message={serverError} />
            <FormSection step={1} title="About you">
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Full Name" htmlFor="sp-fullName" required error={errors.fullName?.message}>
                  <Input id="sp-fullName" {...register("fullName")} placeholder="Full name" aria-invalid={!!errors.fullName} />
                </Field>
                <Field label="Email" htmlFor="sp-email" required error={errors.email?.message}>
                  <Input id="sp-email" type="email" {...register("email")} placeholder="you@example.com" aria-invalid={!!errors.email} />
                </Field>
                <Field label="Phone" htmlFor="sp-phone" required error={errors.phone?.message}>
                  <Input id="sp-phone" {...register("phone")} placeholder="+255 712 345 678" aria-invalid={!!errors.phone} />
                </Field>
                <Field label="Country" htmlFor="sp-country" required error={errors.country?.message}>
                  <CountryField control={control} name="country" id="sp-country" invalid={!!errors.country} />
                </Field>
                <Field label="Job Title" htmlFor="sp-jobTitle" required error={errors.jobTitle?.message}>
                  <Input id="sp-jobTitle" {...register("jobTitle")} placeholder="e.g. Chief AI Officer" aria-invalid={!!errors.jobTitle} />
                </Field>
                <Field label="Organization" htmlFor="sp-organization" required error={errors.organization?.message}>
                  <Input id="sp-organization" {...register("organization")} placeholder="Organization" aria-invalid={!!errors.organization} />
                </Field>
                <Field label="LinkedIn / Profile URL" htmlFor="sp-linkedin" className="sm:col-span-2" error={errors.linkedin?.message}>
                  <Input id="sp-linkedin" {...register("linkedin")} placeholder="https://linkedin.com/in/..." />
                </Field>
              </div>
            </FormSection>

            <FormSection step={2} title="Your proposed talk">
              <Field label="Talk topic / title" htmlFor="sp-topic" required error={errors.topic?.message}>
                <Input id="sp-topic" {...register("topic")} placeholder="Proposed talk title" aria-invalid={!!errors.topic} />
              </Field>
              <Field label="Preferred track" htmlFor="sp-track" error={errors.track?.message}>
                <Select id="sp-track" defaultValue="" {...register("track")}>
                  <option value="">No preference</option>
                  {tracks.map((t) => <option key={t.id} value={t.title}>{t.title}</option>)}
                </Select>
              </Field>
              <Field label="Speaker bio & talk summary" htmlFor="sp-bio" required error={errors.bio?.message}>
                <Textarea id="sp-bio" rows={5} {...register("bio")} placeholder="A short bio and a summary of your proposed talk (min 30 characters)" aria-invalid={!!errors.bio} />
              </Field>
            </FormSection>

            <ConsentRow id="sp-consent" error={errors.consent?.message} register={register("consent")}>
              I confirm the information provided is accurate and consent to being contacted about this application.
            </ConsentRow>
          </>
        )}
      </ModalBody>
      {!reference && (
        <ModalFooter>
          <span className="text-xs text-muted-foreground">Selected speakers receive a complimentary delegate pass.</span>
          <SubmitButton loading={isSubmitting}>
            Submit <ArrowRight className="size-4" />
          </SubmitButton>
        </ModalFooter>
      )}
    </ModalForm>
  );
}
