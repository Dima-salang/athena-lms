import type { ReactNode } from "react";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

type Tone = "primary" | "success" | "warning" | "gold" | "muted";

const TONES: Record<Tone, string> = {
  primary: "bg-primary/10 text-primary",
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  gold: "bg-gold/10 text-gold",
  muted: "bg-muted text-muted-foreground",
};

interface StatCardProps {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  icon?: LucideIcon;
  tone?: Tone;
  href?: string;
  className?: string;
}

/** Compact metric tile used across dashboards. */
export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = "muted",
  href,
  className,
}: StatCardProps) {
  const body = (
    <div
      className={cn(
        "flex items-start justify-between gap-3 rounded-lg border bg-card p-5 text-card-foreground shadow-sm",
        href && "transition-colors hover:border-primary/40",
        className
      )}
    >
      <div className="min-w-0 space-y-1">
        <p className="truncate text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <p className="font-display text-2xl font-semibold tracking-tight">
          {value}
        </p>
        {hint ? (
          <p className="text-xs text-muted-foreground">{hint}</p>
        ) : null}
      </div>
      {Icon ? (
        <span
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-md",
            TONES[tone]
          )}
        >
          <Icon className="h-4 w-4" aria-hidden />
        </span>
      ) : null}
    </div>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="block rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        {body}
      </Link>
    );
  }

  return body;
}
