import { Reveal } from "@/components/animations/Reveal";
import { productsIn, type Catalog } from "@/lib/catalog";
import { cn } from "@/lib/utils";
import { CategoryCard } from "./CategoryCard";

/**
 * Las categorías publicadas, en tarjetas (inicio y catálogo). Con dos columnas y un número impar,
 * la última ocupa el ancho completo. `preloadFirst`: la primera imagen es la principal de la página.
 */
export function CategoryGrid({ catalog, preloadFirst = false }: { catalog: Catalog; preloadFirst?: boolean }) {
  const { categories } = catalog;
  return (
    <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {categories.map((category, i) => (
        <li
          key={category.slug}
          className={cn(i === categories.length - 1 && categories.length % 2 === 1 && "sm:col-span-2 lg:col-span-1")}
        >
          <Reveal delay={i * 0.06} className="h-full">
            <CategoryCard category={category} count={productsIn(catalog, category.slug).length} preload={preloadFirst && i === 0} />
          </Reveal>
        </li>
      ))}
    </ul>
  );
}
