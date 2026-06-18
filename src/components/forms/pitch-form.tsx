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
import { pitchSchema, type PitchInput } from "@/lib/validations/registration";
import { submitRegistration } from "@/lib/client/submit";

const stages = [
  { value: "idea", label: "Idea / Concept" },
  { value: "mvp", label: "MVP / Prototype" },
  { value: "early-revenue", label: "Early Revenue" },
  { value: "growth", label: "Growth / Scaling" },
];

import { usePathname } from "next/navigation";

export function PitchDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <FormDialog open={open} onOpenChange={onOpenChange}>
      <PitchForm onClose={() => onOpenChange(false)} />
    </FormDialog>
  );
}

function PitchForm({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");
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
    <ModalForm onSubmit={handleSubmit(onSubmit)}>
      <ModalHeader
        eyebrow={isAdmin ? "Manual Registration" : "Pitch Competition"}
        title={isAdmin ? "Register Pitch on Behalf" : "Apply for the ICAFoW 2026 Pitch Competition"}
        subtitle={isAdmin ? "Fill in the details below to manually register a pitch application." : "Compete for the ICAFoW Future of Work Innovation Award 2026."}
      />
      <ModalBody>
        {reference ? (
          <ApplicationSuccess
            title="Pitch application received!"
            reference={reference}
            message="Thank you for applying to the ICAFoW 2026 Pitch Competition. Shortlisted startups will be notified ahead of the semi-finals."
            onClose={onClose}
          />
        ) : (
          <>
            <ErrorBanner message={serverError} />
            <FormSection step={1} title="Startup details">
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Startup Name" htmlFor="pi-startupName" required error={errors.startupName?.message}>
                  <Input id="pi-startupName" {...register("startupName")} placeholder="Your startup" aria-invalid={!!errors.startupName} />
                </Field>
                <Field label="Website" htmlFor="pi-website" error={errors.website?.message}>
                  <Input id="pi-website" {...register("website")} placeholder="https://example.com" />
                </Field>
                <Field label="Sector" htmlFor="pi-sector" required error={errors.sector?.message}>
                  <Input id="pi-sector" {...register("sector")} placeholder="e.g. HealthTech, FinTech" aria-invalid={!!errors.sector} />
                </Field>
                <Field label="Stage" htmlFor="pi-stage" required error={errors.stage?.message}>
                  <Select id="pi-stage" defaultValue="" {...register("stage")} aria-invalid={!!errors.stage}>
                    <option value="" disabled>Select stage</option>
                    {stages.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </Select>
                </Field>
              </div>
            </FormSection>

            <FormSection step={2} title="Founder details">
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Founder Name" htmlFor="pi-founderName" required error={errors.founderName?.message}>
                  <Input id="pi-founderName" {...register("founderName")} placeholder="Full name" aria-invalid={!!errors.founderName} />
                </Field>
                <Field label="Country" htmlFor="pi-country" required error={errors.country?.message}>
                  <CountryField control={control} name="country" id="pi-country" invalid={!!errors.country} />
                </Field>
                <Field label="Email" htmlFor="pi-email" required error={errors.email?.message}>
                  <Input id="pi-email" type="email" {...register("email")} placeholder="you@example.com" aria-invalid={!!errors.email} />
                </Field>
                <Field label="Phone" htmlFor="pi-phone" required error={errors.phone?.message}>
                  <Input id="pi-phone" {...register("phone")} placeholder="+255 712 345 678" aria-invalid={!!errors.phone} />
                </Field>
              </div>
            </FormSection>

            <FormSection step={3} title="Your solution">
              <Field label="Describe your AI solution and impact" htmlFor="pi-pitch" required error={errors.pitch?.message}>
                <Textarea id="pi-pitch" rows={6} {...register("pitch")} placeholder="What problem do you solve, how does AI power it, and what impact have you achieved? (min 50 characters)" aria-invalid={!!errors.pitch} />
              </Field>
            </FormSection>

            <ConsentRow id="pi-consent" error={errors.consent?.message} register={register("consent")}>
              I confirm the information is accurate and agree to the ICAFoW 2026 Pitch Competition rules.
            </ConsentRow>
          </>
        )}
      </ModalBody>
      {!reference && (
        <ModalFooter>
          <span className="text-xs text-muted-foreground">Applications close 30 July 2026.</span>
          <SubmitButton loading={isSubmitting}>
            Submit <ArrowRight className="size-4" />
          </SubmitButton>
        </ModalFooter>
      )}
    </ModalForm>
  );
}
