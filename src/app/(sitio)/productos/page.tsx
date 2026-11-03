import type { Metadata } from "next";
import { ClipboardList, PackageCheck, ShieldCheck, Wrench } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { SubNav } from "@/components/layout/SubNav";
import { CtaBand } from "@/components/layout/CtaBand";
import { CategoryGrid } from "@/components/products/CategoryGrid";
import { getCatalog } from "@/lib/catalog";
import { PRODUCTS_HREF, categoryLink, trailFor } from "@/lib/routes";

export const metadata: Metadata = {
  title: "Productos",
  description:
    "Balanzas industriales, básculas de camiones y software de pesaje METTLER TOLEDO en Bolivia, con instalación, calibración acreditada y soporte técnico local.",
  alternates: { canonical: "/productos" },
};

const ASSURANCES = [
  { icon: ShieldCheck, title: "Representante exclusivo", text: "Equipos originales METTLER TOLEDO a través de su representante oficial." },
  { icon: PackageCheck, title: "Asesoría y dimensionamiento", text: "Le ayudamos a elegir la capacidad, la resolución y la protección adecuadas." },
  { icon: Wrench, title: "Instalación y soporte", text: "Puesta en marcha, mantenimiento y repuestos con técnicos locales." },
  { icon: ClipboardList, title: "Una sola cotización", text: "Arme su lista con varios equipos y reciba una propuesta completa." },
];

export default async function ProductsPage() {
  const catalog = await getCatalog();
  return (
    <main>
      <PageHeader
        trail={trailFor(PRODUCTS_HREF)}
        eyebrow="Catálogo"
        title="Productos METTLER TOLEDO"
        description="Tecnología de pesaje de vanguardia adaptada a los procesos más exigentes, con el respaldo local de Métrica en cada etapa."
        nav={<SubNav links={catalog.categories.map(categoryLink)} label="Tipos de producto" />}
      />

      <section className="bg-bone-100 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* La primera tarjeta es lo más grande en pantalla al llegar (sobre todo en el celular) */}
          <CategoryGrid catalog={catalog} preloadFirst />

          <ul className="mt-16 grid gap-8 border-t border-bone-300 pt-12 sm:grid-cols-2 lg:grid-cols-4">
            {ASSURANCES.map(({ icon: Icon, title, text }) => (
              <li key={title}>
                <Icon className="size-5 text-ink-700" aria-hidden />
                <h2 className="mt-3 font-heading text-base font-bold text-ink-950">{title}</h2>
                <p className="mt-1.5 text-sm leading-relaxed text-neutral-600">{text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <CtaBand />
    </main>
  );
}
