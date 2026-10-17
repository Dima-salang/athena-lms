export type Theme = "light" | "dark" | "system";

export const THEME_STORAGE_KEY = "athena-theme";

/** Resolve "system" to a concrete theme using the OS preference. */
export function systemTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

/** Apply a theme to the document root. */
export function applyTheme(theme: Theme) {
  if (typeof document === "undefined") return;
  const resolved = theme === "system" ? systemTheme() : theme;
  const root = document.documentElement;
  root.classList.toggle("dark", resolved === "dark");
  root.style.colorScheme = resolved;
}
