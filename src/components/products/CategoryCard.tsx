import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Spotlight } from "@/components/animations/Spotlight";
import { categoryHref, type Category } from "@/content/catalog";
import { cn } from "@/lib/utils";
import { fitClass } from "./fit";

/**
 * Tarjeta de un tipo de producto (inicio y catálogo). `count`: modelos publicados.
 * `preload`: su imagen es la principal de la página.
 */
export function CategoryCard({ category, count, preload }: { category: Category; count: number; preload?: boolean }) {
  return (
    <Spotlight className="h-full rounded-3xl transition-transform duration-500 ease-out-expo hover:-translate-y-1">
      <Link
        href={categoryHref(category.slug)}
        className="group flex h-full flex-col overflow-hidden rounded-3xl border border-neutral-200/80 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-[box-shadow,border-color] duration-500 ease-out-expo hover:border-neutral-300 hover:shadow-[0_24px_48px_-24px_rgba(0,0,0,0.25)]"
      >
        <div className="relative aspect-[16/10] overflow-hidden bg-gradient-to-b from-neutral-100 to-white">
          {!category.image.photo && <div aria-hidden className="absolute inset-x-10 bottom-5 h-10 rounded-[50%] bg-ink-950/10 blur-xl" />}
          <Image
            src={category.image.src}
            alt=""
            fill
            sizes="(min-width: 1024px) 400px, (min-width: 640px) 50vw, 100vw"
            preload={preload}
            className={cn(fitClass(category.image, "p-7"), "transition-transform duration-700 ease-out-expo group-hover:scale-[1.03]")}
          />
          {count > 0 && (
            <span className="absolute left-4 top-4 rounded-full border border-neutral-200/80 bg-white/90 px-3 py-1 text-xs font-semibold text-ink-800">
              {count} {count === 1 ? "solución" : "modelos"}
            </span>
          )}
        </div>
        <div className="flex flex-1 flex-col p-6">
          <h3 className="font-heading text-xl font-bold text-ink-950">{category.name}</h3>
          <p className="mt-2 text-sm leading-relaxed text-neutral-600">{category.short}</p>
          <span className="mt-auto inline-flex items-center gap-1.5 pt-5 text-sm font-semibold text-ink-800">
            Ver {category.name.toLowerCase()}
            <ArrowRight className="size-4 transition-transform duration-500 ease-out-expo group-hover:translate-x-1" aria-hidden />
          </span>
        </div>
      </Link>
    </Spotlight>
  );
}
