import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

const GA_ID = "G-F4E2KJ2W01";

export const metadata: Metadata = {
  title: "Postty | Agente de Marketing con IA para crear Ads de Meta",
  description:
    "Postty es tu agente de marketing con IA. Creá contenido y ads profesionales para Meta (Facebook e Instagram) en 5 minutos, sin plantillas.",
  metadataBase: new URL("https://www.posttyai.com"),
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon-192.png", type: "image/png", sizes: "192x192" },
      { url: "/icon-512.png", type: "image/png", sizes: "512x512" },
    ],
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: "Postty | Agente de Marketing con IA para crear Ads de Meta",
    description:
      "Creá contenido y ads profesionales para Meta en 5 minutos con inteligencia artificial. Sin plantillas, sin genéricos.",
    url: "https://www.posttyai.com",
    siteName: "Postty",
    images: [
      {
        url: "https://www.posttyai.com/og-image.png",
        width: 1200,
        height: 630,
        alt: "Postty — Agente de Marketing con IA",
      },
    ],
    locale: "es_AR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Postty | Agente de Marketing con IA para crear Ads de Meta",
    description:
      "Creá contenido y ads profesionales para Meta en 5 minutos con inteligencia artificial.",
    images: ["https://www.posttyai.com/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": "https://www.posttyai.com/#organization",
        name: "Postty",
        url: "https://www.posttyai.com",
        logo: "https://www.posttyai.com/mascot.png",
        description:
          "Postty es tu agente de marketing con IA. Creá contenido y ads profesionales para Meta (Facebook e Instagram) en 5 minutos.",
        contactPoint: {
          "@type": "ContactPoint",
          email: "soporte@posttyai.com",
          contactType: "customer support",
          availableLanguage: "Spanish",
        },
      },
      {
        "@type": "SoftwareApplication",
        "@id": "https://www.posttyai.com/#software",
        name: "Postty",
        url: "https://app.posttyai.com",
        applicationCategory: "BusinessApplication",
        applicationSubCategory: "MarketingApplication",
        operatingSystem: "Web",
        description:
          "Agente de marketing con IA que crea ads y contenido para Meta Ads (Facebook e Instagram) listos para publicar.",
        featureList: [
          "Generación de ads con IA para Meta (Facebook e Instagram)",
          "Análisis automático de la identidad de marca (Brand DNA)",
          "Creación de carruseles, posts, historias y UGC",
          "Edición y redimensión de creativos",
          "Subida directa a Meta Ads Manager",
        ],
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
          availability: "https://schema.org/InStock",
        },
      },
      {
        "@type": "WebSite",
        "@id": "https://www.posttyai.com/#website",
        name: "Postty",
        url: "https://www.posttyai.com",
        inLanguage: "es-AR",
        publisher: { "@id": "https://www.posttyai.com/#organization" },
      },
    ],
  };

  return (
    <html lang="es">
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
        {children}
      </body>
    </html>
  );
}
