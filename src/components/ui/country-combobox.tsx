"use client";

import * as React from "react";
import * as Popover from "@radix-ui/react-popover";
import { Check, ChevronDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { allCountries, priorityCountries } from "@/lib/content/countries";

const ordered = [
  ...priorityCountries,
  ...allCountries.filter((c) => !priorityCountries.includes(c)),
];

interface CountryComboboxProps {
  value?: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  id?: string;
  invalid?: boolean;
  placeholder?: string;
}

export function CountryCombobox({
  value,
  onChange,
  onBlur,
  id,
  invalid,
  placeholder = "Select country",
}: CountryComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [active, setActive] = React.useState(0);
  const listRef = React.useRef<HTMLUListElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const results = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return ordered;
    return ordered.filter((c) => c.toLowerCase().includes(q));
  }, [query]);

  function select(country: string) {
    onChange(country);
    setOpen(false);
    setQuery("");
    onBlur?.();
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (results[active]) select(results[active]);
    }
  }

  // Keep the highlighted item in view.
  React.useEffect(() => {
    const el = listRef.current?.children[active] as HTMLElement | undefined;
    el?.scrollIntoView({ block: "nearest" });
  }, [active]);

  return (
    <Popover.Root
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) {
          setQuery("");
          onBlur?.();
        }
      }}
    >
      <Popover.Trigger asChild>
        <button
          type="button"
          id={id}
          aria-invalid={invalid}
          className={cn(
            "flex h-11 w-full items-center justify-between rounded-lg border border-input bg-background px-3.5 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-primary/40 aria-[invalid=true]:border-destructive",
            !value && "text-muted-foreground"
          )}
        >
          <span className="truncate">{value || placeholder}</span>
          <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
        </button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          align="start"
          sideOffset={6}
          className="z-[60] w-[var(--radix-popover-trigger-width)] overflow-hidden rounded-lg border border-border bg-popover shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95"
          onOpenAutoFocus={(e) => {
            // focus the search input instead of the first item
            e.preventDefault();
            inputRef.current?.focus();
          }}
        >
          <div className="flex items-center gap-2 border-b border-border px-3">
            <Search className="size-4 shrink-0 text-muted-foreground" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setActive(0);
              }}
              onKeyDown={onKeyDown}
              placeholder="Search countries…"
              className="h-10 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              autoComplete="off"
            />
          </div>
          <ul ref={listRef} className="max-h-64 overflow-y-auto p-1" role="listbox">
            {results.length === 0 && (
              <li className="px-3 py-6 text-center text-sm text-muted-foreground">
                No countries found
              </li>
            )}
            {results.map((country, i) => (
              <li key={country}>
                <button
                  type="button"
                  role="option"
                  aria-selected={value === country}
                  onClick={() => select(country)}
                  onMouseEnter={() => setActive(i)}
                  className={cn(
                    "flex w-full items-center justify-between gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors",
                    active === i ? "bg-accent text-accent-foreground" : "hover:bg-muted",
                    value === country && "font-medium text-primary"
                  )}
                >
                  {country}
                  {value === country && <Check className="size-4 text-primary" />}
                </button>
              </li>
            ))}
          </ul>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
