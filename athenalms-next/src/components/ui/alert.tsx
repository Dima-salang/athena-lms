import type { LucideIcon } from "lucide-react";
import { AlertCircle, AlertTriangle, CheckCircle2, Info } from "lucide-react";

import { cn } from "@/lib/utils";

type AlertVariant = "error" | "success" | "warning" | "info";

const STYLES: Record<AlertVariant, { box: string; icon: string }> = {
  error: {
    box: "border-destructive bg-destructive/10",
    icon: "text-destructive",
  },
  success: {
    box: "border-success bg-success/10",
    icon: "text-success",
  },
  warning: {
    box: "border-warning bg-warning/10",
    icon: "text-warning",
  },
  info: {
    box: "border-border bg-muted",
    icon: "text-primary",
  },
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
  const styles = STYLES[variant];
  return (
    <div
      role={variant === "error" ? "alert" : "status"}
      className={cn(
        // The fat left edge is the status stripe — reads at a glance.
        "flex items-start gap-3 rounded-none border-2 border-l-[10px] p-3 text-sm font-medium text-foreground",
        styles.box,
        className
      )}
    >
      <Icon
        className={cn("mt-px h-4 w-4 shrink-0", styles.icon)}
        aria-hidden
      />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
