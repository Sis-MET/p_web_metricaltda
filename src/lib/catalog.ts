import "server-only";
import { asc, eq } from "drizzle-orm";
import { unstable_cache } from "next/cache";
import { connection } from "next/server";
import { cache } from "react";
import {
  CATEGORY_DEMOS,
  PRODUCT_DEMOS,
  isEnvironment,
  type CatalogImage,
  type Category,
  type Product,
  type ProductDemoKey,
} from "@/content/catalog";
import { db, schema } from "@/lib/db";
import type { StoredImage } from "@/lib/db/schema";
import { fileUrl } from "@/lib/storage";

/**
 * El catálogo publicado, tal como lo ve el sitio. Se lee de la base al pedir una página (nunca al
 * compilar: el paquete se arma sin acceso a ella) y queda en caché hasta que el panel guarda un
 * cambio y la invalida (CATALOG_TAG). Es chico: se lee completo y se filtra en memoria.
 */

export const CATALOG_TAG = "catalogo";

export type Catalog = { categories: Category[]; products: Product[] };

const toImage = (stored: StoredImage | null): CatalogImage | null =>
  stored && { src: fileUrl(stored.key), width: stored.width, height: stored.height, photo: stored.opaque === true };

async function loadCatalog(): Promise<Catalog> {
  const { categories, productLines, products } = schema;
  const [categoryRows, lineRows, productRows] = await Promise.all([
    db().select().from(categories).where(eq(categories.published, true)).orderBy(asc(categories.position), asc(categories.id)),
    db().select().from(productLines).orderBy(asc(productLines.position), asc(productLines.id)),
    db().select().from(products).where(eq(products.published, true)).orderBy(asc(products.position), asc(products.id)),
  ]);

  // Solo lo publicado y con imagen (el panel la exige para publicar)
  const visibleCategories = categoryRows.flatMap((row) => {
    const image = toImage(row.image);
    return image ? [{ row, image }] : [];
  });
  const categorySlug = new Map(visibleCategories.map(({ row }) => [row.id, row.slug]));
  const lines = new Map(lineRows.map((line) => [line.id, { slug: line.slug, name: line.name }]));

  return {
    categories: visibleCategories.map(({ row, image }) => ({
      slug: row.slug,
      name: row.name,
      short: row.short,
      description: row.description,
      image,
      highlights: row.highlights,
      ...(row.demo && row.demo in CATEGORY_DEMOS && { demo: CATEGORY_DEMOS[row.demo as keyof typeof CATEGORY_DEMOS] }),
      lines: lineRows.filter((line) => line.categoryId === row.id).map((line) => ({ slug: line.slug, name: line.name })),
    })),
    products: productRows.flatMap((row): Product[] => {
      const category = categorySlug.get(row.categoryId);
      const image = toImage(row.image);
      if (!category || !image) return [];
      const line = row.lineId ? lines.get(row.lineId) : undefined;
      return [
        {
          slug: row.slug,
          category,
          ...(line && { line }),
          model: row.model,
          type: row.type,
          image,
          summary: row.summary,
          description: row.description,
          ...(row.capacityMin !== null && row.capacityMax !== null && { capacity: { min: row.capacityMin, max: row.capacityMax } }),
          ...(row.protection && { protection: row.protection }),
          environments: row.environments.filter(isEnvironment),
          features: row.features,
          specs: row.specs,
          ...(row.brochure && {
            brochure: {
              href: fileUrl(row.brochure.key),
              size: row.brochure.size,
              ...(row.brochure.language && { language: row.brochure.language }),
            },
          }),
          ...(row.demo && row.demo in PRODUCT_DEMOS && { demo: row.demo as ProductDemoKey }),
        },
      ];
    }),
  };
}

// Cada cambio del panel la invalida al instante; la hora es solo un respaldo por si alguien cambia
// la base por fuera del panel (phpMyAdmin)
const cachedCatalog = unstable_cache(loadCatalog, ["catalogo"], { tags: [CATALOG_TAG], revalidate: 3600 });

/** El catálogo publicado, para las páginas (una sola lectura por pedido; la página pasa a dinámica) */
export const getCatalog = cache(async (): Promise<Catalog> => {
  await connection();
  return cachedCatalog();
});

/** El catálogo publicado, fuera del render (acciones de formularios) */
export const readCatalog = (): Promise<Catalog> => cachedCatalog();

export const findCategory = (catalog: Catalog, slug: string) => catalog.categories.find((category) => category.slug === slug);

export const productsIn = (catalog: Catalog, categorySlug: string) =>
  catalog.products.filter((product) => product.category === categorySlug);

export const findProduct = (catalog: Catalog, categorySlug: string, slug: string) =>
  catalog.products.find((product) => product.category === categorySlug && product.slug === slug);

/** Otros modelos de la misma línea (o categoría), para la ficha del producto */
export function relatedProducts(catalog: Catalog, product: Product, limit = 4) {
  return catalog.products
    .filter(
      (other) =>
        other.slug !== product.slug &&
        other.category === product.category &&
        (product.line ? other.line?.slug === product.line.slug : true)
    )
    .slice(0, limit);
}
