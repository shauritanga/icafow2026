"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field, FormSection } from "@/components/forms/field";
import { CountryField, ConsentRow, ErrorBanner, SubmitButton } from "@/components/forms/shared";
import {
  FormDialog,
  ModalForm,
  ModalHeader,
  ModalBody,
  ModalFooter,
  SelectedSummary,
} from "@/components/forms/modal-form";
import { sponsorTiers, type SponsorTierId } from "@/lib/content/sponsors";
import { sponsorSchema, type SponsorInput } from "@/lib/validations/registration";
import { submitRegistration, startPayment } from "@/lib/client/submit";
import { formatCurrency, cn } from "@/lib/utils";

export function SponsorDialog({
  open,
  onOpenChange,
  initialTier,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialTier?: string;
}) {
  return (
    <FormDialog open={open} onOpenChange={onOpenChange}>
      <SponsorForm initialTier={initialTier} />
    </FormDialog>
  );
}

function SponsorForm({ initialTier }: { initialTier?: string }) {
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
    <ModalForm onSubmit={handleSubmit(onSubmit)}>
      <ModalHeader
        eyebrow="Sponsorship"
        title="Become an ICAFoW 2026 Sponsor"
        subtitle="Position your organization at the forefront of Africa's AI revolution."
      />
      <ModalBody>
        <ErrorBanner message={serverError} />

        {initialTier ? (
          <>
            <SelectedSummary
              label="Selected tier"
              name={selected.name}
              price={negotiated ? "By negotiation" : formatCurrency(selected.priceUSD!)}
            />
            <input type="hidden" {...register("tierId")} />
          </>
        ) : (
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
        )}

        <FormSection step={initialTier ? 1 : 2} title="Organization details">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Organization" htmlFor="so-organization" required error={errors.organization?.message} className="sm:col-span-2">
              <Input id="so-organization" {...register("organization")} placeholder="Organization name" aria-invalid={!!errors.organization} />
            </Field>
            <Field label="Website" htmlFor="so-website" error={errors.website?.message}>
              <Input id="so-website" {...register("website")} placeholder="https://example.com" />
            </Field>
            <Field label="Country" htmlFor="so-country" required error={errors.country?.message}>
              <CountryField control={control} name="country" id="so-country" invalid={!!errors.country} />
            </Field>
            <Field label="Contact Name" htmlFor="so-contactName" required error={errors.contactName?.message}>
              <Input id="so-contactName" {...register("contactName")} placeholder="Full name" aria-invalid={!!errors.contactName} />
            </Field>
            <Field label="Job Title" htmlFor="so-jobTitle" error={errors.jobTitle?.message}>
              <Input id="so-jobTitle" {...register("jobTitle")} placeholder="e.g. Marketing Director" />
            </Field>
            <Field label="Email" htmlFor="so-email" required error={errors.email?.message}>
              <Input id="so-email" type="email" {...register("email")} placeholder="you@example.com" aria-invalid={!!errors.email} />
            </Field>
            <Field label="Phone" htmlFor="so-phone" required error={errors.phone?.message}>
              <Input id="so-phone" {...register("phone")} placeholder="+255 712 345 678" aria-invalid={!!errors.phone} />
            </Field>
            <Field label="Sponsorship objectives" htmlFor="so-objectives" className="sm:col-span-2" error={errors.objectives?.message}>
              <Textarea id="so-objectives" rows={4} {...register("objectives")} placeholder="What do you hope to achieve as a sponsor? (optional)" />
            </Field>
          </div>
        </FormSection>

        <ConsentRow id="so-consent" error={errors.consent?.message} register={register("consent")}>
          I confirm the information provided is accurate and authorize ICAFoW 2026 to contact me regarding this sponsorship.
        </ConsentRow>
      </ModalBody>
      <ModalFooter>
        <span className="text-xs text-muted-foreground">
          {negotiated ? "Our team will confirm your package." : "Secure payment via Selcom."}
        </span>
        <SubmitButton loading={isSubmitting}>
          {negotiated ? "Submit Request" : "Proceed to Payment"} <ArrowRight className="size-4" />
        </SubmitButton>
      </ModalFooter>
    </ModalForm>
  );
}
