import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import { ArrowRight, Box } from "lucide-react";
import { Reveal } from "@/components/animations/Reveal";
import { GridPattern, Glow } from "@/components/ui/Backdrop";
import { Button } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { productHref } from "@/content/catalog";
import {
  DEMO_HREF,
  PROJECT_SECTION_ID,
  PROJECT_STEPS,
  TRUCK_SCALE_PRODUCT,
  VTS200,
  VTS200_FACTS,
  demoStepHref,
  phaseOf,
} from "@/content/truckScaleProject";
import paso1 from "@/assets/demos/vts200/paso-1.webp";
import paso2 from "@/assets/demos/vts200/paso-2.webp";
import paso3 from "@/assets/demos/vts200/paso-3.webp";
import paso4 from "@/assets/demos/vts200/paso-4.webp";
import paso5 from "@/assets/demos/vts200/paso-5.webp";
import paso6 from "@/assets/demos/vts200/paso-6.webp";

/** Imagen fija de cada paso, tomada del propio demo 3D (pnpm demo:capture) */
const STEP_IMAGES: StaticImageData[] = [paso1, paso2, paso3, paso4, paso5, paso6];

/**
 * Proyecto de la báscula camionera VTS200 en el inicio: los pasos con imágenes fijas y el demo 3D
 * a un clic. La página no descarga three.js: el demo se abre encima (modal) solo si se pide.
 */
export function TruckScaleProject() {
  return (
    <section
      id={PROJECT_SECTION_ID}
      data-header-theme="dark"
      className="relative isolate overflow-hidden bg-mt-900 py-20 text-white sm:py-24"
    >
      <GridPattern className="[mask-image:linear-gradient(to_bottom,black,transparent_75%)]" />
      <Glow className="-right-64 -top-64" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.15fr_1fr] lg:items-end lg:gap-16">
          <Reveal>
            <SectionHeading
              tone="dark"
              eyebrow={`Proyecto llave en mano · ${VTS200.name}`}
              title="Instalamos su báscula camionera de principio a fin"
              description="Preparamos el terreno, construimos la obra civil y montamos la báscula con su caseta de control. Recorra cada paso en el demo 3D."
            />
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild variant="light">
                {/* Se abre encima de la página; con Ctrl+clic, en su propia pestaña */}
                <Link href={DEMO_HREF} scroll={false}>
                  <Box /> Ver demo 3D
                </Link>
              </Button>
              <Button asChild variant="glass">
                <Link href={productHref(TRUCK_SCALE_PRODUCT)}>
                  Ver la báscula <ArrowRight />
                </Link>
              </Button>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10">
              {VTS200_FACTS.map((fact) => (
                <div key={fact.value} className="flex flex-col-reverse gap-1 bg-mt-900 p-5">
                  <dt className="text-sm leading-snug text-white/65">{fact.label}</dt>
                  <dd className="font-heading text-xl font-extrabold tracking-tight sm:text-2xl">{fact.value}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>

        <ol className="-mx-4 mt-14 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 [scrollbar-width:none] sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-5 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-3">
          {PROJECT_STEPS.map((step, i) => {
            const phase = phaseOf(step);
            return (
              <li key={step.title} className="w-[82%] shrink-0 snap-start sm:w-auto">
                <Reveal delay={(i % 3) * 0.05} className="h-full">
                  <Link
                    href={demoStepHref(i + 1)}
                    scroll={false}
                    className="group flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-mt-950/50 transition-colors duration-200 hover:border-white/30"
                  >
                    <div className="relative aspect-[16/10] overflow-hidden">
                      <Image
                        src={STEP_IMAGES[i]}
                        alt={`Modelo 3D del paso ${i + 1}: ${step.title.toLowerCase()}`}
                        placeholder="blur"
                        sizes="(min-width: 1280px) 400px, (min-width: 1024px) 31vw, (min-width: 640px) 46vw, 82vw"
                        className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                      />
                      <span className="absolute left-3 top-3 flex size-8 items-center justify-center rounded-full bg-mt-950/85 font-mono text-xs font-bold ring-1 ring-white/20">
                        {i + 1}
                      </span>
                    </div>
                    <div className="flex flex-1 flex-col p-5">
                      <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-mt-200">
                        Fase {phase.number} · {phase.name}
                      </p>
                      <h3 className="mt-2 font-heading text-lg font-bold leading-snug">{step.title}</h3>
                      <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-white/65">{step.text}</p>
                      <span className="mt-auto inline-flex items-center gap-1.5 pt-4 text-sm font-semibold text-white/85 group-hover:text-white">
                        Ver este paso en 3D
                        <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden />
                      </span>
                    </div>
                  </Link>
                </Reveal>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
