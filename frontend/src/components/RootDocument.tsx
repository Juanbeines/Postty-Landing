import Script from "next/script";
import { Suspense, type ReactNode } from "react";
import MetaPixel from "@/components/MetaPixel";
import { LocaleProvider } from "@/i18n/locale";
import type { Locale } from "@/i18n/config";

const GA_ID = "G-F4E2KJ2W01";

/**
 * The <html> shell both root layouts share — Spanish at "/" and English at
 * "/en/" are separate root layouts (route groups), so each can set its own
 * `lang` and metadata, but analytics, the Pixel and the structured data
 * must not drift between them.
 */
export default function RootDocument({
  locale,
  jsonLd,
  children,
}: {
  locale: Locale;
  jsonLd: object;
  children: ReactNode;
}) {
  return (
    <html lang={locale}>
      {/* The rule only exempts layout files; this <head> IS the root
          layouts' head, just shared between them. next/head is Pages Router. */}
      {/* eslint-disable-next-line @next/next/no-head-element */}
      <head>
        {/* Preconnect & DNS prefetch for Google Tag Manager (reduces TTFB of analytics) */}
        <link rel="preconnect" href="https://www.googletagmanager.com" crossOrigin="" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_ID}');
          `}
        </Script>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="antialiased">
        <LocaleProvider locale={locale}>
          <Suspense fallback={null}>
            <MetaPixel />
          </Suspense>
          {children}
        </LocaleProvider>
      </body>
    </html>
  );
}
