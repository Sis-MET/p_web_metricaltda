import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { AddToQuoteButton } from "./AddToQuoteButton";
import { formatCapacity, productHref, type ProductSummary } from "@/content/catalog";
import { cn, compact } from "@/lib/utils";
import { fitClass } from "./fit";

/** Tarjeta de catálogo: toda la tarjeta lleva a la ficha; el botón agrega a la cotización. */
export function ProductCard({ product }: { product: ProductSummary }) {
  const specs = compact([product.capacity && formatCapacity(product.capacity), product.protection]);

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-neutral-200/80 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-[translate,box-shadow,border-color] duration-500 ease-out-expo hover:-translate-y-1 hover:border-neutral-300 hover:shadow-[0_24px_48px_-24px_rgba(0,0,0,0.25)]">
      <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-b from-neutral-100 to-white">
        {!product.image.photo && <div aria-hidden className="absolute inset-x-10 bottom-5 h-8 rounded-[50%] bg-ink-950/10 blur-xl" />}
        <Image
          src={product.image.src}
          alt={`${product.type} ${product.model}`}
          fill
          sizes="(min-width: 1280px) 300px, (min-width: 1024px) 30vw, (min-width: 640px) 45vw, 90vw"
          // Las fotos vienen recortadas al borde del equipo: alineadas abajo, todas se apoyan en la sombra
          className={cn(fitClass(product.image, "object-bottom p-8"), "origin-bottom transition-transform duration-700 ease-out-expo group-hover:scale-[1.03]")}
        />
        <span className="absolute left-4 top-4 rounded-full border border-neutral-200/80 bg-white/90 px-3 py-1 text-xs font-semibold text-ink-800">
          {product.type}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-heading text-xl font-bold text-ink-950">
          {/* El enlace se estira sobre toda la tarjeta */}
          <Link href={productHref(product)} className="after:absolute after:inset-0">
            {product.model}
          </Link>
        </h3>
        <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-neutral-600">{product.summary}</p>

        {specs.length > 0 && (
          <ul className="mt-4 flex flex-wrap gap-1.5" aria-label="Datos principales">
            {specs.map((spec) => (
              <li key={spec} className="rounded-md bg-neutral-100 px-2 py-1 font-mono text-[11px] font-medium text-ink-700">
                {spec}
              </li>
            ))}
          </ul>
        )}

        <div className="mt-auto flex items-center justify-between pt-5">
          <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-800">
            Ver ficha
            <ArrowRight className="size-4 transition-transform duration-500 ease-out-expo group-hover:translate-x-1" aria-hidden />
          </span>
          <AddToQuoteButton slug={product.slug} model={product.model} variant="icon" className="relative z-10" />
        </div>
      </div>
    </article>
  );
}
