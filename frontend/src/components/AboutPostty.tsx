"use client";

import { localePath } from "@/i18n/config";
import { useCopy, useLocale } from "@/i18n/locale";

/**
 * Qué es Postty, YouTube y el uso responsable de la IA.
 *
 * Google lo pidió para verificar la app de YouTube (nov 2026): la página
 * principal tiene que explicar para qué es la app, a la vista. Por eso este
 * bloque NO va en un desplegable ni con una animación que lo esconda hasta
 * que aparece en pantalla: tiene que estar en el HTML y verse siempre.
 * Lo que dice tiene que ser cierto en el producto (ver
 * docs/youtube-publishing.md en Postty-Prod) y coincidir con la sección
 * de YouTube de la política de privacidad.
 */
const COPY = {
  es: {
    title: "¿Qué es Postty?",
    what:
      "Postty es una aplicación de marketing para comercios y empresas. Creás publicaciones, anuncios y videos de tus productos o servicios, los revisás y los publicás en tus propias cuentas de Instagram, TikTok, YouTube y Meta Ads, en el momento o en la fecha que elijas.",
    youtubeTitle: "YouTube",
    youtube:
      "Si conectás tu canal, Postty usa los servicios de la API de YouTube para mostrarte el nombre y la foto del canal, para subir los videos que vos elegís, con el título, la descripción, la privacidad y las declaraciones que confirmás, y para avisarte si YouTube los procesó. No sube ni cambia nada sin tu confirmación, y podés desconectarlo cuando quieras. Ver",
    privacy: "Privacidad",
    and: "y",
    terms: "Términos",
    aiTitle: "Uso responsable de la IA",
    ai:
      "Postty genera contenido comercial. Está prohibido crear o publicar contenido sexual o íntimo, o usar la imagen de una persona sin su consentimiento. Postty no usa las API de Google para eso.",
  },
  en: {
    title: "What is Postty?",
    what:
      "Postty is a marketing app for shops and businesses. You create posts, ads and videos of your products or services, review them, and publish them to your own Instagram, TikTok, YouTube and Meta Ads accounts, right away or on the date you choose.",
    youtubeTitle: "YouTube",
    youtube:
      "If you connect your channel, Postty uses the YouTube API Services to show you the channel's name and picture, to upload the videos you choose, with the title, description, privacy setting and disclosures you confirm, and to let you know whether YouTube processed them. It doesn't upload or change anything without your confirmation, and you can disconnect it at any time. See",
    privacy: "Privacy",
    and: "and",
    terms: "Terms",
    aiTitle: "Responsible use of AI",
    ai:
      "Postty generates commercial content. Creating or publishing sexual or intimate content, or using a person's likeness without their consent, is prohibited. Postty does not use Google APIs for that.",
  },
};

export default function AboutPostty() {
  const t = useCopy(COPY);
  const locale = useLocale();
  const link = "font-medium text-[#0D1522] underline underline-offset-2 transition hover:text-[#0D1522]/70";

  return (
    <section id="sobre-postty" className="px-4 py-20">
      <div className="mx-auto max-w-2xl">
        <h2 className="font-heading text-center text-2xl font-semibold text-[#0D1522] sm:text-3xl">{t.title}</h2>
        <p className="mt-6 text-base leading-relaxed text-[#0D1522]/70">{t.what}</p>

        <h3 className="mt-8 font-heading text-lg font-semibold text-[#0D1522]">{t.youtubeTitle}</h3>
        <p className="mt-2 text-base leading-relaxed text-[#0D1522]/70">
          {t.youtube}{" "}
          <a href={localePath(locale, "/privacy/")} className={link}>{t.privacy}</a>{" "}
          {t.and}{" "}
          <a href={localePath(locale, "/terms/")} className={link}>{t.terms}</a>.
        </p>

        <h3 className="mt-8 font-heading text-lg font-semibold text-[#0D1522]">{t.aiTitle}</h3>
        <p className="mt-2 text-base leading-relaxed text-[#0D1522]/70">{t.ai}</p>
      </div>
    </section>
  );
}
