import type { Metadata } from "next";
import { Gabarito, Inter } from "next/font/google";
import "./globals.css";

const gabarito = Gabarito({
  variable: "--font-gabarito",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Postty | AI Marketing Agent",
  description:
    "AI Marketing Agent that creates your professional ads and manages your campaigns.",
  openGraph: {
    title: "Postty | AI Marketing Agent",
    description:
      "AI Marketing Agent that creates your professional ads and manages your campaigns.",
    url: "https://www.posttyai.com",
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
    title: "Postty | AI Marketing Agent",
    description:
      "AI Marketing Agent that creates your professional ads and manages your campaigns.",
    images: ["https://www.posttyai.com/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head />
      <body className={`${gabarito.variable} ${inter.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
