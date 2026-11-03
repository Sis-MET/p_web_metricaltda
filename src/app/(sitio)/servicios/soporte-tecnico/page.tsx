import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, MessageCircle, Truck, Microscope } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/layout/PageHeader";
import { SubNav } from "@/components/layout/SubNav";
import { Reveal } from "@/components/animations/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { FormSection } from "@/components/forms/FormSection";
import { SupportDiagnostic } from "@/components/illustrations/SupportDiagnostic";
import { SERVICES } from "@/content/services";
import { whatsappUrl } from "@/content/company";
import { trailFor } from "@/lib/routes";

const SERVICE = SERVICES.soporte;

export const metadata: Metadata = {
  title: "Soporte técnico de balanzas y básculas de camiones",
  description:
    "Instalación, mantenimiento preventivo y correctivo, renovación y actualización de balanzas industriales y básculas de camiones en Bolivia.",
  alternates: { canonical: SERVICE.href },
};

const SCOPES = [
  {
    code: "STAC",
    name: "Alta capacidad",
    subtitle: "Básculas de camiones",
    icon: Truck,
    items: [
      {
        title: "Instalación profesional",
        text: "Sistemas preparados para el tráfico intenso, con el personal y los recursos técnicos para una instalación rápida y fiable.",
      },
      {
        title: "Planes de mantenimiento",
        text: "Planes personalizados que aseguran la continuidad, minimizan las paradas y evitan reparaciones costosas.",
      },
      {
        title: "Limpieza y renovación",
        text: "Recuperamos la funcionalidad original de básculas deterioradas por el tráfico y el ambiente.",
      },
      {
        title: "Actualización de componentes",
        text: "Celdas de carga, terminales y software, sin importar el fabricante de su báscula.",
      },
    ],
  },
  {
    code: "STIL",
    name: "Industrial y laboratorio",
    subtitle: "Balanzas y plataformas",
    icon: Microscope,
    items: [
      {
        title: "Instalación y configuración",
        text: "Configuramos el equipo según sus necesidades para obtener mediciones fiables desde el primer día.",
      },
      {
        title: "Capacitación de usuarios",
        text: "Durante la instalación, sus operadores se familiarizan con el equipo y lo usan correctamente desde el inicio.",
      },
      {
        title: "Mantenimiento y reparación",
        text: "Mantenimiento preventivo y reparaciones que evitan desviaciones de tolerancia y problemas de calidad en su producto.",
      },
      {
        title: "Cobertura todo incluido",
        text: "Servicio prioritario a un precio preferencial cuando la disponibilidad del equipo es crítica para su proceso.",
      },
    ],
  },
];

export default function SupportPage() {
  return (
    <main>
      <PageHeader
        trail={trailFor(SERVICE.href)}
        eyebrow={SERVICE.label}
        title="Soporte técnico para balanzas y básculas"
        description="Amplia experiencia en la instalación y el mantenimiento profesional de básculas y balanzas: resultados precisos desde el primer día y equipos operativos incluso en uso intensivo."
        actions={
          <>
            <Button asChild size="lg" variant="light">
              <Link href="#solicitar">
                {SERVICE.cta} <ArrowRight />
              </Link>
            </Button>
            <Button asChild size="lg" variant="glass">
              <a href={whatsappUrl("Hola, necesito soporte técnico para un equipo de pesaje.")} target="_blank" rel="noopener noreferrer">
                <MessageCircle /> WhatsApp
              </a>
            </Button>
          </>
        }
        aside={<SupportDiagnostic />}
        nav={<SubNav section="/servicios" label="Servicios" />}
      />

      <section className="bg-white py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal className="max-w-2xl">
            <SectionHeading
              eyebrow="Alcances"
              title="Del laboratorio a la báscula de camiones"
              description="Planes de mantenimiento preventivo y servicios de renovación que preservan la funcionalidad de sus sistemas, prolongan su vida útil y protegen su inversión."
            />
          </Reveal>

          <div className="mt-14 grid gap-16 lg:grid-cols-2 lg:gap-0">
            {SCOPES.map((scope, i) => (
              <Reveal key={scope.code} delay={i * 0.06} className={i === 0 ? "lg:pr-14" : "lg:border-l lg:border-neutral-200 lg:pl-14"}>
                <div className="flex items-center gap-4">
                  <span className="flex size-12 items-center justify-center rounded-2xl bg-ink-900 text-white">
                    <scope.icon className="size-5" aria-hidden />
                  </span>
                  <div>
                    <p className="font-mono text-xs uppercase tracking-[0.2em] text-ink-600">
                      {scope.code} · {scope.subtitle}
                    </p>
                    <h3 className="mt-1 font-heading text-2xl font-bold text-ink-950">{scope.name}</h3>
                  </div>
                </div>
                <ul className="mt-8 divide-y divide-neutral-200 border-y border-neutral-200">
                  {scope.items.map((item) => (
                    <li key={item.title} className="py-5">
                      <h4 className="font-heading text-base font-bold text-ink-950">{item.title}</h4>
                      <p className="mt-1.5 text-sm leading-relaxed text-neutral-600">{item.text}</p>
                    </li>
                  ))}
                </ul>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <FormSection
        form="soporte"
        eyebrow="Solicitud"
        title="Cuéntenos qué le pasa a su equipo"
        description="Con la marca, el modelo y una descripción del problema, un técnico evalúa el caso y coordina la atención. Si puede, adjunte fotos."
      />
    </main>
  );
}
