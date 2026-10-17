import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  className?: string;
}

/** Standard page title block: heading, optional description, optional actions. */
export function PageHeader({
  title,
  description,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between",
        className
      )}
    >
      <div className="space-y-3">
        <h1 className="font-display text-2xl leading-none tracking-tight text-foreground sm:text-3xl">
          {title}
        </h1>
        {/* Title bar — the same mark on every screen. */}
        <span
          className="block h-1.5 w-16 bg-primary shadow-[2px_2px_0_0_hsl(var(--shadow-ink))]"
          aria-hidden
        />
        {description ? (
          <p className="max-w-2xl text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex flex-wrap items-center gap-2">{actions}</div>
      ) : null}
    </div>
  );
}
