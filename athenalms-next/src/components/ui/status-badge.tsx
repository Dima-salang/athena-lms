import { Badge, type BadgeProps } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type Variant = NonNullable<BadgeProps["variant"]>;

/**
 * One place that maps a status string to a label + tone, so the same state
 * looks identical everywhere (Published, Draft, Graded, Passed, ...).
 */
const STATUS: Record<string, { label: string; variant: Variant }> = {
  published: { label: "Published", variant: "success" },
  draft: { label: "Draft", variant: "secondary" },
  archived: { label: "Archived", variant: "outline" },
  upcoming: { label: "Upcoming", variant: "gold" },
  locked: { label: "Locked", variant: "outline" },
  active: { label: "Active", variant: "success" },
  "in-progress": { label: "In progress", variant: "warning" },
  submitted: { label: "Submitted", variant: "default" },
  graded: { label: "Graded", variant: "success" },
  passed: { label: "Passed", variant: "success" },
  failed: { label: "Failed", variant: "destructive" },
  "needs-improvement": { label: "Needs improvement", variant: "destructive" },
  pending: { label: "Pending", variant: "secondary" },
};

interface StatusBadgeProps {
  status: string;
  label?: string;
  className?: string;
}

export function StatusBadge({ status, label, className }: StatusBadgeProps) {
  const key = status.trim().toLowerCase().replace(/[\s_]+/g, "-");
  const entry = STATUS[key] ?? { label: status, variant: "secondary" as Variant };
  return (
    <Badge variant={entry.variant} className={cn(className)}>
      {label ?? entry.label}
    </Badge>
  );
}
