import type { Metadata } from "next";
import { BriefcaseBusiness, MapPin } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { SubNav } from "@/components/layout/SubNav";
import { FormSection } from "@/components/forms/FormSection";
import { VACANCIES } from "@/content/careers";
import { trailFor } from "@/lib/routes";

const HREF = "/contacto/trabaja-con-nosotros";

export const metadata: Metadata = {
  title: "Trabaja con nosotros",
  description: "Forme parte del equipo de Métrica Ltda.: envíenos su hoja de vida para nuestras vacantes y futuras oportunidades.",
  alternates: { canonical: HREF },
};

function Vacancies() {
  return (
    <div className="rounded-[2rem] border border-neutral-200 bg-white p-6 sm:p-8">
      <h3 className="flex items-center gap-2.5 font-heading text-lg font-bold text-ink-950">
        <BriefcaseBusiness className="size-5 text-ink-700" aria-hidden />
        Vacantes
      </h3>
      {VACANCIES.length > 0 ? (
        <ul className="mt-5 divide-y divide-neutral-200">
          {VACANCIES.map((vacancy) => (
            <li key={`${vacancy.title}-${vacancy.city}`} className="py-4 first:pt-0">
              <p className="font-semibold text-ink-950">{vacancy.title}</p>
              <p className="mt-0.5 inline-flex items-center gap-1.5 text-xs text-neutral-500">
                <MapPin className="size-3.5" aria-hidden /> {vacancy.city}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-neutral-600">{vacancy.description}</p>
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-4 space-y-3 text-sm leading-relaxed text-neutral-600">
          <p className="font-medium text-ink-950">No hay vacantes abiertas en este momento.</p>
          <p>
            Estamos en constante crecimiento: envíenos su hoja de vida y le tendremos en cuenta cuando se abra una vacante
            acorde a su perfil.
          </p>
        </div>
      )}
    </div>
  );
}

export default function CareersPage() {
  return (
    <main>
      <PageHeader
        trail={trailFor(HREF)}
        eyebrow="Contacto"
        title="Únase a nuestro equipo"
        description="Descubra su potencial y forme parte de un equipo dinámico, profesional y orientado a nuevos desafíos."
        nav={<SubNav section="/contacto" label="Contacto" />}
      />
      <FormSection
        id="formulario"
        form="postulacion"
        eyebrow="Postulación"
        title="Envíenos su hoja de vida"
        description="Atenderemos su postulación lo antes posible."
        aside={<Vacancies />}
      />
    </main>
  );
}
