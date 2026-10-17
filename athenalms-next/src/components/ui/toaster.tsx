"use client";

import { Toaster as SonnerToaster } from "sonner";

import { useTheme } from "@/components/providers/ThemeProvider";

/** App-wide toast host, styled with the app's theme tokens. */
export function Toaster() {
  const { resolvedTheme } = useTheme();

  return (
    <SonnerToaster
      theme={resolvedTheme}
      position="top-center"
      closeButton
      toastOptions={{
        classNames: {
          toast:
            "rounded-lg border border-border bg-card text-card-foreground shadow-lg font-sans",
          description: "text-muted-foreground",
          error: "border-destructive/40",
          success: "border-success/40",
          warning: "border-warning/40",
        },
      }}
    />
  );
}
