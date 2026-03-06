import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Postty | Tu Agente de Marketing con IA",
  description:
    "Postty es tu agente de marketing con inteligencia artificial. Creá ads profesionales, publicá campañas y optimizá resultados. Sin plantillas, sin genéricos.",
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
  return (
    <html lang="es">
      <head />
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
