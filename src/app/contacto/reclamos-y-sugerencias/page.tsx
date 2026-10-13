import type { Metadata } from "next";
import { ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { SubNav } from "@/components/layout/SubNav";
import { FormSection } from "@/components/forms/FormSection";
import { ContactCard } from "@/components/layout/ContactCard";
import { ACCREDITATION } from "@/content/company";
import { trailFor } from "@/lib/routes";

const HREF = "/contacto/reclamos-y-sugerencias";

export const metadata: Metadata = {
  title: "Reclamos y sugerencias",
  description: "Presente un reclamo o una sugerencia sobre nuestros productos y servicios. Le damos un número de seguimiento.",
  alternates: { canonical: HREF },
};

const NEXT_STEPS = [
  { title: "Registro", text: "Su mensaje queda registrado con un número de seguimiento." },
  { title: "Análisis", text: "El responsable del área revisa el caso y, si hace falta, le contacta para más detalles." },
  { title: "Respuesta", text: "Le informamos el resultado y las acciones tomadas." },
];

function NextSteps() {
  return (
    <div className="rounded-[2rem] border border-neutral-200 bg-white p-6 sm:p-8">
      <h3 className="font-heading text-lg font-bold text-ink-950">¿Qué pasa después?</h3>
      <ol className="mt-5 space-y-4">
        {NEXT_STEPS.map((step, i) => (
          <li key={step.title} className="flex gap-4">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-ink-900 font-mono text-xs font-semibold text-white">
              {i + 1}
            </span>
            <div>
              <p className="text-sm font-semibold text-ink-950">{step.title}</p>
              <p className="mt-0.5 text-sm leading-relaxed text-neutral-600">{step.text}</p>
            </div>
          </li>
        ))}
      </ol>
      {/* La NB/ISO/IEC 17025 exige al laboratorio un proceso documentado de quejas */}
      <p className="mt-6 flex gap-3 border-t border-neutral-200 pt-5 text-xs leading-relaxed text-neutral-500">
        <ShieldCheck className="size-4 shrink-0 text-ink-600" aria-hidden />
        Los reclamos sobre servicios de calibración se gestionan según el procedimiento de quejas del laboratorio acreditado
        ({ACCREDITATION.standard}).
      </p>
    </div>
  );
}

export default function ComplaintsPage() {
  return (
    <main>
      <PageHeader
        trail={trailFor(HREF)}
        eyebrow="Contacto"
        title="Reclamos y sugerencias"
        description="Su opinión es muy importante para nosotros. Si tiene una sugerencia o desea presentar un reclamo, hágalo aquí: nos ayuda a mejorar y a brindarle el mejor servicio posible."
        nav={<SubNav section="/contacto" label="Contacto" />}
      />
      <FormSection
        id="formulario"
        form="reclamo"
        eyebrow="Formulario"
        title="Registre su reclamo o sugerencia"
        description="Mientras más detalles nos dé, más rápido podremos atenderlo."
        aside={
          <>
            <NextSteps />
            <ContactCard title="¿Prefiere hablar con nosotros?" />
          </>
        }
      />
    </main>
  );
}
