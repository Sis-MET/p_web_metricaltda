import "server-only";
import { and, asc, count, desc, eq, ne } from "drizzle-orm";
import { updateTag } from "next/cache";
import { CATALOG_TAG } from "@/lib/catalog";
import { db, schema } from "@/lib/db";
import { fileUrl } from "@/lib/storage";

/**
 * El catálogo tal como lo trabaja el panel: con borradores, el orden y quién hizo el último cambio.
 * El sitio público lee su propia versión (publicada y en caché, lib/catalog.ts).
 */

const { categories, productLines, products, users } = schema;

export type AdminCategory = Awaited<ReturnType<typeof listCategories>>[number];
export type AdminProductRow = Awaited<ReturnType<typeof listProducts>>[number];

/** Tras guardar cualquier cambio: el sitio vuelve a leer el catálogo en el próximo pedido */
export const refreshSite = () => updateTag(CATALOG_TAG);

export const imageUrl = (image: { key: string } | null) => (image ? fileUrl(image.key) : null);

export async function listCategories() {
  const [rows, lines, counts] = await Promise.all([
    db()
      .select({ category: categories, editor: users.name })
      .from(categories)
      .leftJoin(users, eq(users.id, categories.updatedBy))
      .orderBy(asc(categories.position), asc(categories.id)),
    db().select().from(productLines).orderBy(asc(productLines.position), asc(productLines.id)),
    db()
      .select({ categoryId: products.categoryId, total: count() })
      .from(products)
      .groupBy(products.categoryId),
  ]);
  return rows.map(({ category, editor }) => ({
    ...category,
    editor,
    lines: lines.filter((line) => line.categoryId === category.id),
    productCount: counts.find((c) => c.categoryId === category.id)?.total ?? 0,
  }));
}

export async function getCategory(id: number) {
  const [row] = await db().select().from(categories).where(eq(categories.id, id));
  if (!row) return null;
  const lines = await db()
    .select()
    .from(productLines)
    .where(eq(productLines.categoryId, id))
    .orderBy(asc(productLines.position), asc(productLines.id));
  const [{ total }] = await db().select({ total: count() }).from(products).where(eq(products.categoryId, id));
  return { ...row, lines, productCount: total };
}

export async function listProducts() {
  return db()
    .select({
      id: products.id,
      slug: products.slug,
      model: products.model,
      type: products.type,
      image: products.image,
      published: products.published,
      position: products.position,
      updatedAt: products.updatedAt,
      categoryId: products.categoryId,
      category: categories.name,
      categorySlug: categories.slug,
      line: productLines.name,
      editor: users.name,
    })
    .from(products)
    .innerJoin(categories, eq(categories.id, products.categoryId))
    .leftJoin(productLines, eq(productLines.id, products.lineId))
    .leftJoin(users, eq(users.id, products.updatedBy))
    .orderBy(asc(categories.position), asc(products.position), asc(products.id));
}

export async function getProduct(id: number) {
  const [row] = await db().select().from(products).where(eq(products.id, id));
  return row ?? null;
}

/** Categorías con sus líneas, para los selectores del formulario de producto */
export async function categoryOptions() {
  const list = await listCategories();
  return list.map(({ id, name, lines }) => ({ id, name, lines: lines.map((line) => ({ id: line.id, name: line.name })) }));
}

/** ¿Hay otra fila con este slug? */
export async function slugTaken(table: "categories" | "products", slug: string, exceptId?: number) {
  const target = table === "categories" ? categories : products;
  const [{ total }] = await db()
    .select({ total: count() })
    .from(target)
    .where(exceptId ? and(eq(target.slug, slug), ne(target.id, exceptId)) : eq(target.slug, slug));
  return total > 0;
}

/** Lo último que se cambió, para el resumen */
export async function recentChanges(limit = 6) {
  return db()
    .select({ id: products.id, model: products.model, updatedAt: products.updatedAt, editor: users.name, published: products.published })
    .from(products)
    .leftJoin(users, eq(users.id, products.updatedBy))
    .orderBy(desc(products.updatedAt))
    .limit(limit);
}
