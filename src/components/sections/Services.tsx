"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
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
    headline: "Precisión que\nyou can trust.",
    headlineEs: "Precisión que\npuedes certificar.",
    description:
      "Servicio de calibración acreditado bajo normas ISO/IEC 17025. Emitimos certificados reconocidos internacionalmente, asegurando trazabilidad y exactitud en cada instrumento.",
    features: [
      { icon: FileText,      text: "Certificados con trazabilidad ISO/IEC 17025" },
      { icon: ShieldCheck,   text: "Válidos para auditorías de calidad y entes reguladores" },
      { icon: Timer,         text: "Servicio programado para no interrumpir tu producción" },
      { icon: CheckCircle2,  text: "Cobertura en toda la cadena de pesaje" },
    ],
    cta: "Solicitar Calibración",
    href: "/servicios/calibracion",
    gradient: "from-blue-500/20 to-cyan-500/10",
    iconBg: "bg-blue-500/20",
    iconColor: "text-blue-300",
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
      { icon: Settings2,        text: "Mantenimiento preventivo y correctivo certificado" },
      { icon: HeadphonesIcon,   text: "Soporte remoto y visita técnica en terreno" },
      { icon: Zap,              text: "Diagnóstico rápido con mínimo tiempo de inactividad" },
      { icon: CheckCircle2,     text: "Repuestos originales METTLER TOLEDO garantizados" },
    ],
    cta: "Contactar Soporte",
    href: "/servicios/soporte",
    gradient: "from-yellow-500/20 to-amber-500/10",
    iconBg: "bg-[#f9e300]/20",
    iconColor: "text-[#f9e300]",
  },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
};

const cardVariants = {
  hidden:  { opacity: 0, y: 48 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as any } },
};

export function Services() {
  return (
    <section
      id="servicios"
      className="relative py-24 bg-slate-50 dark:bg-slate-900 overflow-hidden"
    >
      {/* Decorative blobs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-blue-100/60 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-[#f9e300]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Subtle grid pattern */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.04]"
        style={{
          backgroundImage: `linear-gradient(#94a3b820 1px, transparent 1px), linear-gradient(90deg, #94a3b820 1px, transparent 1px)`,
          backgroundSize: "48px 48px",
        }}
      />

      <div className="container mx-auto px-6 lg:px-16 relative z-10">

        {/* Header */}
        <AnimatedContent distance={24} direction="vertical" duration={0.7} ease="power3.out" initialOpacity={0} animateOpacity threshold={0.2}>
          <div className="text-center mb-16 space-y-4">
            <span className="font-heading inline-block text-[#04376e] text-xs font-bold tracking-[0.25em] uppercase border border-[#04376e]/30 rounded-full px-4 py-1.5">
              Lo que hacemos
            </span>
            <h2 className="font-heading text-4xl lg:text-5xl xl:text-6xl font-extrabold text-slate-900 dark:text-white leading-tight">
              Servicios Especializados
            </h2>
            <p className="font-body text-slate-600 dark:text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed">
              Más que vender equipos — garantizamos su funcionamiento óptimo
              y cumplimiento normativo a largo plazo.
            </p>
          </div>
        </AnimatedContent>

        {/* Cards grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="grid lg:grid-cols-2 gap-8"
        >
          {SERVICES.map((service) => {
            const Icon = service.icon;
            return (
              <motion.div
                key={service.id}
                variants={cardVariants}
                className="group relative rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 shadow-sm hover:shadow-md p-8 lg:p-10 flex flex-col gap-8 hover:border-[#04376e]/30 transition-all duration-300 overflow-hidden"
              >
                {/* Card gradient blob */}
                <div className={`absolute inset-0 bg-gradient-to-br ${service.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`} />

                {/* Top row: icon + label */}
                <div className="flex items-center gap-4 relative z-10">
                  <div className={`w-14 h-14 rounded-2xl ${service.iconBg} flex items-center justify-center shrink-0`}>
                    <Icon className={`w-7 h-7 ${service.iconColor}`} />
                  </div>
                  <span className={`font-heading text-sm font-bold tracking-widest uppercase text-[#04376e] dark:${service.iconColor}`}>
                    {service.label}
                  </span>
                </div>

                {/* Headline */}
                <div className="relative z-10">
                  <h3 className="font-heading text-2xl lg:text-3xl font-extrabold text-slate-900 dark:text-white leading-snug whitespace-pre-line">
                    {service.headlineEs}
                  </h3>
                </div>

                {/* Description */}
                <p className="font-body text-slate-600 dark:text-white/65 text-base leading-relaxed relative z-10">
                  {service.description}
                </p>

                {/* Feature list */}
                <ul className="space-y-3 relative z-10">
                  {service.features.map((feat, i) => {
                    const FeatIcon = feat.icon;
                    return (
                      <li key={i} className="flex items-start gap-3">
                        <FeatIcon className={`w-5 h-5 mt-0.5 shrink-0 ${service.iconColor}`} />
                        <span className="font-body text-slate-700 dark:text-white/80 text-sm leading-relaxed">
                          {feat.text}
                        </span>
                      </li>
                    );
                  })}
                </ul>

                {/* CTA */}
                <div className="mt-auto pt-2 relative z-10">
                  <a href={service.href}>
                    <Button
                      size="lg"
                      className="font-body rounded-full text-sm px-6 py-5 bg-[#f9e300] text-slate-900 font-bold hover:bg-[#f9e300]/90 hover:scale-105 transition-all duration-300 shadow-[0_0_20px_rgba(249,227,0,0.25)]"
                    >
                      {service.cta} <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </a>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

      </div>
    </section>
  );
}
