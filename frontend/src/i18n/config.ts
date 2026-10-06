/* Plain helpers with no React in them, so server components (the legal
   pages, layouts) can call them. The React context lives in locale.tsx,
   which is a client module — functions exported from a "use client" file
   cannot be called on the server. */

export type Locale = "es" | "en";

/** Internal path for a locale: "/privacy/" → "/en/privacy/" in English. */
export function localePath(locale: Locale, path: string): string {
  return locale === "en" ? `/en${path === "/" ? "/" : path}` : path;
}

/** Number formatting per locale: 8.912 in Spanish, 8,912 in English. */
export function numberLocale(locale: Locale): string {
  return locale === "en" ? "en-US" : "es-AR";
}
