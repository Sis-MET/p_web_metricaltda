import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, BadgeCheck, MessageCircle, ShieldCheck, Wrench } from "lucide-react";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { CtaBand } from "@/components/layout/CtaBand";
import { Reveal } from "@/components/animations/Reveal";
import { Eyebrow } from "@/components/ui/SectionHeading";
import { JsonLd } from "@/components/seo/JsonLd";
import { AddToQuoteButton } from "@/components/products/AddToQuoteButton";
import { ProductGrid } from "@/components/products/ProductBrowser";
import { BrochureLink } from "@/components/products/BrochureLink";
import { AccreditationSeal } from "@/components/services/Accreditation";
import { BenchScaleDemo } from "@/components/demos/BenchScaleDemo";
import { getCategory, categoryHref } from "@/content/categories";
import { ENVIRONMENTS, FAMILIES, formatCapacity, productHref, productTitle, toSummary } from "@/content/catalog";
import { PRODUCTS, getProduct, relatedProducts } from "@/content/products";
import { SERVICES } from "@/content/services";
import { SITE_URL, whatsappUrl } from "@/content/company";
import { trailFor } from "@/lib/routes";
import { cn, compact } from "@/lib/utils";

type Props = { params: Promise<{ categoria: string; producto: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return PRODUCTS.map((product) => ({ categoria: product.category, producto: product.slug }));
}

async function load(params: Props["params"]) {
  const { categoria, producto } = await params;
  return getProduct(categoria, producto);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await load(params);
  if (!product) return {};
  return {
    title: `${productTitle(product)} METTLER TOLEDO`,
    description: product.summary,
    alternates: { canonical: productHref(product) },
    openGraph: { images: [product.image.src] },
  };
}

const ASSURANCES = [
  { icon: ShieldCheck, text: "Representantes exclusivos de METTLER TOLEDO en Bolivia" },
  { icon: BadgeCheck, text: "Laboratorio de calibración acreditado por IBMETRO" },
  { icon: Wrench, text: "Instalación, mantenimiento y repuestos con técnicos locales" },
];

export default async function ProductPage({ params }: Props) {
  const product = await load(params);
  const category = product && getCategory(product.category);
  if (!product || !category) notFound();

  const title = productTitle(product);
  const trail = [...trailFor(categoryHref(category.slug)), { label: product.model, href: productHref(product) }];
  const related = relatedProducts(product).map(toSummary);
  const whatsappMessage = `Hola, quisiera una cotización de la ${title}.`;

  const facts = compact([
    product.capacity && { label: "Capacidad", value: formatCapacity(product.capacity) },
    product.protection && { label: "Protección", value: product.protection },
    product.family && { label: "Línea", value: FAMILIES[product.family] },
  ]);

  return (
    <main>
      {/* ── Presentación ── */}
      <section className="bg-neutral-50 pb-14 pt-28 sm:pb-20 sm:pt-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Breadcrumbs trail={trail} tone="light" />

          <div className="mt-8 grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
            <div className="relative aspect-square overflow-hidden rounded-[2rem] border border-neutral-200/80 bg-gradient-to-b from-white to-neutral-100 sm:aspect-[4/3] lg:aspect-square">
              <div aria-hidden className="absolute inset-x-[20%] bottom-[10%] h-[8%] rounded-[50%] bg-ink-950/15 blur-2xl" />
              <Image
                src={product.image}
                alt={title}
                fill
                preload
                sizes="(min-width: 1024px) 600px, 100vw"
                className="object-contain p-10 sm:p-14"
              />
            </div>

            <div>
              <Eyebrow>METTLER TOLEDO · {product.type}</Eyebrow>
              <h1 className="mt-4 font-heading text-4xl font-extrabold leading-[1.05] tracking-tight text-ink-950 sm:text-5xl">
                {product.model}
              </h1>
              <p className="mt-5 text-lg leading-relaxed text-neutral-600">{product.summary}</p>

              {facts.length > 0 && (
                <dl
                  className={cn(
                    "mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-200",
                    // Una columna por dato: sin celdas vacías cuando hay menos de tres
                    facts.length >= 3 && "sm:grid-cols-3"
                  )}
                >
                  {facts.map((fact) => (
                    <div key={fact.label} className="bg-white px-4 py-3">
                      <dt className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">{fact.label}</dt>
                      <dd className="mt-1 font-mono text-sm font-semibold text-ink-950">{fact.value}</dd>
                    </div>
                  ))}
                </dl>
              )}

              {product.environments.length > 0 && (
                <ul className="mt-5 flex flex-wrap gap-2" aria-label="Entornos de trabajo">
                  {product.environments.map((env) => (
                    <li key={env} className="rounded-full border border-neutral-200 bg-white px-3 py-1 text-xs font-medium text-ink-700">
                      {ENVIRONMENTS[env]}
                    </li>
                  ))}
                </ul>
              )}

              <div className="mt-8 flex flex-col gap-4">
                <AddToQuoteButton slug={product.slug} model={product.model} />
                <div className="flex flex-wrap gap-x-6 gap-y-2">
                  <a
                    href={whatsappUrl(whatsappMessage)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-ink-800 underline-offset-4 hover:underline"
                  >
                    <MessageCircle className="size-4" aria-hidden />
                    Consultar por WhatsApp
                  </a>
                  {product.brochure && <BrochureLink brochure={product.brochure} model={product.model} variant="inline" />}
                </div>
              </div>

              <ul className="mt-8 space-y-2.5 border-t border-neutral-200 pt-6">
                {ASSURANCES.map(({ icon: Icon, text }) => (
                  <li key={text} className="flex items-center gap-3 text-sm text-neutral-700">
                    <Icon className="size-4 shrink-0 text-ink-600" aria-hidden />
                    {text}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── Descripción y ficha técnica ── */}
      <section className="bg-white py-16 sm:py-20">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-12 lg:gap-16 lg:px-8">
          <Reveal className="lg:col-span-6">
            <h2 className="font-heading text-2xl font-bold text-ink-950 sm:text-3xl">Descripción</h2>
            <p className="mt-4 leading-relaxed text-neutral-600">{product.description}</p>
            <h3 className="mt-10 font-heading text-lg font-bold text-ink-950">Características</h3>
            <ul className="mt-4 space-y-3">
              {product.features.map((feature) => (
                <li key={feature} className="flex gap-3 text-[15px] leading-relaxed text-neutral-700">
                  <span aria-hidden className="mt-2.5 h-px w-4 shrink-0 bg-sun-500" />
                  {feature}
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal delay={0.06} className="lg:col-span-6">
            <h2 className="font-heading text-2xl font-bold text-ink-950 sm:text-3xl">Especificaciones</h2>
            <dl className="mt-4 divide-y divide-neutral-200 border-y border-neutral-200">
              {product.specs.map((spec) => (
                <div key={spec.label} className="grid gap-1 py-3.5 sm:grid-cols-[11rem_1fr] sm:gap-4">
                  <dt className="text-sm text-neutral-500">{spec.label}</dt>
                  <dd className="text-sm font-medium text-ink-950">{spec.value}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-4 text-xs leading-relaxed text-neutral-500">
              Las capacidades y opciones exactas dependen del modelo. Un asesor le confirma la configuración adecuada para su
              aplicación.
            </p>
            {product.brochure && (
              <div className="mt-6">
                <BrochureLink brochure={product.brochure} model={product.model} variant="card" />
              </div>
            )}
          </Reveal>
        </div>
      </section>

      {product.demo === "bpa121" && (
        <BenchScaleDemo actions={<AddToQuoteButton slug={product.slug} model={product.model} tone="dark" />} />
      )}

      {/* ── Servicios para el equipo ── */}
      <section className="border-y border-neutral-200 bg-neutral-50 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal className="max-w-2xl">
            <Eyebrow>Respaldo Métrica</Eyebrow>
            <h2 className="mt-4 font-heading text-3xl font-extrabold leading-[1.1] tracking-tight text-ink-950 sm:text-4xl">
              Respaldo para su {product.model} después de la compra
            </h2>
          </Reveal>
          <div className="mt-10 grid gap-5 md:grid-cols-2">
            {[SERVICES.calibracion, SERVICES.soporte].map((service, i) => (
              <Reveal key={service.slug} delay={i * 0.06} className="h-full">
                <Link
                  href={service.href}
                  className="group flex h-full flex-col rounded-3xl border border-neutral-200 bg-white p-6 transition-[border-color,box-shadow] hover:border-neutral-300 hover:shadow-[0_24px_48px_-28px_rgba(0,0,0,0.3)] sm:p-8"
                >
                  <p className="font-mono text-xs uppercase tracking-[0.2em] text-ink-600">{service.label}</p>
                  <h3 className="mt-3 font-heading text-xl font-bold text-ink-950">{service.headline}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-neutral-600">{service.description}</p>
                  {service.slug === "calibracion" && <AccreditationSeal className="mt-6 self-start" />}
                  <span className="mt-auto inline-flex items-center gap-1.5 pt-6 text-sm font-semibold text-ink-800">
                    Conocer el servicio
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden />
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="bg-white py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
              <h2 className="font-heading text-2xl font-bold text-ink-950 sm:text-3xl">
                Otros modelos{product.family ? `: ${FAMILIES[product.family].toLowerCase()}` : ""}
              </h2>
              <Link
                href={categoryHref(category.slug)}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-800 underline-offset-4 hover:underline"
              >
                Ver todas las {category.name.toLowerCase()} <ArrowRight className="size-4" aria-hidden />
              </Link>
            </div>
            <ProductGrid products={related} />
          </div>
        </section>
      )}

      <CtaBand
        title={`¿Necesita la ${product.model} para su operación?`}
        description="Agréguela a su lista de cotización o escríbanos: le confirmamos la configuración, el plazo de entrega y la calibración."
        whatsappMessage={whatsappMessage}
      />

      {/* Móvil: acciones de compra siempre a mano mientras se lee la ficha */}
      <div className="sticky bottom-0 z-40 border-t border-neutral-200 bg-white px-4 py-3 lg:hidden">
        <div className="flex items-center gap-3">
          <AddToQuoteButton slug={product.slug} model={product.model} listLink={false} className="flex-1 [&>button]:w-full" />
          <a
            href={whatsappUrl(whatsappMessage)}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Consultar por WhatsApp"
            className="flex size-12 shrink-0 items-center justify-center rounded-full border border-neutral-200 text-ink-900"
          >
            <MessageCircle className="size-5" aria-hidden />
          </a>
        </div>
      </div>

      <JsonLd
        data={{
          "@type": "Product",
          name: title,
          model: product.model,
          description: product.description,
          image: `${SITE_URL}${product.image.src}`,
          category: category.name,
          brand: { "@type": "Brand", name: "METTLER TOLEDO" },
          url: `${SITE_URL}${productHref(product)}`,
        }}
      />
    </main>
  );
}
