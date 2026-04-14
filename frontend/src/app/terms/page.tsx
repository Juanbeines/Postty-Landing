import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import TermsContent from "@/components/legal/TermsContent";

export const metadata: Metadata = {
  title: "Términos y Condiciones | Postty",
  description:
    "Términos y Condiciones de uso de Postty: planes, responsabilidades, uso aceptable, propiedad intelectual y ley aplicable.",
  alternates: { canonical: "https://www.posttyai.com/terms" },
  openGraph: {
    title: "Términos y Condiciones | Postty",
    description:
      "Términos y Condiciones de uso de Postty: planes, responsabilidades y uso aceptable.",
    url: "https://www.posttyai.com/terms",
    siteName: "Postty",
    locale: "es_AR",
    type: "website",
  },
  robots: { index: true, follow: true },
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    {
      "@type": "ListItem",
      position: 1,
      name: "Inicio",
      item: "https://www.posttyai.com/",
    },
    {
      "@type": "ListItem",
      position: 2,
      name: "Términos y Condiciones",
      item: "https://www.posttyai.com/terms/",
    },
  ],
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-white text-[#0D1522]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <header className="border-b border-[#0D1522]/10 bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/mascot.png" alt="Postty" width={32} height={32} priority />
            <span className="font-heading text-lg font-black tracking-tight">Postty</span>
          </Link>
          <Link
            href="/"
            className="text-sm text-[#0D1522]/60 transition hover:text-[#0D1522]"
          >
            ← Volver al inicio
          </Link>
        </div>
      </header>

      <article className="mx-auto max-w-3xl px-6 py-12">
        <h1 className="font-heading mb-6 text-3xl font-black tracking-tight text-[#0D1522]">
          Términos y Condiciones de Uso
        </h1>
        <div className="prose prose-sm max-w-none text-[#0D1522]/80 [&_h2]:font-heading [&_h2]:text-lg [&_h2]:font-black [&_h2]:text-[#0D1522] [&_h2]:mt-8 [&_h2]:mb-3 [&_h3]:font-heading [&_h3]:text-base [&_h3]:font-bold [&_h3]:text-[#0D1522] [&_h3]:mt-6 [&_h3]:mb-2 [&_strong]:text-[#0D1522] [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:space-y-1 [&_p]:leading-relaxed [&_p]:mb-3 [&_a]:text-[#1881F1] [&_a]:underline">
          <TermsContent />
        </div>
      </article>

      <footer className="border-t border-[#0D1522]/10 bg-white">
        <div className="mx-auto flex max-w-3xl flex-col items-center justify-between gap-2 px-6 py-6 text-sm text-[#0D1522]/60 sm:flex-row">
          <span>© {new Date().getFullYear()} Postty</span>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="transition hover:text-[#0D1522]">
              Política de Privacidad
            </Link>
            <Link href="/" className="transition hover:text-[#0D1522]">
              Inicio
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
