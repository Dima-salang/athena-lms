import type { Metadata } from "next";

import "./globals.css";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { ThemeScript } from "@/components/providers/ThemeScript";
import { Toaster } from "@/components/ui/toaster";

import { archivo, archivoBlack, spaceMono } from "./fonts";

export const metadata: Metadata = {
  title: "Athena LMS",
  description: "Tests, grading, and results for your school.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body
        className={`${archivo.variable} ${archivoBlack.variable} ${spaceMono.variable} min-h-screen bg-background font-sans antialiased`}
      >
        <ThemeProvider>
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
