import type { Metadata } from "next";
import { ArrowUpRight, MapPin, Phone } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { CtaBand } from "@/components/layout/CtaBand";
import { Reveal } from "@/components/animations/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { GridPattern, SunGlow } from "@/components/ui/Backdrop";
import { IndustryChips, MettlerToledoCard, Stats } from "@/components/sections/About";
import { ACCREDITATION, BRANDS, COMPANY, OFFICES, mapsUrl } from "@/content/company";
import { trailFor } from "@/lib/routes";

export const metadata: Metadata = {
  title: "Nosotros",
  description: `Desde ${COMPANY.founded}, Métrica Ltda. brinda soluciones integrales en sistemas de pesaje y metrología de masa en Bolivia.`,
  alternates: { canonical: "/nosotros" },
};

const HISTORY = [
  {
    mark: String(COMPANY.founded),
    title: "Nace Métrica Ltda.",
    text: "Comenzamos con servicios de mantenimiento, reparación y calibración de balanzas para los sectores farmacéutico, alimenticio y minero, y nos establecimos como proveedores de confianza.",
  },
  {
    mark: String(ACCREDITATION.since),
    title: "Primer laboratorio de balanzas acreditado del país",
    text: "Nuestro laboratorio de calibración se acreditó ante la Dirección Técnica de Acreditación del IBMETRO: fuimos la primera empresa de Bolivia en lograrlo.",
  },
  {
    mark: "Alianza",
    title: "Representación de METTLER TOLEDO",
    text: "Ante el crecimiento de la industria nacional ampliamos nuestra cartera, y Mettler Toledo Int. Inc. nos confió la distribución de su línea de pesaje industrial en Bolivia.",
  },
  {
    mark: "Hoy",
    title: "Soluciones integrales de pesaje",
    text: `Asesoramos, dimensionamos, proveemos e instalamos equipos, con servicio posventa y un laboratorio acreditado bajo la ${ACCREDITATION.standard}.`,
  },
];

const PRINCIPLES = [
  { label: "Misión", text: COMPANY.mission },
  { label: "Visión", text: COMPANY.vision },
  {
    label: "Principio: calidad",
    text: "Desarrollar un proceso de mejora continua en todas nuestras actividades para lograr la plena satisfacción de nuestros clientes.",
  },
];

export default function AboutPage() {
  return (
    <main>
      <PageHeader
        trail={trailFor("/nosotros")}
        eyebrow="Nosotros"
        title={`Expertos en sistemas de pesaje desde ${COMPANY.founded}`}
        description="Somos un equipo de profesionales que brinda soluciones integrales en sistemas de pesaje y metrología de masa, con la satisfacción de nuestros clientes como compromiso cotidiano."
        aside={<Stats />}
      />

      {/* ── Historia ── */}
      <section className="bg-white py-16 sm:py-24">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-12 lg:px-8">
          <Reveal className="lg:col-span-4">
            <SectionHeading eyebrow="Historia" title="Nuestra trayectoria" className="lg:sticky lg:top-28" />
          </Reveal>
          <ol className="relative border-l border-neutral-200 lg:col-span-7 lg:col-start-6">
            {HISTORY.map((item, i) => (
              <li key={item.title} className="relative pb-12 pl-8 last:pb-0 sm:pl-10">
                <span aria-hidden className="absolute -left-[5px] top-1.5 size-2.5 rounded-full bg-sun-400 ring-4 ring-sun-400/20" />
                <Reveal delay={i * 0.04}>
                  <p className="font-mono text-sm font-semibold text-ink-500">{item.mark}</p>
                  <h3 className="mt-2 font-heading text-xl font-bold text-ink-950">{item.title}</h3>
                  <p className="mt-2 leading-relaxed text-neutral-600">{item.text}</p>
                </Reveal>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── Misión, visión y principios ── */}
      <section className="border-y border-neutral-200 bg-neutral-50 py-16 sm:py-20">
        <ul className="mx-auto grid max-w-7xl px-4 sm:px-6 md:grid-cols-3 lg:px-8">
          {PRINCIPLES.map((item, i) => (
            <li key={item.label} className="md:border-l md:border-neutral-200 md:px-8 md:first:border-l-0 md:first:pl-0">
              <Reveal delay={i * 0.06} className="py-6 md:py-0">
                <p className="font-mono text-xs uppercase tracking-[0.2em] text-ink-600">{item.label}</p>
                <p className="mt-4 font-heading text-xl font-bold leading-snug text-ink-950">{item.text}</p>
              </Reveal>
            </li>
          ))}
        </ul>
      </section>

      {/* ── Representaciones e industrias ── */}
      <section data-header-theme="dark" className="relative isolate overflow-hidden bg-ink-950 py-16 text-white sm:py-24">
        <GridPattern className="[mask-image:radial-gradient(ellipse_at_top_left,black,transparent_65%)]" />
        <SunGlow className="-left-64 -top-72" />
        <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8">
          <Reveal>
            <SectionHeading
              tone="dark"
              eyebrow="Representaciones"
              title="Las marcas que respaldan nuestras soluciones"
              description="Además de la representación exclusiva de METTLER TOLEDO, somos distribuidores autorizados de:"
            />
            <ul className="mt-6 flex flex-wrap gap-2.5">
              {BRANDS.authorized.map((brand) => (
                <li key={brand.name}>
                  <a
                    href={brand.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.06] px-4 py-2 text-sm font-semibold transition-colors hover:border-white/35"
                  >
                    {brand.name} <ArrowUpRight className="size-3.5 text-white/50" aria-hidden />
                  </a>
                </li>
              ))}
            </ul>
            <h3 className="mt-12 font-heading text-lg font-bold">Sectores que atendemos</h3>
            <div className="mt-4">
              <IndustryChips />
            </div>
          </Reveal>
          <Reveal delay={0.08} className="lg:pt-2">
            <MettlerToledoCard />
          </Reveal>
        </div>
      </section>

      {/* ── Oficinas ── */}
      <section className="bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <SectionHeading eyebrow="Oficinas" title="Dónde encontrarnos" />
          </Reveal>
          <ul className="mt-10 grid gap-5 md:grid-cols-2">
            {OFFICES.map((office) => (
              <li key={office.city} className="rounded-3xl border border-neutral-200 p-6 sm:p-8">
                <h3 className="font-heading text-xl font-bold text-ink-950">{office.city}</h3>
                <a
                  href={mapsUrl(office)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 flex gap-3 text-sm leading-relaxed text-neutral-600 transition-colors hover:text-ink-950"
                >
                  <MapPin className="mt-0.5 size-4 shrink-0 text-ink-500" aria-hidden />
                  <address className="not-italic">{office.address.join(", ")}</address>
                </a>
                <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-neutral-600">
                  {office.phones.map((phone) => (
                    <li key={phone.number}>
                      <a href={`tel:${phone.number}`} className="inline-flex items-center gap-2 transition-colors hover:text-ink-950">
                        <Phone className="size-4 text-ink-500" aria-hidden />
                        {phone.display}
                      </a>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <CtaBand />
    </main>
  );
}
