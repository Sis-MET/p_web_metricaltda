"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import {
  ClipboardCheck,
  Wrench,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Timer,
  FileText,
  Settings2,
  HeadphonesIcon,
  Zap,
} from "lucide-react";
import AnimatedContent from "@/components/animations/AnimatedContent";
import { Button } from "@/components/ui/Button";

const SERVICES = [
  {
    id: "calibracion",
    icon: ClipboardCheck,
    accentIcon: ShieldCheck,
    label: "Calibración Certificada",
    headlineEs: "Precisión que\npuedes certificar.",
    description:
      "Servicio de calibración acreditado bajo normas ISO/IEC 17025. Emitimos certificados reconocidos internacionalmente, asegurando trazabilidad y exactitud en cada instrumento.",
    features: [
      { icon: FileText,     text: "Certificados con trazabilidad ISO/IEC 17025" },
      { icon: ShieldCheck,  text: "Válidos para auditorías de calidad y entes reguladores" },
      { icon: Timer,        text: "Servicio programado para no interrumpir tu producción" },
      { icon: CheckCircle2, text: "Cobertura en toda la cadena de pesaje" },
    ],
    cta: "Solicitar Calibración",
    href: "/servicios/calibracion",
    image: "/images/sections/soporte-calibracion-slider9.svg",
    sealImage: undefined,
    accent: "#3b82f6",       // blue-500
    accentBg: "bg-blue-500/15",
    accentText: "text-blue-400",
    accentBorder: "border-blue-500",
    tabActiveBg: "bg-blue-500/10",
  },
  {
    id: "soporte",
    icon: Wrench,
    accentIcon: Settings2,
    label: "Soporte Técnico",
    headlineEs: "Equipo siempre\noperativo.",
    description:
      "Programas de mantenimiento preventivo y correctivo con técnicos especializados en METTLER TOLEDO. Diagnóstico rápido, repuestos originales y soporte remoto disponible.",
    features: [
      { icon: Settings2,       text: "Mantenimiento preventivo y correctivo certificado" },
      { icon: HeadphonesIcon,  text: "Soporte remoto y visita técnica en terreno" },
      { icon: Zap,             text: "Diagnóstico rápido con mínimo tiempo de inactividad" },
      { icon: CheckCircle2,    text: "Repuestos originales METTLER TOLEDO garantizados" },
    ],
    cta: "Contactar Soporte",
    href: "/servicios/soporte",
    image: "/images/sections/soporte-calibracion-slider10.svg",
    sealImage: undefined,
    accent: "#f9e300",       // brand yellow
    accentBg: "bg-[#f9e300]/15",
    accentText: "text-[#f9e300]",
    accentBorder: "border-[#f9e300]",
    tabActiveBg: "bg-[#f9e300]/10",
  },
];

/* ─── animation variants ─────────────────────────────────────────────────── */

const contentVariants: Variants = {
  hidden:  { opacity: 0, y: 24 },
  visible: {
    opacity: 1, y: 0,
    transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1], staggerChildren: 0.07 },
  },
  exit:    { opacity: 0, y: -16, transition: { duration: 0.3, ease: [0.4, 0, 1, 1] } },
};

const itemVariants: Variants = {
  hidden:  { opacity: 0, x: -12 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } },
};

const imageVariants: Variants = {
  hidden:  { opacity: 0, scale: 1.04 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
  exit:    { opacity: 0, scale: 0.97, transition: { duration: 0.35, ease: [0.4, 0, 1, 1] } },
};

/* ─── component ──────────────────────────────────────────────────────────── */

const AUTO_ROTATE_MS = 6000;

export function Services() {
  const [activeIndex, setActiveIndex] = useState(0);
  const service = SERVICES[activeIndex];
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Auto-rotate every 6 s; resets when user clicks a tab manually
  const startTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % SERVICES.length);
    }, AUTO_ROTATE_MS);
  };

  useEffect(() => {
    startTimer();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const handleTabClick = (i: number) => {
    setActiveIndex(i);
    startTimer(); // reset timer on manual click
  };

  return (
    <section
      id="servicios"
      className="relative py-24 bg-slate-50 dark:bg-slate-900 overflow-hidden"
    >
      <div className="container mx-auto px-6 lg:px-16 relative z-10 flex flex-col gap-14">

        {/* ── Header ── */}
        <AnimatedContent
          distance={24}
          direction="vertical"
          duration={0.7}
          ease="power3.out"
          initialOpacity={0}
          animateOpacity
          threshold={0.2}
        >
          <div className="text-center space-y-4">
            <h2 className="font-heading text-4xl lg:text-5xl xl:text-6xl font-extrabold text-slate-900 dark:text-white leading-tight">
              Servicios Especializados
            </h2>
            <p className="font-body text-slate-600 dark:text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed">
              Más que vender equipos — garantizamos su funcionamiento óptimo
              y cumplimiento normativo a largo plazo.
            </p>
          </div>
        </AnimatedContent>

        {/* ── Split panel ── */}
        <AnimatedContent
          distance={32}
          direction="vertical"
          duration={0.8}
          ease="power3.out"
          initialOpacity={0}
          animateOpacity
          threshold={0.15}
        >
          <div className="grid lg:grid-cols-2 gap-0 rounded-3xl overflow-hidden border border-slate-200 dark:border-white/10 shadow-xl shadow-slate-200/60 dark:shadow-black/40 min-h-[620px]">

            {/* ── LEFT: content panel ── */}
            <div className="flex flex-col bg-white dark:bg-slate-800/60 p-8 lg:p-12 gap-8">

              {/* Tab buttons */}
              <div className="flex gap-3 flex-wrap">
                {SERVICES.map((s, i) => {
                  const TabIcon = s.icon;
                  const isActive = i === activeIndex;
                  return (
                    <button
                      key={s.id}
                      onClick={() => handleTabClick(i)}
                      className={`
                        group flex items-center gap-2.5 px-5 py-3 rounded-2xl border text-sm font-bold font-heading
                        transition-all duration-300 cursor-pointer
                        ${isActive
                          ? `${s.tabActiveBg} ${s.accentBorder} ${s.accentText} border`
                          : "border-slate-200 dark:border-white/10 text-slate-500 dark:text-white/50 hover:border-slate-300 dark:hover:border-white/20 hover:text-slate-700 dark:hover:text-white/70"
                        }
                      `}
                    >
                      <TabIcon className={`w-4 h-4 transition-colors duration-200 ${isActive ? s.accentText : ""}`} />
                      {s.label}
                      {isActive && (
                        <motion.span
                          layoutId="tab-indicator"
                          className={`inline-block w-1.5 h-1.5 rounded-full`}
                          style={{ backgroundColor: s.accent }}
                        />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Animated content */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={service.id}
                  variants={contentVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="flex flex-col gap-5 flex-1"
                >
                  {/* Headline */}
                  <motion.div variants={itemVariants}>
                    <h3 className="font-heading text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white leading-snug whitespace-pre-line">
                      {service.headlineEs}
                    </h3>
                  </motion.div>

                  {/* Description */}
                  <motion.p
                    variants={itemVariants}
                    className="font-body text-slate-600 dark:text-white/65 text-base leading-relaxed"
                  >
                    {service.description}
                  </motion.p>

                  {/* Feature list */}
                  <motion.ul variants={itemVariants} className="space-y-3">
                    {service.features.map((feat, i) => {
                      const FeatIcon = feat.icon;
                      return (
                        <motion.li key={i} variants={itemVariants} className="flex items-start gap-3">
                          <span className={`mt-0.5 shrink-0 ${service.accentBg} ${service.accentText} w-7 h-7 rounded-lg flex items-center justify-center`}>
                            <FeatIcon className="w-4 h-4" />
                          </span>
                          <span className="font-body text-slate-700 dark:text-white/80 text-sm leading-relaxed pt-1">
                            {feat.text}
                          </span>
                        </motion.li>
                      );
                    })}
                  </motion.ul>

                  {/* CTA */}
                  <motion.div variants={itemVariants} className="mt-auto pt-2">
                    <a href={service.href}>
                      <Button
                        size="lg"
                        className="font-body rounded-full text-sm px-6 py-5 bg-[#f9e300] text-slate-900 font-bold hover:bg-[#f9e300]/90 hover:scale-105 transition-all duration-300 shadow-[0_0_20px_rgba(249,227,0,0.25)]"
                      >
                        {service.cta} <ArrowRight className="ml-2 w-4 h-4" />
                      </Button>
                    </a>
                  </motion.div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* ── RIGHT: image panel ── */}
            <div className="relative bg-slate-100 dark:bg-slate-900 flex items-center justify-center overflow-hidden min-h-[340px] lg:min-h-0">
              <AnimatePresence mode="wait">
                <motion.img
                  key={service.id}
                  src={service.image}
                  alt={service.label}
                  variants={imageVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="absolute inset-0 w-full h-full object-cover"
                  draggable={false}
                />
              </AnimatePresence>

              {/* Left-edge gradient — blends image into the content panel */}
              <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-white dark:from-slate-800 to-transparent pointer-events-none z-10" />

              {/* Bottom gradient overlay */}
              <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-slate-100 dark:from-slate-900 to-transparent pointer-events-none z-10" />

            </div>

          </div>
        </AnimatedContent>

      </div>
    </section>
  );
}
