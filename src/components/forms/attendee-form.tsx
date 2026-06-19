"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Field, FormSection } from "@/components/forms/field";
import { CountryField, ConsentRow, ErrorBanner, SubmitButton } from "@/components/forms/shared";
import { ApplicationSuccess } from "@/components/forms/application-success";
import {
  FormDialog,
  ModalForm,
  ModalHeader,
  ModalBody,
  ModalFooter,
  SelectedSummary,
} from "@/components/forms/modal-form";
import { passes, type PassId } from "@/lib/content/passes";
import { tracks } from "@/lib/content/tracks";
import { attendeeSchema, type AttendeeInput } from "@/lib/validations/registration";
import { submitRegistration, startPayment } from "@/lib/client/submit";
import { usePathname } from "next/navigation";
import { formatCurrency, cn } from "@/lib/utils";

export function AttendeeDialog({
  open,
  onOpenChange,
  initialPass,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialPass?: string;
}) {
  return (
    <FormDialog open={open} onOpenChange={onOpenChange}>
      <AttendeeForm initialPass={initialPass} />
    </FormDialog>
  );
}

function AttendeeForm({ initialPass }: { initialPass?: string }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [reference, setReference] = React.useState<string | null>(null);
  const isProcessingRef = React.useRef(false);
  const defaultPass = (passes.find((p) => p.id === initialPass)?.id ?? "delegate") as PassId;

  const { register, handleSubmit, watch, control, formState: { errors, isSubmitting } } = useForm<AttendeeInput>({
    resolver: zodResolver(attendeeSchema),
    defaultValues: { passId: defaultPass, country: "" },
  });

  const passId = watch("passId");
  const selected = passes.find((p) => p.id === passId)!;
  const isResearcher = passId === "researcher";

  async function onSubmit(data: AttendeeInput) {
    if (isProcessingRef.current) return;
    isProcessingRef.current = true;
    setServerError(null);
    try {
      const { reference, requiresPayment } = await submitRegistration("attendee", data);
      if (requiresPayment) await startPayment(reference, data.method);
      else setReference(reference);
    } catch (e) {
      setServerError(e instanceof Error ? e.message : "Something went wrong");
      isProcessingRef.current = false;
    }
  }

  return (
    <ModalForm onSubmit={handleSubmit(onSubmit)}>
      <ModalHeader
        eyebrow={isAdmin ? "Manual Registration" : "Attendee / Author Registration"}
        title={isAdmin ? "Register Attendee on Behalf" : "Register for ICAFoW 2026"}
        subtitle={isAdmin ? "Fill in the details below to manually register an attendee." : "Select your pass, tell us about yourself, and complete payment securely."}
      />
      <ModalBody>
        {reference ? (
          <ApplicationSuccess
            title="Registration request received!"
            reference={reference}
            message="Thank you for registering. Your request has been received and our team will review it shortly."
            onClose={() => window.location.reload()}
          />
        ) : (
          <>
            <ErrorBanner message={serverError} />

        {initialPass ? (
          <>
            <SelectedSummary
              label="Selected pass"
              name={selected.name}
              price={formatCurrency(selected.priceUSD)}
            />
            <input type="hidden" {...register("passId")} />
          </>
        ) : (
          <FormSection step={1} title="Select your pass">
            {isAdmin ? (
              <Field label="Pass Type" htmlFor="at-passId" required>
                <Select id="at-passId" {...register("passId")}>
                  {passes.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} - {formatCurrency(p.priceUSD)}
                    </option>
                  ))}
                </Select>
              </Field>
            ) : (
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
            )}
          </FormSection>
        )}

        <FormSection step={initialPass ? 1 : 2} title="Your details">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Full Name" htmlFor="at-fullName" required error={errors.fullName?.message}>
              <Input id="at-fullName" {...register("fullName")} placeholder="Jane Doe" aria-invalid={!!errors.fullName} />
            </Field>
            <Field label="Email" htmlFor="at-email" required error={errors.email?.message}>
              <Input id="at-email" type="email" {...register("email")} placeholder="you@example.com" aria-invalid={!!errors.email} />
            </Field>
            <Field label="Phone" htmlFor="at-phone" required error={errors.phone?.message} hint="Used for mobile-money payment (e.g. 0712 345 678).">
              <Input id="at-phone" {...register("phone")} placeholder="+255 712 345 678" aria-invalid={!!errors.phone} />
            </Field>
            <Field label="Country" htmlFor="at-country" required error={errors.country?.message}>
              <CountryField control={control} name="country" id="at-country" invalid={!!errors.country} />
            </Field>
            <Field label="Organization" htmlFor="at-organization" error={errors.organization?.message}>
              <Input id="at-organization" {...register("organization")} placeholder="Company / institution" />
            </Field>
            <Field label="Job Title" htmlFor="at-jobTitle" error={errors.jobTitle?.message}>
              <Input id="at-jobTitle" {...register("jobTitle")} placeholder="e.g. Data Scientist" />
            </Field>
            <Field label="Dietary requirements" htmlFor="at-dietary" className="sm:col-span-2" error={errors.dietary?.message}>
              <Input id="at-dietary" {...register("dietary")} placeholder="Optional — e.g. vegetarian, allergies" />
            </Field>
          </div>
        </FormSection>

        {isResearcher && (
          <FormSection step={initialPass ? 2 : 3} title="Paper submission" description="Required for the Researcher Pass. Accepted papers are published in IJAIT.">
            <div className="grid gap-5">
              <Field label="Paper Title" htmlFor="at-paperTitle" required error={errors.paperTitle?.message}>
                <Input id="at-paperTitle" {...register("paperTitle")} placeholder="Title of your paper" aria-invalid={!!errors.paperTitle} />
              </Field>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Track" htmlFor="at-paperTrack" required error={errors.paperTrack?.message}>
                  <Select id="at-paperTrack" defaultValue="" {...register("paperTrack")} aria-invalid={!!errors.paperTrack}>
                    <option value="" disabled>Select a track</option>
                    {tracks.map((t) => <option key={t.id} value={t.title}>{t.title}</option>)}
                  </Select>
                </Field>
                <Field label="Keywords" htmlFor="at-paperKeywords" error={errors.paperKeywords?.message}>
                  <Input id="at-paperKeywords" {...register("paperKeywords")} placeholder="comma, separated, keywords" />
                </Field>
              </div>
              <Field label="Abstract" htmlFor="at-paperAbstract" required error={errors.paperAbstract?.message}>
                <Textarea id="at-paperAbstract" rows={5} {...register("paperAbstract")} placeholder="Paste your abstract (min 30 characters)" aria-invalid={!!errors.paperAbstract} />
              </Field>
            </div>
          </FormSection>
        )}

        <ConsentRow id="at-consent" error={errors.consent?.message} register={register("consent")}>
          I confirm the information provided is accurate and I accept the ICAFoW 2026 terms and the refund policy.
        </ConsentRow>
          </>
        )}
      </ModalBody>
      {!reference && (
        <ModalFooter>
          <p className="text-sm text-muted-foreground">
            Total due: <span className="font-bold text-primary">{formatCurrency(selected.priceUSD)}</span>
          </p>
          <SubmitButton loading={isSubmitting}>
            {selected.priceUSD === 0 ? "Complete Registration" : "Proceed to Payment"} <ArrowRight className="size-4" />
          </SubmitButton>
        </ModalFooter>
      )}
    </ModalForm>
  );
}
