"use client";

/**
 * Locale for the landing.
 *
 * The site ships twice from the same components: Spanish at "/" and English
 * at "/en/". Each route group's root layout wraps its tree in
 * <LocaleProvider>, and every component picks its own copy from a
 * `{ es, en }` object with `useCopy` — copy lives next to the markup it
 * fills, not in one far-away dictionary.
 *
 * Which visitor gets which version is decided outside the app: Amplify
 * redirects US traffic from "/" to "/en/" by country (see
 * amplify-redirects.json at the repo root). The English page is also a
 * plain URL, so it can be linked to directly.
 */

import { createContext, useContext, type ReactNode } from "react";
import type { Locale } from "@/i18n/config";

export type { Locale };

const LocaleContext = createContext<Locale>("es");

export function LocaleProvider({ locale, children }: { locale: Locale; children: ReactNode }) {
  return <LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider>;
}

export function useLocale(): Locale {
  return useContext(LocaleContext);
}

/** The copy for the active locale, from a `{ es, en }` pair. */
export function useCopy<T>(copy: Record<Locale, T>): T {
  return copy[useLocale()];
}
