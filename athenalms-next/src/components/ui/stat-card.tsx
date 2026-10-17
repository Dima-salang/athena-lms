import type { ReactNode } from "react";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

type Tone = "primary" | "success" | "warning" | "gold" | "muted";

const TONES: Record<Tone, string> = {
  primary: "bg-primary text-primary-foreground",
  success: "bg-success text-success-foreground",
  warning: "bg-warning text-warning-foreground",
  gold: "bg-gold text-gold-foreground",
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
        "flex items-start justify-between gap-3 rounded-none border-2 border-border bg-card p-5 text-card-foreground shadow-sm",
        href && "nb-press",
        className
      )}
    >
      <div className="min-w-0 space-y-2">
        <p className="truncate text-xs label-mono font-bold text-muted-foreground">
          {label}
        </p>
        <p className="font-display text-2xl leading-none tracking-tight">
          {value}
        </p>
        {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
      </div>
      {Icon ? (
        <span
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-none border-2 border-border",
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
        className="block rounded-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        {body}
      </Link>
    );
  }

  return body;
}
