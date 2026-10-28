import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/animations/Reveal";
import { Eyebrow } from "@/components/ui/SectionHeading";
import { GridPattern } from "@/components/ui/Backdrop";
import { Accreditation } from "@/components/services/Accreditation";
import { CalibrationChart } from "@/components/illustrations/CalibrationChart";
import { SupportDiagnostic } from "@/components/illustrations/SupportDiagnostic";
import { SERVICES, type Service } from "@/content/services";
import { cn } from "@/lib/utils";

/**
 * Un servicio en su propia franja: título grande con su respaldo, ficha y acciones de un lado y
 * su diagrama del otro. `reverse` pasa el diagrama a la izquierda (zigzag entre servicios).
 */
function ServiceRow({
  service,
  index,
  illustration,
  reverse = false,
  credential,
}: {
  service: Service;
  index: number;
  /** Gráfico técnico del servicio (sin fotos) */
  illustration: ReactNode;
  reverse?: boolean;
  /** Respaldo bajo el título (la acreditación del laboratorio) */
  credential?: ReactNode;
}) {
  const titleId = `${service.slug}-titulo`;
  return (
    <article aria-labelledby={titleId} className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
      <Reveal className={cn(reverse && "lg:order-last")}>
        <p className="flex items-center gap-3 font-mono text-xs uppercase tracking-[0.2em] text-ink-600">
          <span className="font-semibold text-ink-950">{String(index).padStart(2, "0")}</span>
          <span aria-hidden className="h-px w-8 bg-sun-400" />
          Servicio
        </p>
        <h3
          id={titleId}
          className="mt-4 font-heading text-3xl font-extrabold uppercase leading-[1.04] tracking-tight text-ink-950 sm:text-4xl xl:text-[2.75rem]"
        >
          {service.label}
        </h3>
        {credential && <div className="mt-7">{credential}</div>}

        <p className="mt-7 font-heading text-xl font-bold text-ink-800">{service.headline}</p>
        <p className="mt-2 max-w-xl text-[15px] leading-relaxed text-neutral-600">{service.description}</p>

        {/* Ficha técnica: filas separadas por líneas, sin tarjetas */}
        <ul className="mt-7 max-w-xl divide-y divide-neutral-200 border-y border-neutral-200">
          {service.features.map(({ icon: Icon, text }) => (
            <li key={text} className="flex items-center gap-3 py-3 text-sm text-neutral-700">
              <Icon className="size-4 shrink-0 text-ink-600" aria-hidden />
              {text}
            </li>
          ))}
        </ul>

        <div className="mt-8 flex flex-wrap gap-3">
          <Button asChild>
            <Link href={service.href}>
              Conocer el servicio <ArrowRight />
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href={`${service.href}#solicitar`}>{service.cta}</Link>
          </Button>
        </div>
      </Reveal>

      <Reveal delay={0.08} className="mx-auto w-full max-w-xl">
        {illustration}
      </Reveal>
    </article>
  );
}

/** Calibración y soporte técnico, cada uno en su franja (inicio y página de servicios). */
export function Services({ heading = true }: { heading?: boolean }) {
  return (
    <section id="servicios" className="relative isolate overflow-hidden bg-white py-20 text-ink-950 sm:py-24">
      {/* Retícula de plano técnico en toda la sección: título y servicios se leen como una sola unidad */}
      <GridPattern tone="light" size={48} className="[mask-image:linear-gradient(to_bottom,transparent,black_12%,black_80%,transparent)]" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {heading && (
          <div className="mb-16 flex flex-col gap-4 lg:mb-20 lg:flex-row lg:items-end lg:justify-between">
            <Reveal>
              <Eyebrow>Servicios</Eyebrow>
              <h2 className="mt-4 font-heading text-3xl font-extrabold leading-[1.1] tracking-tight sm:text-4xl lg:text-5xl">
                Servicios especializados
              </h2>
            </Reveal>
            <Reveal delay={0.06}>
              <p className="max-w-md text-base leading-relaxed text-neutral-600 lg:text-right">
                Más que vender equipos: garantizamos su funcionamiento óptimo y su cumplimiento normativo a largo plazo.
              </p>
            </Reveal>
          </div>
        )}

        <ServiceRow service={SERVICES.calibracion} index={1} illustration={<CalibrationChart />} credential={<Accreditation />} />
        {/* Una línea a todo el ancho separa los dos servicios */}
        <div aria-hidden className="my-16 h-px bg-neutral-200 sm:my-20" />
        <ServiceRow service={SERVICES.soporte} index={2} illustration={<SupportDiagnostic />} reverse />
      </div>
    </section>
  );
}
