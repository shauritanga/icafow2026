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
  SelectedSummary,
} from "@/components/forms/modal-form";
import { sponsorTiers, type SponsorTierId } from "@/lib/content/sponsors";
import { sponsorSchema, type SponsorInput } from "@/lib/validations/registration";
import { submitRegistration, startPayment } from "@/lib/client/submit";
import { formatCurrency, cn } from "@/lib/utils";

import { usePathname } from "next/navigation";

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
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [reference, setReference] = React.useState<string | null>(null);
  const isProcessingRef = React.useRef(false);
  const [logoSource, setLogoSource] = React.useState<"upload" | "url">("upload");
  const [logoFileError, setLogoFileError] = React.useState<string | null>(null);
  const defaultTier = (sponsorTiers.find((t) => t.id === initialTier)?.id ?? "platinum") as SponsorTierId;

  const { register, handleSubmit, watch, setValue, trigger, control, formState: { errors, isSubmitting } } = useForm<SponsorInput>({
    resolver: zodResolver(sponsorSchema),
    defaultValues: { tierId: defaultTier, country: "" },
  });

  const tierId = watch("tierId");
  const logoUrlValue = watch("logoUrl");
  const selected = sponsorTiers.find((t) => t.id === tierId)!;
  const negotiated = selected.priceUSD == null;

  const handleToggle = (source: "upload" | "url") => {
    setLogoSource(source);
    setValue("logoUrl", "");
    setLogoFileError(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setLogoFileError("Logo image must be less than 2MB");
      setValue("logoUrl", "");
      return;
    }
    setLogoFileError(null);
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setValue("logoUrl", base64);
      trigger("logoUrl");
    };
    reader.readAsDataURL(file);
  };

  async function onSubmit(data: SponsorInput) {
    if (isProcessingRef.current) return;
    isProcessingRef.current = true;
    setServerError(null);
    try {
      const { reference, requiresPayment } = await submitRegistration("sponsor", data);
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
        eyebrow={isAdmin ? "Manual Registration" : "Sponsorship"}
        title={isAdmin ? "Register Sponsor on Behalf" : "Become an ICAFoW 2026 Sponsor"}
        subtitle={isAdmin ? "Fill in the details below to manually register a sponsor." : "Position your organization at the forefront of Africa's AI revolution."}
      />
      <ModalBody>
        {reference ? (
          <ApplicationSuccess
            title="Sponsorship request received!"
            reference={reference}
            message="Thank you for your interest. Our team will review your application and contact you shortly to finalize the details."
            onClose={() => window.location.reload()}
          />
        ) : (
          <>
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
            {isAdmin ? (
              <Field label="Sponsorship Tier" htmlFor="so-tierId" required>
                <Select id="so-tierId" {...register("tierId")}>
                  {sponsorTiers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} - {t.priceUSD == null ? "By negotiation" : formatCurrency(t.priceUSD)}
                    </option>
                  ))}
                </Select>
              </Field>
            ) : (
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
            )}
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
            <Field label="Logo Option" required className="sm:col-span-2">
              <div className="mt-1 flex gap-4">
                <button
                  type="button"
                  onClick={() => handleToggle("upload")}
                  className={`flex-1 rounded-lg border p-3 text-center text-sm font-medium transition-all cursor-pointer ${
                    logoSource === "upload"
                      ? "border-primary bg-primary/10 text-white font-bold"
                      : "border-border bg-background/50 text-muted-foreground hover:bg-background/80"
                  }`}
                >
                  Upload from Device
                </button>
                <button
                  type="button"
                  onClick={() => handleToggle("url")}
                  className={`flex-1 rounded-lg border p-3 text-center text-sm font-medium transition-all cursor-pointer ${
                    logoSource === "url"
                      ? "border-primary bg-primary/10 text-white font-bold"
                      : "border-border bg-background/50 text-muted-foreground hover:bg-background/80"
                  }`}
                >
                  Paste Image URL
                </button>
              </div>
            </Field>

            {logoSource === "upload" ? (
              <Field label="Upload Logo File" htmlFor="so-logoFile" required error={logoFileError || errors.logoUrl?.message} className="sm:col-span-2" hint="PNG, JPG, SVG (Max 2MB).">
                <div className="flex items-center gap-4">
                  {logoUrlValue && logoUrlValue.startsWith("data:") && (
                    <div className="size-12 shrink-0 overflow-hidden rounded-lg border border-border bg-white p-1">
                      <img src={logoUrlValue} alt="Preview" className="size-full object-contain" />
                    </div>
                  )}
                  <Input 
                    id="so-logoFile" 
                    type="file" 
                    accept="image/*" 
                    onChange={handleFileChange}
                    className="cursor-pointer file:text-primary file:font-medium file:bg-primary/10 file:border-0 file:rounded-md file:mr-4 file:px-3 file:py-1 hover:file:bg-primary/20"
                    aria-invalid={!!logoFileError || !!errors.logoUrl}
                  />
                </div>
              </Field>
            ) : (
              <Field label="Logo URL" htmlFor="so-logoUrl" required error={errors.logoUrl?.message} className="sm:col-span-2" hint="Link to your organization logo (PNG, JPG or SVG).">
                <Input id="so-logoUrl" {...register("logoUrl")} placeholder="https://example.com/logo.png" aria-invalid={!!errors.logoUrl} />
              </Field>
            )}
          </div>
        </FormSection>

        <ConsentRow id="so-consent" error={errors.consent?.message} register={register("consent")}>
          I confirm the information provided is accurate and authorize ICAFoW 2026 to contact me regarding this sponsorship.
        </ConsentRow>
          </>
        )}
      </ModalBody>
      {!reference && (
        <ModalFooter>
          <span className="text-xs text-muted-foreground">
            {negotiated ? "Our team will confirm your package." : "Secure payment via Selcom."}
          </span>
          <SubmitButton loading={isSubmitting}>
            {negotiated ? "Submit Request" : "Proceed to Payment"} <ArrowRight className="size-4" />
          </SubmitButton>
        </ModalFooter>
      )}
    </ModalForm>
  );
}
