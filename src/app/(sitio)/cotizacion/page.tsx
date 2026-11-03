import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { QuoteRequest } from "@/components/quote/QuoteRequest";
import { toSummary } from "@/content/catalog";
import { getCatalog } from "@/lib/catalog";
import { QUOTE_HREF } from "@/lib/routes";

export const metadata: Metadata = {
  title: "Solicitar cotización",
  description: "Arme su lista de equipos METTLER TOLEDO y reciba una cotización completa de Métrica Ltda.",
  alternates: { canonical: QUOTE_HREF },
  // La lista vive en el navegador de cada visitante: no tiene sentido indexarla
  robots: { index: false },
};

export default async function QuotePage() {
  const { products } = await getCatalog();
  return (
    <main>
      <PageHeader
        trail={[{ label: "Solicitar cotización", href: QUOTE_HREF }]}
        eyebrow="Cotización"
        title="Solicitar cotización"
        description="Revise los equipos de su lista, ajuste las cantidades y envíenos sus datos: un asesor le responderá con una propuesta completa."
      />
      <div className="bg-neutral-50 py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <QuoteRequest products={products.map(toSummary)} />
        </div>
      </div>
    </main>
  );
}
