import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

import { BrandMark } from "./BrandMark";

interface AuthShellProps {
  icon?: LucideIcon;
  tone?: "primary" | "warning";
  title: ReactNode;
  description?: ReactNode;
  maxWidth?: string;
  children: ReactNode;
}

/** Centered card shell shared by login, register, and change-password. */
export function AuthShell({
  icon,
  tone = "primary",
  title,
  description,
  maxWidth = "max-w-md",
  children,
}: AuthShellProps) {
  return (
    <div className="relative flex min-h-screen items-center justify-center p-4 sm:p-6">
      <div
        className="pointer-events-none absolute inset-0 bg-muted/50"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-paper opacity-70"
        aria-hidden
      />
      <div className={cn("relative w-full", maxWidth)}>
        <Card className="animate-rise border-2 shadow-xl">
          <CardHeader className="items-center space-y-4 text-center">
            <BrandMark
              icon={icon}
              className={cn(
                "h-12 w-12 shadow-md",
                tone === "warning" && "bg-warning text-warning-foreground"
              )}
              iconClassName="h-6 w-6"
            />
            <div className="space-y-2">
              <CardTitle className="text-2xl">{title}</CardTitle>
              {description ? (
                <CardDescription>{description}</CardDescription>
              ) : null}
            </div>
          </CardHeader>
          {children}
        </Card>
        <p className="mt-6 text-center text-xs label-mono font-bold text-muted-foreground">
          Athena LMS
        </p>
      </div>
    </div>
  );
}
