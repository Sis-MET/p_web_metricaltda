import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { SubNav } from "@/components/layout/SubNav";
import { CtaBand } from "@/components/layout/CtaBand";
import { Reveal } from "@/components/animations/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Services } from "@/components/sections/Services";
import { ServiceCalendar } from "@/components/services/ServiceCalendar";
import { trailFor } from "@/lib/routes";

export const metadata: Metadata = {
  title: "Servicios de calibración y soporte técnico",
  description:
    "Calibración de balanzas y pesas patrón en laboratorio acreditado NB/ISO/IEC 17025:2018, y soporte técnico para balanzas industriales y básculas de camiones en Bolivia.",
  alternates: { canonical: "/servicios" },
};

export default function ServicesPage() {
  return (
    <main>
      <PageHeader
        trail={trailFor("/servicios")}
        eyebrow="Servicios"
        title="Servicios especializados"
        description="Más que vender equipos: garantizamos su funcionamiento óptimo y su cumplimiento normativo a largo plazo."
        nav={<SubNav section="/servicios" label="Servicios" />}
      />
      <Services heading={false} />

      <section className="border-t border-neutral-200 bg-neutral-50 py-16 sm:py-20">
        <div className="mx-auto grid max-w-7xl items-start gap-10 px-4 sm:px-6 lg:grid-cols-12 lg:px-8">
          <Reveal className="lg:col-span-5">
            <SectionHeading
              eyebrow="Agenda"
              title="Visitas técnicas programadas"
              description="Desde nuestras oficinas de La Paz y Santa Cruz coordinamos las visitas de calibración y soporte técnico en planta."
            />
          </Reveal>
          <Reveal delay={0.06} className="lg:col-span-6 lg:col-start-7">
            <ServiceCalendar />
          </Reveal>
        </div>
      </section>

      <CtaBand
        title="¿Necesita calibrar o reparar un equipo?"
        description="Escríbanos con la marca, el modelo y la capacidad de sus equipos y le respondemos con la propuesta y la fecha de atención."
        primary={{ label: "Contactar", href: "/contacto" }}
        whatsappMessage="Hola, quisiera información sobre los servicios de calibración y soporte técnico."
      />
    </main>
  );
}
