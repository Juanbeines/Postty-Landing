import type { Metadata } from "next";
import RootDocument from "@/components/RootDocument";
import "../globals.css";

export const metadata: Metadata = {
  title: "Postty | Agente de Marketing con IA para Meta y Google Ads",
  description:
    "Creá contenido y campañas publicitarias profesionales para Meta y Google Ads en 5 minutos con inteligencia artificial. Sin plantillas, sin genéricos.",
  metadataBase: new URL("https://www.posttyai.com"),
  alternates: {
    canonical: "/",
    // The same page in English lives at /en/ (US visitors are sent there).
    languages: { "es-AR": "/", "en-US": "/en/", "x-default": "/" },
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
    title: "Postty | Agente de Marketing con IA para Meta y Google Ads",
    description:
      "Creá contenido y campañas publicitarias profesionales para Meta y Google Ads en 5 minutos con inteligencia artificial. Sin plantillas, sin genéricos.",
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
    title: "Postty | Agente de Marketing con IA para Meta y Google Ads",
    description:
      "Creá contenido y campañas publicitarias profesionales para Meta y Google Ads en 5 minutos con inteligencia artificial.",
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
          "Postty es tu agente de marketing con IA. Creá contenido y campañas publicitarias profesionales para Meta y Google Ads en 5 minutos.",
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
          "Agente de marketing con IA que crea ads y contenido para Meta Ads y Google Ads listos para publicar.",
        featureList: [
          "Generación de ads con IA para Meta (Facebook e Instagram) y Google Ads (próximamente)",
          "Análisis automático de la identidad de marca (Brand DNA)",
          "Creación de carruseles, posts, historias y UGC",
          "Edición y redimensión de creativos",
          "Publicación de campañas en Meta Ads y Google Ads",
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
    <RootDocument locale="es" jsonLd={jsonLd}>
      {children}
    </RootDocument>
  );
}
