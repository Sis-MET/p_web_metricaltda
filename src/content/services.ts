import {
  CheckCircle2,
  ClipboardCheck,
  FileText,
  HeadphonesIcon,
  Settings2,
  ShieldCheck,
  Timer,
  Wrench,
  Zap,
  type LucideIcon,
} from "lucide-react";

export type Service = {
  slug: "calibracion" | "soporte-tecnico";
  href: string;
  name: string;
  icon: LucideIcon;
  /** Una línea para menús */
  short: string;
  label: string;
  headline: string;
  description: string;
  features: readonly { icon: LucideIcon; text: string }[];
  cta: string;
};

export const SERVICES = {
  calibracion: {
    slug: "calibracion",
    href: "/servicios/calibracion",
    name: "Calibración",
    icon: ClipboardCheck,
    short: "Laboratorio acreditado por IBMETRO",
    label: "Laboratorio acreditado de calibración",
    headline: "Precisión que puede certificar.",
    description:
      "Laboratorio acreditado bajo NB/ISO/IEC 17025:2018 para calibrar balanzas y pesas patrón, con certificados trazables y reconocidos para auditorías y entes reguladores.",
    features: [
      { icon: FileText, text: "Certificados con trazabilidad metrológica" },
      { icon: ShieldCheck, text: "Válidos para auditorías de calidad y entes reguladores" },
      { icon: Timer, text: "Servicio programado para no interrumpir su producción" },
      { icon: CheckCircle2, text: "Balanzas de funcionamiento no automático y pesas patrón" },
    ],
    cta: "Solicitar calibración",
  },
  soporte: {
    slug: "soporte-tecnico",
    href: "/servicios/soporte-tecnico",
    name: "Soporte técnico",
    icon: Wrench,
    short: "Instalación, mantenimiento y reparación",
    label: "Soporte técnico",
    headline: "Equipo siempre operativo.",
    description:
      "Instalación profesional, planes de mantenimiento preventivo y correctivo, y renovación de básculas y balanzas para proteger su inversión y prolongar la vida útil de sus equipos.",
    features: [
      { icon: Settings2, text: "Mantenimiento preventivo y correctivo" },
      { icon: HeadphonesIcon, text: "Visita técnica en planta y asistencia remota" },
      { icon: Zap, text: "Diagnóstico rápido con mínimo tiempo de inactividad" },
      { icon: CheckCircle2, text: "Repuestos originales METTLER TOLEDO" },
    ],
    cta: "Solicitar soporte",
  },
} as const satisfies Record<string, Service>;
