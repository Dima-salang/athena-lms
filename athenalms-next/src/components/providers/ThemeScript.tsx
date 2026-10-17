import { THEME_STORAGE_KEY } from "@/lib/theme";

/**
 * Runs before paint to set the `dark` class from the saved preference,
 * so there is no flash of the wrong theme. Server-rendered (no "use client").
 */
export function ThemeScript() {
  const code = `(function(){try{var k="${THEME_STORAGE_KEY}";var t=localStorage.getItem(k);if(t!=="light"&&t!=="dark"&&t!=="system"){t="system";}var d=t==="dark"||(t==="system"&&window.matchMedia("(prefers-color-scheme: dark)").matches);var e=document.documentElement;e.classList.toggle("dark",d);e.style.colorScheme=d?"dark":"light";}catch(_){}})();`;

  return <script dangerouslySetInnerHTML={{ __html: code }} />;
}
