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

function ServicePanel({
  service,
  index,
  illustration,
  className,
  children,
}: {
  service: Service;
  index: number;
  /** Gráfico técnico del servicio (sin fotos) */
  illustration: ReactNode;
  className?: string;
  children?: ReactNode;
}) {
  const titleId = `${service.slug}-titulo`;
  return (
    <article aria-labelledby={titleId} className={cn("flex flex-col", className)}>
      <Reveal className="flex flex-1 flex-col">
        {/* Altura mínima común: los títulos de ambas columnas quedan alineados */}
        <div className="max-w-lg lg:min-h-[19.5rem]">{illustration}</div>

        <p className="mt-12 flex items-center gap-3 font-mono text-xs uppercase tracking-[0.2em] text-ink-600">
          <span className="font-semibold text-ink-950">{String(index).padStart(2, "0")}</span>
          <span aria-hidden className="h-px w-8 bg-sun-400" />
          {service.label}
        </p>
        <h3
          id={titleId}
          className="mt-4 max-w-lg font-heading text-3xl font-extrabold leading-[1.08] tracking-tight text-ink-950 sm:text-4xl xl:text-5xl"
        >
          {service.headline}
        </h3>
        <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-neutral-600">{service.description}</p>

        {/* Ficha técnica: filas separadas por líneas, sin tarjetas */}
        <ul className="mt-7 max-w-lg divide-y divide-neutral-200 border-y border-neutral-200">
          {service.features.map(({ icon: Icon, text }) => (
            <li key={text} className="flex items-center gap-3 py-3 text-sm text-neutral-700">
              <Icon className="size-4 shrink-0 text-ink-600" aria-hidden />
              {text}
            </li>
          ))}
        </ul>

        {children && <div className="mt-7">{children}</div>}

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
    </article>
  );
}

/** Calibración y soporte técnico lado a lado (inicio y página de servicios). */
export function Services({ heading = true }: { heading?: boolean }) {
  return (
    <section id="servicios" className="relative isolate overflow-hidden bg-white py-20 text-ink-950 sm:py-24">
      {/* Retícula de plano técnico en toda la sección: título y servicios se leen como una sola unidad */}
      <GridPattern tone="light" size={48} className="[mask-image:linear-gradient(to_bottom,transparent,black_12%,black_80%,transparent)]" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {heading && (
          <div className="mb-14 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
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

        <div className="grid gap-16 lg:grid-cols-2 lg:gap-0">
          <ServicePanel service={SERVICES.calibracion} index={1} illustration={<CalibrationChart />} className="lg:pr-14">
            <Accreditation />
          </ServicePanel>
          {/* Solo una línea vertical tenue separa los dos servicios */}
          <ServicePanel
            service={SERVICES.soporte}
            index={2}
            illustration={<SupportDiagnostic />}
            className="lg:border-l lg:border-neutral-200 lg:pl-14"
          />
        </div>
      </div>
    </section>
  );
}
