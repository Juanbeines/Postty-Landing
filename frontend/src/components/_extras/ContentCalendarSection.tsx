"use client";
import { motion } from "framer-motion";

export default function ContentCalendarSection() {
  return (
    <section className="px-4 py-20">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-12 md:flex-row md:items-center md:gap-16">
        {/* Left column: text */}
        <div className="flex-1 text-center md:text-left">
          <p className="text-sm font-semibold text-[#0D1522]/40">Ads y contenido ilimitados</p>
          <h2 className="font-heading mt-3 text-3xl font-black leading-tight sm:text-4xl md:text-5xl">
            Llená tu calendario de contenido.
            <br />
            <span className="bg-gradient-to-r from-[#022BB0] via-[#1881F1] to-[#49D3F8] bg-clip-text text-transparent">3 meses de anticipación.</span>
          </h2>
          <p className="mx-auto mt-5 max-w-md text-[#0D1522]/60 leading-relaxed md:mx-0">
            Vos descansás. Postty no. Trabaja en segundo plano generando contenido
            mientras dormís. Así a la mañana revisás, elegís y publicás antes del
            mediodía.
          </p>
        </div>

        {/* Right column: iPhone */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative w-[250px] min-w-[250px] shrink-0"
          style={{ perspective: "1200px" }}
        >
          <div
            className="relative w-[250px]"
            style={{ transform: "rotateY(-10deg) rotateX(4deg)" }}
          >
            {/* iPhone frame */}
            <div className="rounded-[2.4rem] border-[2.5px] border-[#1C1C1E] bg-[#1C1C1E] p-[2px] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)]" style={{ aspectRatio: "9 / 19.5" }}>
              {/* Dynamic Island */}
              <div className="absolute left-1/2 top-[8px] z-20 h-[14px] w-[56px] -translate-x-1/2 rounded-full bg-[#1C1C1E]" />
              {/* Screen */}
              <div className="relative flex h-full flex-col overflow-hidden rounded-[2.2rem] bg-white">
                {/* Status bar */}
                <div className="flex shrink-0 items-center justify-between px-5 pb-1 pt-8">
                  <span className="text-[9px] font-semibold text-[#0D1522]">9:41</span>
                  <div className="flex items-center gap-1 opacity-60">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="#0D1522"><path d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.08 2.93 1 9zm8 8l3 3 3-3a4.237 4.237 0 00-6 0zm-4-4l2 2a7.074 7.074 0 0110 0l2-2C15.14 9.14 8.87 9.14 5 13z"/></svg>
                    <svg width="12" height="10" viewBox="0 0 24 16" fill="#0D1522"><rect x="0" y="2" width="20" height="12" rx="2" ry="2" stroke="#0D1522" strokeWidth="1.5" fill="none"/><rect x="2" y="4" width="14" height="8" rx="1" fill="#0D1522"/><path d="M22 6v4a2 2 0 000-4z"/></svg>
                  </div>
                </div>

                {/* Calendar content */}
                <div className="flex flex-1 flex-col justify-between gap-3 px-4 pb-5 pt-3">
                  {/* Próximo post */}
                  <div className="rounded-xl bg-[#F5F7FA] p-2.5">
                    <p className="text-[8px] font-bold text-[#0D1522]/40">Próximo post</p>
                    <div className="mt-1.5 flex gap-2">
                      <div className="h-10 w-10 shrink-0 rounded-lg bg-gradient-to-br from-[#1881F1] to-[#49D3F8]" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[9px] font-semibold text-[#0D1522]">Historia · Mañana 10:00</p>
                        <p className="truncate text-[7px] text-[#0D1522]/50">Listo para publicar</p>
                      </div>
                    </div>
                  </div>

                  {/* Calendar completo — 4 filas */}
                  <div>
                    <p className="text-[9px] font-bold text-[#0D1522]/35">Marzo 2026</p>
                    <div className="mt-1.5 grid grid-cols-7 gap-1 text-center text-[7px] font-medium text-[#0D1522]/25">
                      {["L","M","X","J","V","S","D"].map(d => <span key={d}>{d}</span>)}
                    </div>
                    <div className="mt-1 grid grid-cols-7 gap-1">
                      {Array.from({ length: 28 }, (_, i) => (
                        <motion.div
                          key={i}
                          initial={{ scale: 0, opacity: 0 }}
                          whileInView={{ scale: 1, opacity: 1 }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.3 + i * 0.015, duration: 0.25 }}
                          className={`flex min-h-[28px] w-full items-center justify-center rounded-lg text-[8px] font-bold ${
                            i < 24
                              ? i % 4 === 0
                                ? "bg-[#022BB0] text-white"
                                : i % 4 === 1
                                  ? "bg-[#1881F1] text-white"
                                  : i % 4 === 2
                                    ? "bg-[#49D3F8] text-white"
                                    : "bg-[#D6F951] text-[#0D1522]"
                              : "bg-[#F5F7FA] text-[#0D1522]/30"
                          }`}
                        >
                          {i + 1}
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Post con métricas */}
                  <div className="rounded-xl border border-[#E8ECF0] bg-white p-2.5">
                    <p className="text-[8px] font-bold text-[#0D1522]/40">Mejor post esta semana</p>
                    <div className="mt-1.5 flex gap-2">
                      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg p-[2px]" style={{ background: "linear-gradient(135deg, #022BB0, #1881F1, #49D3F8, #D6F951)" }}>
                        <div className="relative h-full w-full overflow-hidden rounded-[6px] bg-white">
                          {/* Carrusel: 3 slides separados */}
                          <div className="absolute inset-0 flex flex-col">
                            <div className="flex flex-1 items-end justify-between px-1 pb-4">
                              <div className="h-[70%] w-[26%] shrink-0 rounded-md bg-gradient-to-br from-[#022BB0]/40 to-[#1881F1]/25" />
                              <div className="h-[75%] w-[28%] shrink-0 rounded-md bg-gradient-to-br from-[#1881F1]/50 to-[#49D3F8]/35 shadow-sm" />
                              <div className="h-[70%] w-[26%] shrink-0 rounded-md bg-gradient-to-br from-[#49D3F8]/40 to-[#D6F951]/25" />
                            </div>
                          {/* Indicadores de slide */}
                          <div className="absolute bottom-1 left-1/2 flex -translate-x-1/2 gap-1">
                            <span className="h-1 w-1 rounded-full bg-[#0D1522]/25" />
                            <span className="h-1 w-1 rounded-full bg-[#1881F1]" />
                            <span className="h-1 w-1 rounded-full bg-[#0D1522]/25" />
                          </div>
                          </div>
                        </div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[9px] font-semibold text-[#0D1522]">Carrusel · 12 Mar</p>
                        <div className="mt-1.5 flex gap-3 text-[7px]">
                          <span className="font-bold text-[#8DB800]">4.2% CTR</span>
                          <span className="font-bold text-[#1881F1]">2.1k alcance</span>
                          <span className="font-bold text-[#49D3F8]">89 conv.</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex gap-2">
                    <div className="flex-1 rounded-xl bg-[#F5F7FA] p-2.5 text-center">
                      <p className="text-[10px] font-bold text-[#1881F1]">93 ads</p>
                      <p className="text-[6px] text-[#0D1522]/35">programados</p>
                    </div>
                    <div className="flex-1 rounded-xl bg-[#F5F7FA] p-2.5 text-center">
                      <p className="text-[10px] font-bold text-[#8DB800]">25 días</p>
                      <p className="text-[6px] text-[#0D1522]/35">cubiertos</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Reflection */}
            <div className="absolute -bottom-6 left-1/2 h-12 w-[80%] -translate-x-1/2 rounded-[50%] bg-gradient-to-r from-[#1881F1]/15 via-[#49D3F8]/10 to-[#D6F951]/8 blur-xl" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
