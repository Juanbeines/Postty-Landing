import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

const GA_ID = "G-F4E2KJ2W01";

export const metadata: Metadata = {
  title: "Postty | Tu Agente de Marketing con IA",
  description:
    "Postty es tu agente de marketing con inteligencia artificial. Creá ads profesionales, publicá campañas y optimizá resultados. Sin plantillas, sin genéricos.",
  metadataBase: new URL("https://www.posttyai.com"),
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: { url: "/mascot.png", type: "image/png", sizes: "500x500" },
    apple: "/mascot.png",
  },
  openGraph: {
    title: "Postty | Tu Agente de Marketing con IA",
    description:
      "Creá ads profesionales, publicá campañas y optimizá resultados con inteligencia artificial.",
    url: "https://www.posttyai.com",
    siteName: "Postty",
    images: [
      {
        url: "https://www.posttyai.com/og-image.png",
        width: 1200,
        height: 630,
        alt: "Postty — Tu Agente de Marketing con IA",
      },
    ],
    locale: "es_AR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Postty | Tu Agente de Marketing con IA",
    description:
      "Creá ads profesionales, publicá campañas y optimizá resultados con inteligencia artificial.",
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
        name: "Postty",
        url: "https://www.posttyai.com",
        logo: "https://www.posttyai.com/mascot.png",
        description:
          "Postty es tu agente de marketing con inteligencia artificial. Creá ads profesionales, publicá campañas y optimizá resultados.",
        contactPoint: {
          "@type": "ContactPoint",
          email: "soporte@posttyai.com",
          contactType: "customer support",
          availableLanguage: "Spanish",
        },
      },
      {
        "@type": "SoftwareApplication",
        name: "Postty",
        url: "https://app.posttyai.com",
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web",
        description:
          "Agente de marketing con IA que crea ads profesionales, publica campañas y optimiza resultados.",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
        },
      },
      {
        "@type": "WebSite",
        name: "Postty",
        url: "https://www.posttyai.com",
      },
    ],
  };

  return (
    <html lang="es">
      <head>
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
