import { GraduationCap, type LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

interface BrandMarkProps {
  icon?: LucideIcon;
  className?: string;
  iconClassName?: string;
}

/** The Athena mark: a primary tile with a cap glyph. Used in shell + auth. */
export function BrandMark({
  icon: Icon = GraduationCap,
  className,
  iconClassName,
}: BrandMarkProps) {
  return (
    <span
      className={cn(
        "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm",
        className
      )}
      aria-hidden
    >
      <Icon className={cn("h-5 w-5", iconClassName)} />
    </span>
  );
}
