import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Box } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/layout/PageHeader";
import { SubNav } from "@/components/layout/SubNav";
import { CtaBand } from "@/components/layout/CtaBand";
import { Reveal } from "@/components/animations/Reveal";
import { ProductBrowser, ProductGrid } from "@/components/products/ProductBrowser";
import { ProductVisual } from "@/components/products/ProductVisual";
import { categoryHref, toSummary } from "@/content/catalog";
import { findCategory, getCatalog, productsIn } from "@/lib/catalog";
import { PRODUCTS_HREF, categoryLink, trailFor } from "@/lib/routes";

type Props = { params: Promise<{ categoria: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const category = findCategory(await getCatalog(), (await params).categoria);
  if (!category) return {};
  return {
    title: `${category.name} en Bolivia`,
    description: category.description,
    alternates: { canonical: categoryHref(category.slug) },
    openGraph: { images: [category.image.src] },
  };
}

export default async function CategoryPage({ params }: Props) {
  const catalog = await getCatalog();
  const category = findCategory(catalog, (await params).categoria);
  if (!category) notFound();

  const products = productsIn(catalog, category.slug).map(toSummary);

  return (
    <main>
      <PageHeader
        trail={[...trailFor(PRODUCTS_HREF), categoryLink(category)]}
        eyebrow="Productos"
        title={category.name}
        description={category.description}
        aside={<ProductVisual image={category.image} alt="" preload className="mx-auto max-w-md" />}
        nav={<SubNav links={catalog.categories.map(categoryLink)} label="Tipos de producto" />}
      />

      <section className="border-b border-neutral-200 bg-white py-12">
        <ul className="mx-auto grid max-w-7xl gap-8 px-4 sm:grid-cols-3 sm:px-6 lg:px-8">
          {category.highlights.map((highlight, i) => (
            <li key={highlight.title} className="flex gap-4">
              <span className="font-mono text-xs font-semibold text-ink-400">{String(i + 1).padStart(2, "0")}</span>
              <div>
                <h2 className="font-heading text-base font-bold text-ink-950">{highlight.title}</h2>
                <p className="mt-1.5 text-sm leading-relaxed text-neutral-600">{highlight.text}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section aria-label="Modelos" className="bg-neutral-50 py-14 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {category.demo && (
            <Reveal>
              <Link
                href={category.demo.href}
                // El demo se abre encima de la página: sin saltar al inicio
                scroll={false}
                className="group mb-10 flex items-center gap-4 rounded-2xl border border-neutral-200 bg-white p-4 transition-colors hover:border-neutral-300 sm:p-5"
              >
                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-ink-900 text-white">
                  <Box className="size-5" aria-hidden />
                </span>
                <span className="text-sm font-semibold text-ink-900 sm:text-base">{category.demo.label}</span>
                <ArrowRight className="ml-auto size-4 shrink-0 text-ink-700 transition-transform group-hover:translate-x-1" aria-hidden />
              </Link>
            </Reveal>
          )}

          {products.length > 1 ? (
            // El explorador lee los filtros de la URL; mientras tanto se muestra el catálogo completo
            <Suspense fallback={<ProductGrid products={products} />}>
              <ProductBrowser products={products} lines={category.lines} />
            </Suspense>
          ) : products.length === 1 ? (
            <ProductGrid products={products} />
          ) : (
            <Reveal className="rounded-3xl border border-neutral-200 bg-white px-6 py-12 text-center sm:px-12">
              <h2 className="font-heading text-2xl font-bold text-ink-950">Soluciones a la medida de su operación</h2>
              <p className="mx-auto mt-3 max-w-xl text-neutral-600">
                Configuramos cada solución según sus equipos y procesos. Cuéntenos qué necesita y le proponemos la
                adecuada.
              </p>
              <Button asChild className="mt-7">
                <Link href="/contacto">
                  Consultar a un asesor <ArrowRight />
                </Link>
              </Button>
            </Reveal>
          )}
        </div>
      </section>

      <CtaBand />
    </main>
  );
}
