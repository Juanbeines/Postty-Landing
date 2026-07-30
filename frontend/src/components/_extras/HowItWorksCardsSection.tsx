/**
 * DEPRECATED — "Cómo funciona" as three glass cards.
 *
 * Archived 2026-07-30 in favor of the flow diagram (logos riding rails into
 * a glass card and result pills riding back out), at
 * src/components/HowItWorksFlow.tsx.
 *
 * Self-contained (steps[] data included) so it can be dropped back into
 * page.tsx as <HowItWorksCardsSection /> if needed. Not imported anywhere.
 * An even older version lives in HowItWorksOldSection.tsx.
 */

"use client";

import Image from "next/image";
import { motion } from "framer-motion";

const howItWorksSteps: ReadonlyArray<{
  num: string;
  icon: string;
  title: string;
  desc: string;
}> = [
  {
    num: "1",
    icon: "/step-1.webp",
    title: "Conectás tu marca",
    desc: "Pegás la URL de tu tienda y Postty genera el ADN de tu marca: colores, tipografías, tono y estilo.",
  },
  {
    num: "2",
    icon: "/step-2.webp",
    title: "Creamos el contenido",
    desc: "Postty genera +100 imágenes y Ads profesionales, siempre alineados a tu marca.",
  },
  {
    num: "3",
    icon: "/step-3.webp",
    title: "Publicá y escalá",
    desc: "Postty publica y optimiza tus campañas en Meta Ads y Google Ads para que rindan más.",
  },
];

export default function HowItWorksCardsSection() {
  return (
    <section id="como-funciona" className="px-4 py-16 md:py-24">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="font-heading text-center text-3xl font-semibold tracking-tight sm:text-4xl md:text-5xl"
      >
        Cómo funciona
      </motion.h2>
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.1 }}
        className="mx-auto mt-3 max-w-md text-center text-base text-[#0D1522]/55 sm:text-lg"
      >
        Tres pasos, de tu URL a campañas activas.
      </motion.p>

      <div className="mx-auto mt-12 grid max-w-[1120px] gap-5 md:mt-16 md:grid-cols-3 md:gap-6">
        {howItWorksSteps.map((step, i) => (
          <motion.div
            key={step.num}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ delay: i * 0.1, duration: 0.5 }}
            className="flex flex-col items-center rounded-3xl border border-white/70 bg-white/55 p-6 text-center shadow-[0_4px_32px_rgba(13,21,34,0.06)] backdrop-blur-xl sm:p-7"
          >
            {/* Title */}
            <h3 className="font-heading text-xl font-semibold tracking-tight text-[#0D1522] sm:text-2xl">
              {step.title}
            </h3>

            {/* Inner glass panel holding the step illustration */}
            <div className="mt-5 flex w-full items-center justify-center rounded-2xl border border-white/60 bg-white/40 p-4 backdrop-blur-md">
              <div className="relative aspect-[4/3] w-full">
                <Image
                  src={step.icon}
                  alt={step.title}
                  fill
                  sizes="(max-width: 768px) 80vw, 340px"
                  className="object-contain"
                />
              </div>
            </div>

            {/* Description */}
            <p className="mt-5 text-sm leading-relaxed text-[#0D1522]/65">
              {step.desc}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
