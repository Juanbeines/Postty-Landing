import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import PrivacyContent from "@/components/legal/PrivacyContent";
import PrivacyContentEn from "@/components/legal/PrivacyContentEn";
import TermsContent from "@/components/legal/TermsContent";
import TermsContentEn from "@/components/legal/TermsContentEn";
import { localePath, type Locale } from "@/i18n/config";

/**
 * The standalone /privacy and /terms pages, in both languages. One shell for
 * all four routes — they used to be two near-identical files, and a third and
 * fourth copy for English would only have drifted.
 */

type Kind = "privacy" | "terms";

const SITE = "https://www.posttyai.com";

const COPY = {
  es: {
    home: "Inicio",
    back: "← Volver al inicio",
    privacy: {
      title: "Política de Privacidad",
      metaTitle: "Política de Privacidad | Postty",
      description:
        "Política de Privacidad de Postty: cómo recopilamos, usamos, almacenamos y protegemos tus datos. Derechos ARCO e información de contacto.",
      ogDescription:
        "Política de Privacidad de Postty: cómo recopilamos, usamos, almacenamos y protegemos tus datos.",
    },
    terms: {
      title: "Términos y Condiciones",
      metaTitle: "Términos y Condiciones | Postty",
      description:
        "Términos y Condiciones de uso de Postty: planes, responsabilidades, uso aceptable, propiedad intelectual y ley aplicable.",
      ogDescription:
        "Términos y Condiciones de uso de Postty: planes, responsabilidades y uso aceptable.",
    },
    notice: null as null | { text: string; link: string },
  },
  en: {
    home: "Home",
    back: "← Back to home",
    privacy: {
      title: "Privacy Policy",
      metaTitle: "Privacy Policy | Postty",
      description:
        "Postty's Privacy Policy: how we collect, use, store and protect your data. Your data-protection rights and contact information.",
      ogDescription: "Postty's Privacy Policy: how we collect, use, store and protect your data.",
    },
    terms: {
      title: "Terms and Conditions",
      metaTitle: "Terms and Conditions | Postty",
      description:
        "Postty's Terms and Conditions of use: plans, responsibilities, acceptable use, intellectual property and governing law.",
      ogDescription: "Postty's Terms and Conditions of use: plans, responsibilities and acceptable use.",
    },
    // These documents are written under Argentine law; the English text is a
    // convenience translation and must say so.
    notice: {
      text: "This English translation is provided for convenience only. In case of any discrepancy, the Spanish version prevails.",
      link: "Read the Spanish version",
    },
  },
} as const;

export function legalMetadata(locale: Locale, kind: Kind): Metadata {
  const t = COPY[locale][kind];
  const url = `${SITE}${localePath(locale, `/${kind}`)}`;
  return {
    title: t.metaTitle,
    description: t.description,
    alternates: {
      canonical: url,
      languages: { "es-AR": `${SITE}/${kind}`, "en-US": `${SITE}/en/${kind}`, "x-default": `${SITE}/${kind}` },
    },
    openGraph: {
      title: t.metaTitle,
      description: t.ogDescription,
      url,
      siteName: "Postty",
      locale: locale === "en" ? "en_US" : "es_AR",
      type: "website",
    },
    robots: { index: true, follow: true },
  };
}

export default function LegalPage({ locale, kind }: { locale: Locale; kind: Kind }) {
  const c = COPY[locale];
  const t = c[kind];
  const other: Kind = kind === "privacy" ? "terms" : "privacy";
  const home = localePath(locale, "/");

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: c.home, item: `${SITE}${home}` },
      { "@type": "ListItem", position: 2, name: t.title, item: `${SITE}${localePath(locale, `/${kind}/`)}` },
    ],
  };

  const Content =
    kind === "privacy"
      ? locale === "en" ? PrivacyContentEn : PrivacyContent
      : locale === "en" ? TermsContentEn : TermsContent;

  return (
    <main className="min-h-screen bg-white text-[#0D1522]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <header className="border-b border-[#0D1522]/10 bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <Link href={home} className="flex items-center gap-2">
            <Image src="/mascot.png" alt="Postty" width={32} height={32} priority />
            <span className="font-heading text-lg font-semibold tracking-tight">Postty</span>
          </Link>
          <Link
            href={home}
            className="text-sm text-[#0D1522]/60 transition hover:text-[#0D1522]"
          >
            {c.back}
          </Link>
        </div>
      </header>

      <article className="mx-auto max-w-3xl px-6 py-12">
        <h1 className="font-heading mb-6 text-3xl font-semibold tracking-tight text-[#0D1522]">
          {t.title}
        </h1>
        {c.notice && (
          <p className="mb-6 rounded-xl bg-[#0D1522]/[0.04] px-4 py-3 text-sm text-[#0D1522]/70">
            {c.notice.text}{" "}
            <Link href={`/${kind}`} className="text-[#1881F1] underline">
              {c.notice.link}
            </Link>
          </p>
        )}
        <div className="prose prose-sm max-w-none text-[#0D1522]/80 [&_h2]:font-heading [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-[#0D1522] [&_h2]:mt-8 [&_h2]:mb-3 [&_h3]:font-heading [&_h3]:text-base [&_h3]:font-medium [&_h3]:text-[#0D1522] [&_h3]:mt-6 [&_h3]:mb-2 [&_strong]:text-[#0D1522] [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:space-y-1 [&_p]:leading-relaxed [&_p]:mb-3 [&_a]:text-[#1881F1] [&_a]:underline">
          <Content />
        </div>
      </article>

      <footer className="border-t border-[#0D1522]/10 bg-white">
        <div className="mx-auto flex max-w-3xl flex-col items-center justify-between gap-2 px-6 py-6 text-sm text-[#0D1522]/60 sm:flex-row">
          <span>© {new Date().getFullYear()} Postty</span>
          <div className="flex items-center gap-4">
            <Link href={localePath(locale, `/${other}`)} className="transition hover:text-[#0D1522]">
              {c[other].title}
            </Link>
            <Link href={home} className="transition hover:text-[#0D1522]">
              {c.home}
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
