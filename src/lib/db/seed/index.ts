import { readFile } from "node:fs/promises";
import path from "node:path";
import { count } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import type { StoredFile, StoredImage } from "@/lib/db/schema";
import { savePdf, saveImage } from "@/lib/storage";
import { SEED_CATEGORIES, SEED_PRODUCTS } from "./data";

/** Imágenes y fichas del catálogo inicial (el paquete de Plesk incluye la carpeta seed/) */
const SEED_FILES = () => path.join(process.cwd(), "seed", "archivos");

/**
 * Carga el catálogo inicial si la base no tiene categorías: la primera vez que arranca el sitio con
 * una base nueva. Copia las imágenes (en WebP) y las fichas a la carpeta de archivos y guarda todo
 * en una transacción: si algo falla, no queda un catálogo a medias y se reintenta al próximo arranque.
 */
export async function seedCatalog() {
  const [{ total }] = await db().select({ total: count() }).from(schema.categories);
  if (total > 0) return false;

  const read = (file: string) => readFile(path.join(SEED_FILES(), file));

  // Primero los archivos (fuera de la transacción); las imágenes repetidas se convierten una vez
  const images = new Map<string, StoredImage>();
  const image = async (file: string, folder: "categorias" | "productos", name: string) => {
    if (!images.has(file)) images.set(file, await saveImage(folder, name, await read(file)));
    return images.get(file)!;
  };
  const pdfs = new Map<string, StoredFile>();
  const pdf = async ({ file, language }: { file: string; language?: "en" }) => {
    if (!pdfs.has(file)) pdfs.set(file, await savePdf(path.basename(file, ".pdf"), await read(file), language));
    return pdfs.get(file)!;
  };

  const categoryImages = await Promise.all(
    SEED_CATEGORIES.map((category) => image(category.image, "categorias", category.slug))
  );
  const productFiles: { image: StoredImage; brochure: StoredFile | null }[] = [];
  for (const product of SEED_PRODUCTS) {
    productFiles.push({
      image: await image(product.image, "productos", product.slug),
      brochure: product.brochure ? await pdf(product.brochure) : null,
    });
  }

  await db().transaction(async (tx) => {
    const categoryIds = new Map<string, number>();
    const lineIds = new Map<string, number>();

    for (const [i, category] of SEED_CATEGORIES.entries()) {
      const [{ id }] = await tx
        .insert(schema.categories)
        .values({
          slug: category.slug,
          name: category.name,
          short: category.short,
          description: category.description,
          image: categoryImages[i],
          highlights: [...category.highlights],
          demo: category.demo ?? null,
          position: i,
          published: true,
        })
        .$returningId();
      categoryIds.set(category.slug, id);

      for (const [j, line] of (category.lines ?? []).entries()) {
        const [{ id: lineId }] = await tx
          .insert(schema.productLines)
          .values({ categoryId: id, slug: line.slug, name: line.name, position: j })
          .$returningId();
        lineIds.set(`${category.slug}/${line.slug}`, lineId);
      }
    }

    for (const [i, product] of SEED_PRODUCTS.entries()) {
      const categoryId = categoryIds.get(product.category);
      if (!categoryId) throw new Error(`Categoría inexistente en el catálogo inicial: ${product.category}`);
      await tx.insert(schema.products).values({
        categoryId,
        lineId: product.family ? (lineIds.get(`${product.category}/${product.family}`) ?? null) : null,
        slug: product.slug,
        model: product.model,
        type: product.type,
        summary: product.summary,
        description: product.description,
        capacityMin: product.capacity?.min ?? null,
        capacityMax: product.capacity?.max ?? null,
        protection: product.protection ?? null,
        environments: product.environments,
        features: product.features,
        specs: product.specs,
        image: productFiles[i].image,
        brochure: productFiles[i].brochure,
        demo: product.demo ?? null,
        position: i,
        published: true,
      });
    }
  });

  return true;
}
