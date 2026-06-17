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
import { booths, type BoothId } from "@/lib/content/booths";
import { exhibitorSchema, type ExhibitorInput } from "@/lib/validations/registration";
import { submitRegistration, startPayment } from "@/lib/client/submit";
import { formatCurrency, cn } from "@/lib/utils";

export function ExhibitorDialog({
  open,
  onOpenChange,
  initialBooth,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialBooth?: string;
}) {
  return (
    <FormDialog open={open} onOpenChange={onOpenChange}>
      <ExhibitorForm initialBooth={initialBooth} />
    </FormDialog>
  );
}

function ExhibitorForm({ initialBooth }: { initialBooth?: string }) {
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
    <ModalForm onSubmit={handleSubmit(onSubmit)}>
      <ModalHeader
        eyebrow="Exhibition"
        title="Reserve your exhibition booth"
        subtitle="Showcase your AI solutions to decision-makers across Africa."
      />
      <ModalBody>
        <ErrorBanner message={serverError} />

        {initialBooth ? (
          <>
            <SelectedSummary
              label="Selected booth"
              name={`${selected.name} · ${selected.size}`}
              price={formatCurrency(selected.priceUSD)}
            />
            <input type="hidden" {...register("boothId")} />
          </>
        ) : (
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
        )}

        <FormSection step={initialBooth ? 1 : 2} title="Organization information">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Company / Organization" htmlFor="ex-organization" required error={errors.organization?.message} className="sm:col-span-2">
              <Input id="ex-organization" {...register("organization")} placeholder="Company name" aria-invalid={!!errors.organization} />
            </Field>
            <Field label="Contact Person" htmlFor="ex-contactName" required error={errors.contactName?.message}>
              <Input id="ex-contactName" {...register("contactName")} placeholder="Full name" aria-invalid={!!errors.contactName} />
            </Field>
            <Field label="Job Title" htmlFor="ex-jobTitle" error={errors.jobTitle?.message}>
              <Input id="ex-jobTitle" {...register("jobTitle")} placeholder="e.g. CEO" />
            </Field>
            <Field label="Email" htmlFor="ex-email" required error={errors.email?.message}>
              <Input id="ex-email" type="email" {...register("email")} placeholder="you@example.com" aria-invalid={!!errors.email} />
            </Field>
            <Field label="Phone" htmlFor="ex-phone" required error={errors.phone?.message}>
              <Input id="ex-phone" {...register("phone")} placeholder="+255 712 345 678" aria-invalid={!!errors.phone} />
            </Field>
            <Field label="Country" htmlFor="ex-country" required error={errors.country?.message} className="sm:col-span-2">
              <CountryField control={control} name="country" id="ex-country" invalid={!!errors.country} />
            </Field>
          </div>
        </FormSection>

        <FormSection step={initialBooth ? 2 : 3} title="Organization profile">
          <Field label="Brief description of your organization" htmlFor="ex-profile" required error={errors.profile?.message}>
            <Textarea id="ex-profile" rows={4} {...register("profile")} placeholder="Tell us about your organization (min 20 characters)" aria-invalid={!!errors.profile} />
          </Field>
          <Field label="Products, services, solutions or innovations to exhibit" htmlFor="ex-products" error={errors.products?.message}>
            <Textarea id="ex-products" rows={3} {...register("products")} placeholder="What will you showcase?" />
          </Field>
          <Field label="Company logo URL" htmlFor="ex-logoUrl" error={errors.logoUrl?.message} hint="Paste a link to your logo (PNG, JPG or SVG). File upload available after registration.">
            <Input id="ex-logoUrl" {...register("logoUrl")} placeholder="https://.../logo.png" />
          </Field>
        </FormSection>

        <div className="space-y-3">
          <ConsentRow id="ex-consentInfo" error={errors.consentInfo?.message} register={register("consentInfo")}>
            I confirm that the information provided is accurate.
          </ConsentRow>
          <ConsentRow id="ex-consentTerms" error={errors.consentTerms?.message} register={register("consentTerms")}>
            I agree to the ICAFoW 2026 Exhibition Terms and Conditions.
          </ConsentRow>
        </div>
      </ModalBody>
      <ModalFooter>
        <p className="text-sm text-muted-foreground">
          Total: <span className="font-bold text-primary">{formatCurrency(selected.priceUSD)}</span>
        </p>
        <SubmitButton loading={isSubmitting}>
          Proceed to Payment <ArrowRight className="size-4" />
        </SubmitButton>
      </ModalFooter>
    </ModalForm>
  );
}
