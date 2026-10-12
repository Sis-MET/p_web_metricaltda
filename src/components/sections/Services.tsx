import Image from "next/image";
import {
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  FileText,
  HeadphonesIcon,
  Settings2,
  ShieldCheck,
  Timer,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { SectionLink } from "@/components/navigation/SectionLink";
import { Reveal } from "@/components/animations/Reveal";
import { Eyebrow } from "@/components/ui/SectionHeading";
import { CalibrationChart } from "@/components/illustrations/CalibrationChart";
import { SupportDiagnostic } from "@/components/illustrations/SupportDiagnostic";
import type { Consulta } from "@/lib/navigation";
import { cn } from "@/lib/utils";

const IBMETRO_URL =
  "https://ibmetro.gob.bo/dta/catalogo-oec?oec=M%C3%A9trica&tramite=&tipo=&norma=&sector=&estado=%C3%A7&pag=1";

type Service = {
  id: string;
  index: string;
  label: string;
  headline: string;
  description: string;
  features: { icon: LucideIcon; text: string }[];
  cta: string;
  consulta: Consulta;
};

const SERVICES: Service[] = [
  {
    id: "calibracion",
    index: "01",
    label: "Laboratorio de calibración",
    headline: "Precisión que puedes certificar.",
    description:
      "Servicio de calibración acreditado bajo normas ISO/IEC 17025. Emitimos certificados reconocidos internacionalmente, asegurando trazabilidad y exactitud en cada instrumento.",
    features: [
      { icon: FileText, text: "Certificados con trazabilidad ISO/IEC 17025" },
      { icon: ShieldCheck, text: "Válidos para auditorías de calidad y entes reguladores" },
      { icon: Timer, text: "Servicio programado para no interrumpir tu producción" },
      { icon: CheckCircle2, text: "Cobertura en toda la cadena de pesaje" },
    ],
    cta: "Solicitar calibración",
    consulta: "calibracion",
  },
  {
    id: "soporte",
    index: "02",
    label: "Soporte técnico",
    headline: "Equipo siempre operativo.",
    description:
      "Programas de mantenimiento preventivo y correctivo con técnicos especializados en METTLER TOLEDO. Diagnóstico rápido, repuestos originales y soporte remoto disponible.",
    features: [
      { icon: Settings2, text: "Mantenimiento preventivo y correctivo" },
      { icon: HeadphonesIcon, text: "Soporte remoto y visita técnica en terreno" },
      { icon: Zap, text: "Diagnóstico rápido con mínimo tiempo de inactividad" },
      { icon: CheckCircle2, text: "Repuestos originales METTLER TOLEDO garantizados" },
    ],
    cta: "Contactar soporte",
    consulta: "soporte",
  },
];

/**
 * Acreditación del laboratorio (solo aplica a calibración).
 * Regla de uso: el logo de acreditado va sobre fondo blanco, con el logo de Métrica a su derecha
 * y ambos del mismo tamaño.
 */
function Accreditation() {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-5">
      <div className="inline-flex shrink-0 items-center gap-4 self-start rounded-md bg-white px-4 py-2.5 ring-1 ring-slate-200">
        <Image
          src="/images/logo/ibmetro-acreditado.png"
          alt="Acreditado por IBMETRO: laboratorio de calibración DTA-CET-041"
          width={900}
          height={285}
          sizes="120px"
          className="h-9 w-auto"
        />
        <Image src="/images/logo/metrica.png" alt="Métrica Ltda." width={800} height={251} sizes="120px" className="h-9 w-auto" />
      </div>
      <div className="font-mono text-[11px] leading-relaxed text-slate-500">
        <p>Acreditación DTA-CET-041 · NB/ISO/IEC 17025:2018</p>
        <p>Balanzas (instrumentos de pesar de funcionamiento no automático) y pesas patrón.</p>
        <a
          href={IBMETRO_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-0.5 inline-flex items-center gap-1 font-semibold text-navy-700 underline-offset-4 transition-colors hover:text-navy-900 hover:underline"
        >
          Verificar alcance en IBMETRO <ArrowUpRight className="size-3" aria-hidden />
        </a>
      </div>
    </div>
  );
}

function ServicePanel({
  service,
  illustration,
  className,
  children,
}: {
  service: Service;
  /** Gráfico técnico del servicio (sin fotos) */
  illustration: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <article
      id={service.id}
      aria-labelledby={`${service.id}-titulo`}
      className={cn("flex scroll-mt-24 flex-col", className)}
    >
      <Reveal className="flex flex-1 flex-col">
        {/* Altura mínima común: los títulos de ambas columnas quedan alineados */}
        <div className="max-w-lg lg:min-h-[19.5rem]">{illustration}</div>

        <p className="mt-12 flex items-center gap-3 font-mono text-xs uppercase tracking-[0.2em] text-navy-600">
          <span className="font-semibold text-navy-950">{service.index}</span>
          <span aria-hidden className="h-px w-8 bg-navy-500/50" />
          {service.label}
        </p>
        <h3
          id={`${service.id}-titulo`}
          className="mt-4 max-w-lg font-heading text-3xl font-extrabold leading-[1.08] tracking-tight text-navy-950 sm:text-4xl xl:text-5xl"
        >
          {service.headline}
        </h3>
        <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-slate-600">{service.description}</p>

        {/* Ficha técnica: filas separadas por líneas, sin tarjetas */}
        <ul className="mt-7 max-w-lg divide-y divide-slate-200 border-y border-slate-200">
          {service.features.map(({ icon: Icon, text }) => (
            <li key={text} className="flex items-center gap-3 py-3 text-sm text-slate-700">
              <Icon className="size-4 shrink-0 text-navy-600" aria-hidden />
              {text}
            </li>
          ))}
        </ul>

        {children && <div className="mt-7">{children}</div>}

        <div className="mt-8">
          <Button asChild>
            <SectionLink section="contacto" consulta={service.consulta}>
              {service.cta} <ArrowRight />
            </SectionLink>
          </Button>
        </div>
      </Reveal>
    </article>
  );
}

export function Services() {
  const [calibration, support] = SERVICES;

  return (
    <section id="servicios" className="relative isolate overflow-hidden bg-white py-20 text-navy-950 sm:py-24">
      {/* Retícula de plano técnico en toda la sección: título y servicios se leen como una sola unidad */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,rgba(4,55,110,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(4,55,110,0.05)_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:linear-gradient(to_bottom,transparent,black_12%,black_80%,transparent)]"
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <Reveal>
            <Eyebrow>Servicios</Eyebrow>
            <h2 className="mt-4 font-heading text-3xl font-extrabold leading-[1.1] tracking-tight sm:text-4xl lg:text-5xl">
              Servicios especializados
            </h2>
          </Reveal>
          <Reveal delay={0.06}>
            <p className="max-w-md text-base leading-relaxed text-slate-600 lg:text-right">
              Más que vender equipos — garantizamos su funcionamiento óptimo y cumplimiento normativo a largo plazo.
            </p>
          </Reveal>
        </div>

        <div className="mt-14 grid gap-16 lg:grid-cols-2 lg:gap-0">
          <ServicePanel service={calibration} illustration={<CalibrationChart />} className="lg:pr-14">
            <Accreditation />
          </ServicePanel>
          {/* Solo una línea vertical tenue separa los dos servicios */}
          <ServicePanel
            service={support}
            illustration={<SupportDiagnostic />}
            className="lg:border-l lg:border-slate-200 lg:pl-14"
          />
        </div>
      </div>
    </section>
  );
}
