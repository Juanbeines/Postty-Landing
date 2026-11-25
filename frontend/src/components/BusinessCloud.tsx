"use client";

/**
 * BusinessCloud — "Hecho para marcas que ya venden".
 *
 * A loose cloud of glass cards, each holding a white-background product shot
 * and its category, scattered on both sides of the headline. Replaced a
 * field of emoji pills: real product photography reads as "stores like
 * mine", where emoji read as cheap.
 *
 * Below `lg` there is no room to scatter twenty cards without stacking them,
 * so the cloud becomes two ribbons that drift in opposite directions, one
 * above the headline and one below it. Nothing overlaps at any width.
 *
 * Desktop positions are fixed percentages of the stage (no randomness, so SSR and
 * client agree), sizes scale with the viewport, and each card bobs on its own
 * slow loop so the cloud feels alive without anything travelling. The white
 * radial wash behind the headline stays: it fades the cards out toward the
 * centre so the title always reads.
 *
 * Product photos are AI-generated for this page, no brands.
 */

import { motion } from "framer-motion";
import { useCopy, useLocale } from "@/i18n/locale";

type Item = { src: string; label: { es: string; en: string }; x: number; y: number; size: number };

/* x / y: card centre as % of the stage. size: px at the 1152px desktop stage.
   Three bands — a full row above the headline, one card each side of it,
   a full row below — so no gap opens over or under the title. */
const ITEMS: Item[] = [
  // above
  { src: "calzado", label: { es: "Calzado", en: "Footwear" }, x: 10, y: 18, size: 150 },
  { src: "indumentaria", label: { es: "Indumentaria", en: "Apparel" }, x: 24, y: 9, size: 136 },
  { src: "panaderia", label: { es: "Panadería", en: "Bakeries" }, x: 37, y: 19, size: 138 },
  { src: "cafeteria", label: { es: "Cafeterías", en: "Coffee shops" }, x: 50, y: 8, size: 150 },
  { src: "perfumeria", label: { es: "Perfumería", en: "Fragrance" }, x: 63, y: 20, size: 134 },
  { src: "joyeria", label: { es: "Joyería", en: "Jewelry" }, x: 76, y: 9, size: 136 },
  { src: "optica-1", label: { es: "Óptica", en: "Eyewear" }, x: 90, y: 18, size: 146 },
  // beside the headline
  { src: "gastronomia", label: { es: "Gastronomía", en: "Restaurants" }, x: 19, y: 48, size: 176 },
  { src: "vinoteca", label: { es: "Vinotecas", en: "Wine shops" }, x: 6, y: 50, size: 126 },
  { src: "accesorios", label: { es: "Accesorios", en: "Accessories" }, x: 81, y: 50, size: 176 },
  { src: "relojeria", label: { es: "Relojería", en: "Watches" }, x: 94, y: 48, size: 126 },
  // below
  { src: "belleza", label: { es: "Belleza", en: "Beauty" }, x: 10, y: 81, size: 140 },
  { src: "electro", label: { es: "Electrodomésticos", en: "Appliances" }, x: 24, y: 91, size: 150 },
  { src: "bazar", label: { es: "Bazar", en: "Housewares" }, x: 37, y: 80, size: 136 },
  { src: "blanqueria", label: { es: "Blanquería", en: "Bed & bath" }, x: 50, y: 92, size: 146 },
  { src: "electronica", label: { es: "Electrónica", en: "Electronics" }, x: 63, y: 80, size: 138 },
  { src: "mascotas", label: { es: "Mascotas", en: "Pets" }, x: 76, y: 91, size: 136 },
  { src: "deco", label: { es: "Deco", en: "Home decor" }, x: 90, y: 81, size: 146 },
  { src: "fitness", label: { es: "Fitness", en: "Fitness" }, x: 50, y: 70, size: 118 },
  { src: "jugueteria", label: { es: "Juguetería", en: "Toys" }, x: 50, y: 30, size: 118 },
];

/* The ribbons: same cards, split so neighbours differ. Even counts on both, so
   the up/down stagger stays in step when the track loops. */
const bySrc = (srcs: string[]) => srcs.map((s) => ITEMS.find((it) => it.src === s)!);
const ROW_TOP = bySrc([
  "indumentaria", "cafeteria", "joyeria", "calzado", "jugueteria",
  "perfumeria", "gastronomia", "optica-1", "electro", "vinoteca",
]);
const ROW_BOTTOM = bySrc([
  "accesorios", "belleza", "bazar", "electronica", "deco",
  "mascotas", "relojeria", "panaderia", "fitness", "blanqueria",
]);

const COPY = {
  es: { title: "Hecho para marcas", titleEnd: "que ya venden" },
  en: { title: "Built for brands", titleEnd: "that already sell" },
};

/* One ribbon. The track holds the list twice and slides by half its width; the
   second copy is decorative. No backdrop blur here: phones pay for it on every
   frame of the drift. */
function Ribbon({ items, reverse = false }: { items: Item[]; reverse?: boolean }) {
  const locale = useLocale();
  return (
    <div className="ribbon-mask -mx-4 overflow-hidden pb-11 pt-4">
      <div className={`ribbon-track flex w-max ${reverse ? "ribbon-track-reverse" : ""}`}>
        {[0, 1].map((copy) => (
          <ul key={copy} aria-hidden={copy === 1} className="flex items-start">
            {items.map((it, i) => (
              <li
                key={it.src}
                className={`mr-3 w-[122px] shrink-0 rounded-[22px] border border-white bg-white/70 p-2 shadow-[0_10px_26px_rgba(13,21,34,0.08)] sm:mr-4 sm:w-[150px] sm:p-2.5 ${i % 2 ? "mt-6" : ""}`}
              >
                <div className="aspect-square overflow-hidden rounded-[15px] bg-white">
                  <img
                    src={`/business/${it.src}.webp`}
                    alt={copy === 0 ? it.label[locale] : ""}
                    decoding="async"
                    draggable={false}
                    className="h-full w-full select-none object-cover"
                  />
                </div>
                <p className="whitespace-nowrap pb-0.5 pt-2 text-center text-[11px] font-medium text-[#0D1522]/75 sm:text-[13px]">
                  {it.label[locale]}
                </p>
              </li>
            ))}
          </ul>
        ))}
      </div>
    </div>
  );
}

export default function BusinessCloud() {
  const t = useCopy(COPY);
  const locale = useLocale();
  return (
    <section className="overflow-hidden px-4 py-16 md:py-28">
      {/* Phones and tablets */}
      <div className="lg:hidden">
        <Ribbon items={ROW_TOP} />
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-heading pb-8 pt-2 text-center text-[34px] font-semibold leading-tight tracking-tight text-[#0D1522] sm:pb-10 sm:pt-4 sm:text-5xl"
        >
          {t.title}
          <br />
          {t.titleEnd}
        </motion.h2>
        <Ribbon items={ROW_BOTTOM} reverse />
      </div>

      {/* Desktop */}
      <div className="relative mx-auto hidden h-[760px] max-w-6xl lg:block">
        {ITEMS.map((it, i) => (
          <motion.div
            key={it.src}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, delay: 0.04 * i, ease: [0.22, 1, 0.36, 1] }}
            className="absolute"
            style={{
              left: `${it.x}%`,
              top: `${it.y}%`,
              // Narrow desktops: shrink with the stage so cards never collide.
              width: `min(${((it.size / 1152) * 100).toFixed(2)}vw, ${it.size}px)`,
              translate: "-50% -50%",
            }}
          >
            <motion.div
              animate={{ y: [0, -7, 0] }}
              transition={{ duration: 5 + (i % 4) * 0.9, repeat: Infinity, ease: "easeInOut", delay: (i % 5) * 0.6 }}
              className="rounded-[22px] border border-white/70 bg-white/45 p-2.5 shadow-[0_14px_40px_rgba(13,21,34,0.10),inset_0_1px_0_rgba(255,255,255,0.9)] backdrop-blur-xl backdrop-saturate-150"
            >
              <div className="aspect-square overflow-hidden rounded-[15px] bg-white">
                <img
                  src={`/business/${it.src}.webp`}
                  alt={it.label[locale]}
                  loading="lazy"
                  draggable={false}
                  className="h-full w-full select-none object-cover"
                />
              </div>
              <p className="whitespace-nowrap pb-0.5 pt-2 text-center text-xs font-medium text-[#0D1522]/75 xl:text-[13px]">
                {it.label[locale]}
              </p>
            </motion.div>
          </motion.div>
        ))}

        {/* Headline over the cloud. The white wash fades cards out toward the
            centre instead of dimming the whole field. */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(44% 34% at 50% 50%, rgba(250,250,250,0.96) 40%, rgba(250,250,250,0.78) 64%, rgba(250,250,250,0) 100%)",
            }}
          />
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-heading relative text-center text-5xl font-semibold leading-tight tracking-tight text-[#0D1522] xl:text-6xl"
          >
            {t.title}
            <br />
            {t.titleEnd}
          </motion.h2>
        </div>
      </div>
    </section>
  );
}
