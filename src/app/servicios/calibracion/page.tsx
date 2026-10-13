import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/layout/PageHeader";
import { SubNav } from "@/components/layout/SubNav";
import { Reveal } from "@/components/animations/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ProcessSteps } from "@/components/ui/ProcessSteps";
import { FormSection } from "@/components/forms/FormSection";
import { AccreditationSeal } from "@/components/services/Accreditation";
import { CalibrationChart } from "@/components/illustrations/CalibrationChart";
import { ACCREDITATION } from "@/content/company";
import { SERVICES } from "@/content/services";
import { trailFor } from "@/lib/routes";

const SERVICE = SERVICES.calibracion;

export const metadata: Metadata = {
  title: "Calibración de balanzas acreditada",
  description: `Laboratorio de calibración de balanzas y pesas patrón acreditado por IBMETRO según ${ACCREDITATION.standard} (${ACCREDITATION.code}).`,
  alternates: { canonical: SERVICE.href },
};

const ACCREDITATION_FACTS = [
  { label: "Acreditación", value: ACCREDITATION.code },
  { label: "Norma", value: ACCREDITATION.standard },
  { label: "Organismo", value: ACCREDITATION.body },
  { label: "Alcance", value: ACCREDITATION.scope },
  { label: "Acreditado desde", value: String(ACCREDITATION.since) },
];

const REASONS = [
  {
    title: "Calidad y confiabilidad",
    text: `Procesos que cumplen la ${ACCREDITATION.standard} y aseguran la calidad de cada medición.`,
  },
  {
    title: "Cumplimiento normativo",
    text: "Las calibraciones de laboratorios acreditados son reconocidas como oficiales por el Estado boliviano.",
  },
  {
    title: "Resultados verificables",
    text: "Resultados trazables y confiables, que respaldan sus decisiones y sus auditorías de calidad.",
  },
  {
    title: "Evaluación independiente",
    text: "Una entidad competente evaluó y aprobó el laboratorio, que mantiene esos estándares en cada servicio.",
  },
  {
    title: "Técnicos especializados",
    text: "Personal capacitado y con experiencia en una amplia gama de instrumentos de pesaje.",
  },
];

const STEPS = [
  { title: "Solicitud", text: "Envíenos el formulario con la lista de equipos a calibrar." },
  { title: "Programación", text: "Coordinamos con usted la fecha y la modalidad del servicio." },
  { title: "Calibración", text: "Calibramos sus equipos con procedimientos y patrones del laboratorio acreditado." },
  { title: "Certificado", text: "Recibe el certificado de calibración con los resultados y su incertidumbre." },
];

export default function CalibrationPage() {
  return (
    <main>
      <PageHeader
        trail={trailFor(SERVICE.href)}
        eyebrow={SERVICE.label}
        title="Calibración acreditada de balanzas y pesas patrón"
        description={SERVICE.description}
        actions={
          <>
            <Button asChild size="lg" variant="light">
              <Link href="#solicitar">
                {SERVICE.cta} <ArrowRight />
              </Link>
            </Button>
            <Button asChild size="lg" variant="glass">
              <a href={ACCREDITATION.certificateUrl} target="_blank" rel="noopener noreferrer">
                Certificado de acreditación <ArrowUpRight />
              </a>
            </Button>
          </>
        }
        aside={<CalibrationChart />}
        nav={<SubNav section="/servicios" label="Servicios" />}
      />

      {/* ── Acreditación ── */}
      <section className="bg-white py-16 sm:py-24">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-12 lg:gap-16 lg:px-8">
          <Reveal className="lg:col-span-6">
            <SectionHeading
              eyebrow="Acreditación"
              title="El primer laboratorio de calibración de balanzas acreditado en Bolivia"
            />
            <div className="mt-6 space-y-4 leading-relaxed text-neutral-600">
              <p>
                En {ACCREDITATION.since}, Métrica se convirtió en la primera empresa de Bolivia en acreditar un laboratorio de
                calibración de balanzas, y durante una década fue el único organismo con ese respaldo en el país.
              </p>
              <p>
                Hoy el laboratorio sigue acreditado por la {ACCREDITATION.body} bajo la {ACCREDITATION.standard}: un
                compromiso constante con la calidad que fortalece la infraestructura de calidad de Bolivia.
              </p>
            </div>
            <AccreditationSeal className="mt-8" />
          </Reveal>

          <Reveal delay={0.06} className="lg:col-span-6">
            <dl className="divide-y divide-neutral-200 border-y border-neutral-200">
              {ACCREDITATION_FACTS.map((fact) => (
                <div key={fact.label} className="grid gap-1 py-4 sm:grid-cols-[10rem_1fr] sm:gap-4">
                  <dt className="text-sm text-neutral-500">{fact.label}</dt>
                  <dd className="text-sm font-medium text-ink-950">{fact.value}</dd>
                </div>
              ))}
            </dl>
            <a
              href={ACCREDITATION.verifyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-ink-800 underline-offset-4 hover:underline"
            >
              Verificar el alcance en el sitio de IBMETRO <ArrowUpRight className="size-4" aria-hidden />
            </a>
          </Reveal>
        </div>
      </section>

      {/* ── Por qué un laboratorio acreditado ── */}
      <section className="border-t border-neutral-200 bg-white pb-16 pt-16 sm:pb-24 sm:pt-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal className="max-w-2xl">
            <SectionHeading eyebrow="Beneficios" title="¿Por qué calibrar con un laboratorio acreditado?" />
          </Reveal>
          <ul className="mt-12 grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
            {REASONS.map((reason, i) => (
              <li key={reason.title}>
                <Reveal delay={i * 0.04}>
                  <span aria-hidden className="block h-0.5 w-8 rounded-full bg-sun-400" />
                  <h3 className="mt-4 font-heading text-lg font-bold text-ink-950">{reason.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-neutral-600">{reason.text}</p>
                </Reveal>
              </li>
            ))}
          </ul>

          <h2 className="mt-20 font-heading text-2xl font-bold text-ink-950 sm:text-3xl">Cómo funciona</h2>
          <ProcessSteps steps={STEPS} className="mt-8" />
        </div>
      </section>

      <FormSection
        form="calibracion"
        eyebrow="Solicitud"
        title="Solicite la calibración de sus equipos"
        description="Indíquenos qué equipos necesita calibrar. Si ya tiene nuestro formulario de calibración lleno, adjúntelo."
      />
    </main>
  );
}
