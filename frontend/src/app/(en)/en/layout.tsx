import type { Metadata } from "next";
import RootDocument from "@/components/RootDocument";
import "../../globals.css";

/* English root layout — the /en/ copy of the site, served to US visitors
   (Amplify redirects them here by country; see amplify-redirects.json).
   Mirrors (es)/layout.tsx: keep the two in step. */

const TITLE = "Postty | AI Marketing Agent for Meta and Google Ads";
const DESCRIPTION =
  "Create professional content and ad campaigns for Meta and Google Ads in 5 minutes with AI. No templates, nothing generic.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  metadataBase: new URL("https://www.posttyai.com"),
  alternates: {
    canonical: "/en/",
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
    title: TITLE,
    description: DESCRIPTION,
    url: "https://www.posttyai.com/en/",
    siteName: "Postty",
    images: [
      {
        url: "https://www.posttyai.com/og-image.png",
        width: 1200,
        height: 630,
        alt: "Postty — AI Marketing Agent",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description:
      "Create professional content and ad campaigns for Meta and Google Ads in 5 minutes with AI.",
    images: ["https://www.posttyai.com/og-image.png"],
  },
};

export default function EnglishRootLayout({
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
          "Postty is your AI marketing agent. Create professional content and ad campaigns for Meta and Google Ads in 5 minutes.",
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
          "AI marketing agent that creates ready-to-publish ads and content for Meta Ads and Google Ads.",
        featureList: [
          "AI ad generation for Meta (Facebook and Instagram) and Google Ads (coming soon)",
          "Automatic brand identity analysis (Brand DNA)",
          "Carousels, posts, stories and UGC",
          "Creative editing and resizing",
          "Campaign publishing on Meta Ads and Google Ads",
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
        "@id": "https://www.posttyai.com/en/#website",
        name: "Postty",
        url: "https://www.posttyai.com/en/",
        inLanguage: "en-US",
        publisher: { "@id": "https://www.posttyai.com/#organization" },
      },
    ],
  };

  return (
    <RootDocument locale="en" jsonLd={jsonLd}>
      {children}
    </RootDocument>
  );
}
