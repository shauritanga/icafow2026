"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field, FormSection } from "@/components/forms/field";
import { ConsentRow, ErrorBanner, SubmitButton } from "@/components/forms/shared";
import { ApplicationSuccess } from "@/components/forms/application-success";
import {
  FormDialog,
  ModalForm,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@/components/forms/modal-form";
import { partnerSchema, type PartnerInput } from "@/lib/validations/registration";
import { submitRegistration } from "@/lib/client/submit";

export function PartnerDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <FormDialog open={open} onOpenChange={onOpenChange}>
      <PartnerForm onClose={() => onOpenChange(false)} />
    </FormDialog>
  );
}

function PartnerForm({ onClose }: { onClose?: () => void }) {
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [reference, setReference] = React.useState<string | null>(null);
  const [logoSource, setLogoSource] = React.useState<"upload" | "url">("upload");
  const [logoFileError, setLogoFileError] = React.useState<string | null>(null);

  const { register, handleSubmit, setValue, trigger, watch, formState: { errors, isSubmitting } } = useForm<PartnerInput>({
    resolver: zodResolver(partnerSchema),
  });

  const logoUrlValue = watch("logoUrl");

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
    <ModalForm onSubmit={handleSubmit(onSubmit)}>
      <ModalHeader
        eyebrow="Partnership"
        title="Partner with ICAFoW 2026"
        subtitle="Join the movement shaping Africa's AI-powered future. Our team will be in touch."
      />
      <ModalBody>
        {reference ? (
          <ApplicationSuccess
            title="Partnership application received!"
            reference={reference}
            message="Thank you for your interest in partnering with ICAFoW 2026. Our partnerships team will review your application and reach out shortly."
            onClose={onClose}
          />
        ) : (
          <>
            <ErrorBanner message={serverError} />
            <FormSection step={1} title="Your details">
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Full Name" htmlFor="pt-fullName" required error={errors.fullName?.message}>
                  <Input id="pt-fullName" {...register("fullName")} placeholder="Full name" aria-invalid={!!errors.fullName} />
                </Field>
                <Field label="Job Title / Position" htmlFor="pt-jobTitle" error={errors.jobTitle?.message}>
                  <Input id="pt-jobTitle" {...register("jobTitle")} placeholder="e.g. Director" />
                </Field>
                <Field label="Organization / Institution" htmlFor="pt-organization" required error={errors.organization?.message}>
                  <Input id="pt-organization" {...register("organization")} placeholder="Organization name" aria-invalid={!!errors.organization} />
                </Field>
                <Field label="Email" htmlFor="pt-email" required error={errors.email?.message}>
                  <Input id="pt-email" type="email" {...register("email")} placeholder="you@example.com" aria-invalid={!!errors.email} />
                </Field>
                <Field label="Phone" htmlFor="pt-phone" required error={errors.phone?.message}>
                  <Input id="pt-phone" {...register("phone")} placeholder="+255 712 345 678" aria-invalid={!!errors.phone} />
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
                  <Field label="Upload Logo File" htmlFor="pt-logoFile" required error={logoFileError || errors.logoUrl?.message} className="sm:col-span-2" hint="PNG, JPG, SVG (Max 2MB).">
                    <div className="flex items-center gap-4">
                      {logoUrlValue && logoUrlValue.startsWith("data:") && (
                        <div className="size-12 shrink-0 overflow-hidden rounded-lg border border-border bg-white p-1">
                          <img src={logoUrlValue} alt="Preview" className="size-full object-contain" />
                        </div>
                      )}
                      <Input 
                        id="pt-logoFile" 
                        type="file" 
                        accept="image/*" 
                        onChange={handleFileChange}
                        className="cursor-pointer file:text-primary file:font-medium file:bg-primary/10 file:border-0 file:rounded-md file:mr-4 file:px-3 file:py-1 hover:file:bg-primary/20"
                        aria-invalid={!!logoFileError || !!errors.logoUrl}
                      />
                    </div>
                  </Field>
                ) : (
                  <Field label="Logo URL" htmlFor="pt-logoUrl" required error={errors.logoUrl?.message} className="sm:col-span-2" hint="Link to your organization logo (PNG, JPG or SVG).">
                    <Input id="pt-logoUrl" {...register("logoUrl")} placeholder="https://example.com/logo.png" aria-invalid={!!errors.logoUrl} />
                  </Field>
                )}
              </div>
            </FormSection>

            <FormSection step={2} title="Why partner with ICAFoW 2026?">
              <Field label="Brief summary" htmlFor="pt-summary" required error={errors.summary?.message}>
                <Textarea id="pt-summary" rows={5} {...register("summary")} placeholder="Tell us about your organization and why you'd like to partner (min 20 characters)" aria-invalid={!!errors.summary} />
              </Field>
            </FormSection>

            <ConsentRow id="pt-consent" error={errors.consent?.message} register={register("consent")}>
              I confirm the information provided is accurate and authorize ICAFoW 2026 to contact me regarding partnership opportunities.
            </ConsentRow>
          </>
        )}
      </ModalBody>
      {!reference && (
        <ModalFooter>
          <span className="text-xs text-muted-foreground">We&apos;ll respond within one business day.</span>
          <SubmitButton loading={isSubmitting}>
            Submit <ArrowRight className="size-4" />
          </SubmitButton>
        </ModalFooter>
      )}
    </ModalForm>
  );
}
