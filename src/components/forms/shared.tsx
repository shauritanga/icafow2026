"use client";

import * as React from "react";
import { Controller, type Control, type FieldValues, type FieldPath } from "react-hook-form";
import { AlertCircle, Loader2 } from "lucide-react";
import { Select } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/misc";
import { Button } from "@/components/ui/button";
import { CountryCombobox } from "@/components/ui/country-combobox";
import { countries, paymentMethods } from "@/lib/validations/common";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";

/** RHF-controlled searchable country selector. */
export function CountryField<T extends FieldValues>({
  control,
  name,
  id,
  invalid,
}: {
  control: Control<T>;
  name: FieldPath<T>;
  id?: string;
  invalid?: boolean;
}) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <CountryCombobox
          id={id}
          value={(field.value as string) ?? ""}
          onChange={field.onChange}
          onBlur={field.onBlur}
          invalid={invalid}
        />
      )}
    />
  );
}

export const CountrySelect = React.forwardRef<
  HTMLSelectElement,
  React.ComponentProps<"select">
>((props, ref) => (
  <Select ref={ref} defaultValue="" {...props}>
    <option value="" disabled>
      Select country
    </option>
    {countries.map((c) => (
      <option key={c} value={c}>
        {c}
      </option>
    ))}
  </Select>
));
CountrySelect.displayName = "CountrySelect";

export function PaymentMethodPicker({
  value,
  onChange,
  name,
  register,
}: {
  value?: string;
  onChange?: (v: string) => void;
  name?: string;
  register?: React.ComponentProps<"input">;
}) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {paymentMethods.map((m) => (
        <label
          key={m.value}
          className={cn(
            "flex cursor-pointer items-center gap-2 rounded-lg border border-input bg-background p-3 text-sm font-medium transition-colors hover:border-primary/40 has-[:checked]:border-primary has-[:checked]:bg-accent has-[:checked]:text-secondary"
          )}
        >
          <input
            type="radio"
            value={m.value}
            name={name}
            className="accent-[var(--brand-maroon)]"
            checked={value ? value === m.value : undefined}
            onChange={onChange ? (e) => onChange(e.target.value) : undefined}
            {...register}
          />
          {m.label}
        </label>
      ))}
    </div>
  );
}

export function ConsentRow({
  id,
  error,
  children,
  register,
}: {
  id: string;
  error?: string;
  children: React.ReactNode;
  register?: React.ComponentProps<"input">;
}) {
  return (
    <div>
      <label htmlFor={id} className="flex cursor-pointer items-start gap-3 text-sm text-muted-foreground">
        <Checkbox id={id} {...register} />
        <span>{children}</span>
      </label>
      {error && <p className="mt-1 text-xs font-medium text-destructive">{error}</p>}
    </div>
  );
}

export function ErrorBanner({ message }: { message?: string | null }) {
  if (!message) return null;
  return (
    <div className="flex items-start gap-2.5 rounded-lg border border-destructive/30 bg-destructive/10 p-3.5 text-sm text-destructive" role="alert">
      <AlertCircle className="mt-0.5 size-4 shrink-0" />
      {message}
    </div>
  );
}

export function SubmitButton({
  loading,
  children,
  ...props
}: React.ComponentProps<typeof Button> & { loading?: boolean }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");
  return (
    <Button type="submit" variant={isAdmin ? "default" : "gradient"} size="lg" disabled={loading} {...props}>
      {loading ? (
        <>
          <Loader2 className="size-4 animate-spin" /> Processing...
        </>
      ) : (
        children
      )}
    </Button>
  );
}
