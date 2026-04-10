"use client";

/**
 * PrivacySection — "Grandes poderes vienen con gran privacidad"
 *
 * Archived from src/app/page.tsx on 2026-04-09. Removed from the live landing
 * page per product decision but kept here so we can drop it back into page.tsx
 * if we ever want it again.
 *
 * To restore:
 * 1. Import `PrivacySection` in page.tsx
 * 2. Render `<PrivacySection />` where you want it (was originally between
 *    the "Stats" section and the "FAQ" section)
 *
 * Depends on the `/mascot.png` asset in `frontend/public/` and the
 * `.dragon-shadow` utility class defined in `src/app/globals.css`.
 */

import Image from "next/image";
import { motion } from "framer-motion";

export function PrivacySection() {
  return (
    <section className="px-4 py-20">
      <div className="mx-auto max-w-4xl text-center">
        <h2 className="font-heading text-3xl font-black sm:text-4xl md:text-5xl">
          Grandes poderes vienen con
        </h2>
        <p className="mt-2 font-heading text-2xl font-black sm:text-3xl md:text-4xl">
          <span className="bg-gradient-to-r from-[#022BB0] via-[#1881F1] to-[#49D3F8] bg-clip-text text-transparent">
            gran privacidad.
          </span>
        </p>
        <p className="mx-auto mt-5 max-w-2xl text-[#0D1522]/60">
          Tu marca es tu mayor activo. La protegemos con encriptación completa,
          cero intercambio de datos y control absoluto en tus manos.
        </p>
        <div className="relative mx-auto mt-10 w-[130px]">
          <div className="dragon-shadow absolute bottom-0 left-1/2 h-3 w-24 -translate-x-1/2 rounded-[50%]" />
          <Image
            src="/mascot.png"
            alt="Postty mascot"
            width={130}
            height={130}
            className="relative z-10"
          />
          <motion.div
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -right-4 -top-4 z-20"
            style={{ perspective: "600px" }}
          >
            <div
              className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#1881F1] to-[#49D3F8]"
              style={{
                transform: "rotateY(-10deg) rotateX(8deg)",
                boxShadow:
                  "0 8px 20px rgba(24,129,241,0.35), 0 2px 4px rgba(24,129,241,0.2), inset 0 1px 0 rgba(255,255,255,0.3), 0 -2px 0 rgba(0,0,0,0.1)",
              }}
            >
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
