import type { LucideIcon } from "lucide-react";
import { AlertCircle, AlertTriangle, CheckCircle2, Info } from "lucide-react";

import { cn } from "@/lib/utils";

type AlertVariant = "error" | "success" | "warning" | "info";

const STYLES: Record<AlertVariant, string> = {
  error: "border-destructive/20 bg-destructive/10 text-destructive",
  success: "border-success/25 bg-success/10 text-success",
  warning: "border-warning/25 bg-warning/10 text-warning",
  info: "border-border bg-muted text-foreground",
};

const ICONS: Record<AlertVariant, LucideIcon> = {
  error: AlertCircle,
  success: CheckCircle2,
  warning: AlertTriangle,
  info: Info,
};

interface AlertProps {
  variant?: AlertVariant;
  icon?: LucideIcon;
  children: React.ReactNode;
  className?: string;
}

/** Inline status message. One component instead of a dozen hand-rolled banners. */
export function Alert({
  variant = "info",
  icon: IconOverride,
  children,
  className,
}: AlertProps) {
  const Icon = IconOverride ?? ICONS[variant];
  return (
    <div
      role={variant === "error" ? "alert" : "status"}
      className={cn(
        "flex items-start gap-2 rounded-md border p-3 text-sm font-medium",
        STYLES[variant],
        className
      )}
    >
      <Icon className="mt-px h-4 w-4 shrink-0" aria-hidden />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
