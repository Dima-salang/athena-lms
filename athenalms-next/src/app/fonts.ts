import { Fraunces, Public_Sans } from "next/font/google";

/**
 * Self-hosted via next/font — no runtime network requests, no layout shift.
 * Variables are consumed by `@theme inline` in globals.css.
 */

export const publicSans = Public_Sans({
  subsets: ["latin"],
  variable: "--font-public-sans",
  display: "swap",
});

export const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});
