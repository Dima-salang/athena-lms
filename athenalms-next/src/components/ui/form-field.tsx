import type { ReactNode } from "react";

import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

/** A titled group of related fields, separated from the group above it. */
export function FormSection({
  title,
  description,
  children,
  className,
  actions,
}: {
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
  actions?: ReactNode;
}) {
  return (
    <section className={cn("space-y-4 border-t pt-6 first:border-t-0 first:pt-0", className)}>
      {title || description || actions ? (
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="space-y-1">
            {title ? (
              <h3 className="font-display text-sm font-semibold tracking-tight text-foreground">
                {title}
              </h3>
            ) : null}
            {description ? (
              <p className="text-xs leading-relaxed text-muted-foreground">
                {description}
              </p>
            ) : null}
          </div>
          {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
        </div>
      ) : null}
      <div className="space-y-4">{children}</div>
    </section>
  );
}

/** Label + control + optional helper text with consistent spacing. */
export function FormField({
  label,
  htmlFor,
  hint,
  error,
  children,
  className,
}: {
  label?: string;
  htmlFor?: string;
  hint?: ReactNode;
  error?: string | null;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-2", className)}>
      {label ? <Label htmlFor={htmlFor}>{label}</Label> : null}
      {children}
      {error ? (
        <p className="text-xs font-medium text-destructive">{error}</p>
      ) : hint ? (
        <p className="text-xs leading-relaxed text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}

/** A single toggle rendered as a comfortable, clickable row. */
export function CheckboxField({
  id,
  label,
  description,
  checked,
  onChange,
  disabled,
}: {
  id: string;
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <label
      htmlFor={id}
      className={cn(
        "flex items-start gap-3 rounded-lg border bg-card p-3 transition-colors",
        disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer hover:bg-muted/50"
      )}
    >
      <input
        id={id}
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 h-4 w-4 shrink-0 rounded border-input accent-[hsl(var(--primary))]"
      />
      <span className="space-y-0.5">
        <span className="block text-sm font-medium leading-none">{label}</span>
        {description ? (
          <span className="block text-xs leading-relaxed text-muted-foreground">
            {description}
          </span>
        ) : null}
      </span>
    </label>
  );
}
