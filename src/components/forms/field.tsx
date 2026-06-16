import * as React from "react";
import { Label } from "@/components/ui/label";
import { FieldError } from "@/components/ui/misc";
import { cn } from "@/lib/utils";

export function Field({
  label,
  htmlFor,
  required,
  error,
  hint,
  className,
  children,
}: {
  label: string;
  htmlFor?: string;
  required?: boolean;
  error?: string;
  hint?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label htmlFor={htmlFor} required={required}>
        {label}
      </Label>
      {children}
      {hint && !error && <p className="text-xs text-muted-foreground">{hint}</p>}
      <FieldError message={error} />
    </div>
  );
}

export function FormSection({
  step,
  title,
  description,
  children,
}: {
  step?: number;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <fieldset className="space-y-5">
      <legend className="mb-1 flex items-center gap-3">
        {step != null && (
          <span className="flex size-8 items-center justify-center rounded-lg bg-brand-gradient text-sm font-bold text-white">
            {step}
          </span>
        )}
        <span>
          <span className="block font-display text-lg font-bold">{title}</span>
          {description && (
            <span className="block text-sm text-muted-foreground">{description}</span>
          )}
        </span>
      </legend>
      {children}
    </fieldset>
  );
}
