import Image from "next/image";
import type { CatalogImage } from "@/content/catalog";
import { ProductVisual } from "./ProductVisual";

/**
 * Imagen de la cabecera de una categoría. Un equipo recortado flota sobre un foco de luz. Una foto
 * va en un marco redondeado bajo el texto; en escritorio sale del flujo y ocupa todo el lado derecho
 * de la cabecera (PageHeader es `relative isolate`), fundiéndose con el azul hacia el texto. Es la
 * misma imagen en ambos casos: se descarga una sola vez.
 */
export function CategoryVisual({ image }: { image: CatalogImage }) {
  if (!image.photo) return <ProductVisual image={image} alt="" preload className="mx-auto max-w-md" />;

  return (
    <div className="relative aspect-[4/3] overflow-hidden rounded-[2rem] shadow-[0_40px_90px_-30px_rgba(0,0,0,0.85)] ring-1 ring-white/15 lg:absolute lg:inset-y-3 lg:right-3 lg:-z-10 lg:aspect-auto lg:w-[58%] lg:shadow-none lg:ring-0 lg:[mask-image:linear-gradient(to_right,transparent,rgb(0_0_0/.35)_30%,black_60%)]">
      <Image src={image.src} alt="" fill preload sizes="(min-width: 1024px) 58vw, 100vw" className="object-cover" />
      {/* Sombra al pie en el marco; en escritorio, también arriba, bajo el menú */}
      <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-mt-900/40 via-transparent to-transparent lg:from-mt-800/60 lg:to-mt-800/40" />
    </div>
  );
}
