import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { SubNav } from "@/components/layout/SubNav";
import { FormSection } from "@/components/forms/FormSection";
import { trailFor } from "@/lib/routes";

export const metadata: Metadata = {
  title: "Contacto",
  description: "Escríbanos para recibir asesoría en sistemas de pesaje, calibración y soporte técnico. Oficinas en La Paz y Santa Cruz.",
  alternates: { canonical: "/contacto" },
};

export default function ContactPage() {
  return (
    <main>
      <PageHeader
        trail={trailFor("/contacto")}
        eyebrow="Contacto"
        title="Estamos aquí para ayudarle"
        description="Soluciones integrales en sistemas de pesaje: escríbanos y resolvemos su consulta."
        nav={<SubNav section="/contacto" label="Contacto" />}
      />
      <FormSection
        id="formulario"
        form="contacto"
        eyebrow="Escríbanos"
        title="Hablemos de su proyecto"
        description="Cuéntenos qué necesita y un asesor le responderá a la brevedad. Para cotizar varios equipos, use la lista de cotización."
      />
    </main>
  );
}
