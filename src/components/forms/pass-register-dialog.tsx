"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, ShieldCheck } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Field } from "@/components/forms/field";
import {
  CountryField,
  ConsentRow,
  ErrorBanner,
  SubmitButton,
} from "@/components/forms/shared";
import { type Pass } from "@/lib/content/passes";
import { tracks } from "@/lib/content/tracks";
import { attendeeSchema, type AttendeeInput } from "@/lib/validations/registration";
import { submitRegistration, startPayment } from "@/lib/client/submit";
import { formatCurrency } from "@/lib/utils";
import { approxTZS } from "@/lib/rate";

export function PassRegisterDialog({
  pass,
  open,
  onOpenChange,
}: {
  pass: Pass | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0">
        {pass && <PassForm key={pass.id} pass={pass} />}
      </DialogContent>
    </Dialog>
  );
}

function PassForm({ pass }: { pass: Pass }) {
  const [serverError, setServerError] = React.useState<string | null>(null);
  const isResearcher = pass.id === "researcher";

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting, isSubmitSuccessful },
  } = useForm<AttendeeInput>({
    resolver: zodResolver(attendeeSchema),
    defaultValues: { passId: pass.id, country: "" },
  });

  async function onSubmit(data: AttendeeInput) {
    setServerError(null);
    try {
      const { reference, requiresPayment } = await submitRegistration("attendee", data);
      if (requiresPayment) {
        await startPayment(reference, data.method);
      } else {
        window.location.assign(`/payment/${reference}`);
      }
    } catch (e) {
      setServerError(e instanceof Error ? e.message : "Something went wrong");
    }
  }

  // Once submitted successfully we redirect; keep the button in a loading state.
  const busy = isSubmitting || isSubmitSuccessful;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex max-h-[92dvh] flex-col" noValidate>
      {/* Header */}
      <div className="bg-brand-gradient px-6 py-5 text-white">
        <DialogHeader>
          <p className="text-xs font-semibold uppercase tracking-wider text-white/70">
            Register · {pass.subtitle}
          </p>
          <DialogTitle className="text-white">{pass.name}</DialogTitle>
          <DialogDescription className="text-white/80">
            {formatCurrency(pass.priceUSD)}{" "}
            <span className="text-white/60">
              · ≈ TZS {approxTZS(pass.priceUSD).toLocaleString()} via Selcom
            </span>
          </DialogDescription>
        </DialogHeader>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 space-y-6 overflow-y-auto px-6 py-6">
        <ErrorBanner message={serverError} />

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Full Name" htmlFor="m-fullName" required error={errors.fullName?.message}>
            <Input id="m-fullName" {...register("fullName")} placeholder="Jane Doe" aria-invalid={!!errors.fullName} />
          </Field>
          <Field label="Email" htmlFor="m-email" required error={errors.email?.message}>
            <Input id="m-email" type="email" {...register("email")} placeholder="you@example.com" aria-invalid={!!errors.email} />
          </Field>
          <Field label="Phone" htmlFor="m-phone" required error={errors.phone?.message} hint="Used for mobile-money payment.">
            <Input id="m-phone" {...register("phone")} placeholder="+255 712 345 678" aria-invalid={!!errors.phone} />
          </Field>
          <Field label="Country" htmlFor="m-country" required error={errors.country?.message}>
            <CountryField control={control} name="country" id="m-country" invalid={!!errors.country} />
          </Field>
          <Field label="Organization" htmlFor="m-org" error={errors.organization?.message}>
            <Input id="m-org" {...register("organization")} placeholder="Company / institution" />
          </Field>
          <Field label="Job Title" htmlFor="m-job" error={errors.jobTitle?.message}>
            <Input id="m-job" {...register("jobTitle")} placeholder="e.g. Data Scientist" />
          </Field>
          <Field label="Dietary requirements" htmlFor="m-diet" className="sm:col-span-2" error={errors.dietary?.message}>
            <Input id="m-diet" {...register("dietary")} placeholder="Optional — e.g. vegetarian, allergies" />
          </Field>
        </div>

        {isResearcher && (
          <div className="space-y-4 rounded-xl border border-border bg-accent/30 p-4">
            <p className="text-sm font-semibold text-secondary">
              Paper submission (included with the Researcher Pass)
            </p>
            <Field label="Paper Title" htmlFor="m-pt" required error={errors.paperTitle?.message}>
              <Input id="m-pt" {...register("paperTitle")} placeholder="Title of your paper" aria-invalid={!!errors.paperTitle} />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Track" htmlFor="m-ptr" required error={errors.paperTrack?.message}>
                <Select id="m-ptr" defaultValue="" {...register("paperTrack")} aria-invalid={!!errors.paperTrack}>
                  <option value="" disabled>Select a track</option>
                  {tracks.map((t) => <option key={t.id} value={t.title}>{t.title}</option>)}
                </Select>
              </Field>
              <Field label="Keywords" htmlFor="m-pk" error={errors.paperKeywords?.message}>
                <Input id="m-pk" {...register("paperKeywords")} placeholder="comma, separated" />
              </Field>
            </div>
            <Field label="Abstract" htmlFor="m-pa" required error={errors.paperAbstract?.message}>
              <Textarea id="m-pa" rows={4} {...register("paperAbstract")} placeholder="Paste your abstract (min 30 characters)" aria-invalid={!!errors.paperAbstract} />
            </Field>
          </div>
        )}

        <ConsentRow id="m-consent" error={errors.consent?.message} register={register("consent")}>
          I confirm the information provided is accurate and accept the ICAFoW 2026 terms and refund policy.
        </ConsentRow>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between gap-3 border-t border-border bg-muted/40 px-6 py-4">
        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <ShieldCheck className="size-4 text-secondary" /> Secure payment via Selcom
        </span>
        <SubmitButton loading={busy}>
          Pay {formatCurrency(pass.priceUSD)} <ArrowRight className="size-4" />
        </SubmitButton>
      </div>
    </form>
  );
}
