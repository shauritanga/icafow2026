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
import { usePathname } from "next/navigation";

/**
 * Downscale + re-encode an image entirely in the browser before upload.
 * Caps the longest edge at `maxEdge` px and exports JPEG, which turns a
 * multi-MB phone photo (incl. HEIC, which the canvas re-encodes) into
 * ~100-200KB. This keeps the JSON POST body small so it never trips the
 * reverse-proxy / platform body-size limit, and guarantees the preview
 * renders.
 */
async function compressImage(file: File, maxEdge = 800, quality = 0.8): Promise<string> {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Could not read the image file. Please try another."));
    reader.readAsDataURL(file);
  });

  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("That file does not appear to be a valid image."));
    image.src = dataUrl;
  });

  const scale = Math.min(1, maxEdge / Math.max(img.width, img.height));
  const width = Math.max(1, Math.round(img.width * scale));
  const height = Math.max(1, Math.round(img.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not process the image. Please try a different browser.");
  ctx.drawImage(img, 0, 0, width, height);

  return canvas.toDataURL("image/jpeg", quality);
}

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
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [reference, setReference] = React.useState<string | null>(null);
  const [photoData, setPhotoData] = React.useState<string | null>(null);
  const [photoError, setPhotoError] = React.useState<string | null>(null);

  const { register, handleSubmit, control, setValue, trigger, formState: { errors, isSubmitting } } = useForm<SpeakerInput>({
    resolver: zodResolver(speakerSchema),
    defaultValues: { country: "" },
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoError(null);
    // Guard against absurd originals before we even decode them.
    if (file.size > 25 * 1024 * 1024) {
      setPhotoError("Image is too large. Please choose a file under 25MB.");
      return;
    }
    try {
      const compressed = await compressImage(file);
      // Final guard on the *encoded* payload (an 800px JPEG should be well
      // under this). Prevents a too-large body from ever leaving the browser.
      if (compressed.length > 1_500_000) {
        setPhotoError("Could not compress this image enough. Please try a different photo.");
        return;
      }
      setPhotoData(compressed);
      setValue("photoData", compressed);
      trigger("photoData");
    } catch (err) {
      setPhotoData(null);
      setValue("photoData", "");
      setPhotoError(err instanceof Error ? err.message : "Could not process the image.");
    }
  };

  async function onSubmit(data: SpeakerInput) {
    setServerError(null);
    try {
      if (photoData) {
        data.photoData = photoData;
      }
      const { reference } = await submitRegistration("speaker", data);
      setReference(reference);
    } catch (e) {
      setServerError(e instanceof Error ? e.message : "Something went wrong");
    }
  }

  return (
    <ModalForm onSubmit={handleSubmit(onSubmit)}>
      <ModalHeader
        eyebrow={isAdmin ? "Manual Registration" : "Call for Speakers"}
        title={isAdmin ? "Register Speaker on Behalf" : "Apply to speak at ICAFoW 2026"}
        subtitle={isAdmin ? "Fill in the details below to manually register a speaker." : "Share your expertise with an international audience of leaders, researchers and innovators."}
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
              <Field label="Profile Photo" htmlFor="sp-photo" required error={photoError || errors.photoData?.message} className="sm:col-span-2">
                <div className="flex items-center gap-4">
                  {photoData && (
                    <div className="size-12 shrink-0 overflow-hidden rounded-full border border-border">
                      <img src={photoData} alt="Preview" className="size-full object-cover" />
                    </div>
                  )}
                  <Input 
                    id="sp-photo" 
                    type="file" 
                    accept="image/*" 
                    required
                    onChange={handleFileChange}
                    className="cursor-pointer file:text-primary file:font-medium file:bg-primary/10 file:border-0 file:rounded-md file:mr-4 file:px-3 file:py-1 hover:file:bg-primary/20"
                  />
                </div>
                <p className="mt-1 text-xs text-muted-foreground">Used for the speakers section on the website. Any photo works — we resize it for you.</p>
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
