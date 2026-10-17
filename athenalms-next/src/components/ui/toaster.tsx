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
            "rounded-none border-2 border-border bg-card text-card-foreground shadow-lg font-sans font-medium",
          title: "font-semibold",
          description: "text-muted-foreground",
          error: "border-destructive",
          success: "border-success",
          warning: "border-warning",
          info: "border-primary",
          closeButton:
            "rounded-none border-2 border-border bg-card text-foreground",
        },
      }}
    />
  );
}
