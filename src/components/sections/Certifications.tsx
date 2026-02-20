"use client";

import { motion } from "framer-motion";
import { ExternalLink } from "lucide-react";

export function Certifications() {
  return (
    <section
      id="certificaciones"
      className="py-20 bg-white dark:bg-slate-950 border-y border-slate-200 dark:border-slate-800"
    >
      <div className="container mx-auto px-6 lg:px-16">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col lg:flex-row items-center gap-10 lg:gap-16"
        >
          {/* ── Logos ── */}
          <div className="flex items-center gap-4 shrink-0">
            <img
              src="/images/logo/logo_metrica.svg"
              alt="Logo Métrica"
              className="h-20 lg:h-24 w-auto object-contain"
              draggable={false}
            />
            <div className="w-px h-16 bg-slate-200 dark:bg-slate-700" />
            <img
              src="/images/logo/ibmetro_logo_acreditado.svg"
              alt="Acreditado IBMETRO DTA-CET-041"
              className="h-20 lg:h-24 w-auto object-contain"
              draggable={false}
            />
          </div>

          {/* ── Text ── */}
          <div className="flex flex-col gap-4 text-center lg:text-left">
            <p className="font-body text-slate-600 dark:text-slate-300 text-sm lg:text-base leading-relaxed">
              Nuestro laboratorio de calibración está acreditado por la{" "}
              <span className="font-semibold text-slate-800 dark:text-white">
                Dirección Técnica de Acreditación (DTA)
              </span>{" "}
              del{" "}
              <span className="font-semibold text-slate-800 dark:text-white">
                Instituto Boliviano de Metrología (IBMETRO)
              </span>{" "}
              según{" "}
              <span className="font-semibold text-slate-800 dark:text-white">
                NB/ISO/IEC 17025:2018
              </span>
              . Revise el alcance de nuestra acreditación para calibración de
              instrumentos de pesaje de pesar de funcionamiento no automático
              (balanzas) y pesas patrón, en el anexo del certificado de
              acreditación{" "}
              <span className="font-semibold text-slate-800 dark:text-white">
                DTA-CET-041
              </span>
              .
            </p>

            <p className="font-body text-slate-600 dark:text-slate-300 text-sm lg:text-base leading-relaxed">
              También puede verificar el alcance de acreditación en la página
              web de IBMETRO:{" "}
              <a
                href="https://ibmetro.gob.bo/dta/catalogo-oec?oec=M%C3%A9trica&tramite=&tipo=&norma=&sector=&estado=%C3%A7&pag=1"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-semibold text-blue-600 dark:text-blue-400 hover:underline underline-offset-2 transition-colors"
              >
                www.ibmetro.gob.bo
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
