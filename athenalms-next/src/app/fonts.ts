import { Archivo, Archivo_Black, Space_Mono } from "next/font/google";

/**
 * Self-hosted via next/font — no runtime network requests, no layout shift.
 * Variables are consumed by `@theme inline` in globals.css.
 *
 * "Cobalt Kiosk" pairing: a heavy grotesque for display, a workhorse
 * grotesque for body copy, and a terminal monospace for labels and numbers.
 */

export const archivo = Archivo({
  subsets: ["latin"],
  variable: "--font-archivo",
  display: "swap",
});

export const archivoBlack = Archivo_Black({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-archivo-black",
  display: "swap",
});

export const spaceMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-space-mono",
  display: "swap",
});
