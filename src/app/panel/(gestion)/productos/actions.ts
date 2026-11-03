"use server";

import { and, asc, eq, max } from "drizzle-orm";
import { redirect } from "next/navigation";
import { z } from "zod";
import { ENVIRONMENTS, PRODUCT_DEMOS } from "@/content/catalog";
import { db, schema } from "@/lib/db";
import { refreshSite, slugTaken } from "@/lib/panel/catalog-admin";
import {
  fileFrom,
  jsonFrom,
  moveInList,
  readImage,
  readPdf,
  slugSchema,
  slugify,
  zodErrors,
  type ActionState,
} from "@/lib/panel/forms";
import { requireUser } from "@/lib/panel/session";
import { savePdf, saveImage } from "@/lib/storage";

const { productLines, products } = schema;

/** "0,6" o "1 500" → número; vacío → null */
const number = z
  .string()
  .trim()
  .transform((value, ctx) => {
    if (!value) return null;
    const parsed = Number(value.replace(/\s/g, "").replace(",", "."));
    if (!Number.isFinite(parsed) || parsed < 0) {
      ctx.addIssue({ code: "custom", message: "Escriba un número (por ejemplo: 0,6 o 1500)." });
      return z.NEVER;
    }
    return parsed;
  });

const productInput = z.object({
  categoryId: z.coerce.number().int().positive("Elija la categoría."),
  lineId: z.coerce.number().int().nonnegative(),
  model: z.string().trim().min(1, "Escriba el modelo.").max(120),
  type: z.string().trim().min(2, "Escriba el tipo de equipo.").max(120),
  slug: slugSchema,
  summary: z.string().trim().min(10, "Escriba el resumen.").max(300, "Hasta 300 caracteres."),
  description: z.string().trim().min(10, "Escriba la descripción.").max(5000),
  capacityMin: number,
  capacityMax: number,
  capacityUnit: z.enum(["kg", "t"]),
  protection: z.string().trim().max(60),
  demo: z.enum(["", ...Object.keys(PRODUCT_DEMOS)] as [string, ...string[]]),
  brochureLanguage: z.enum(["es", "en"]),
  published: z.boolean(),
});

const features = z.array(z.string().trim().min(1).max(300)).max(20, "Hasta 20 características.");
const specs = z.array(z.object({ label: z.string().trim().min(1).max(120), value: z.string().trim().min(1).max(300) })).max(40);

/** Crea (id null) o actualiza un producto, con su imagen y su ficha técnica */
export async function saveProduct(id: number | null, _state: ActionState, form: FormData): Promise<ActionState> {
  const user = await requireUser();
  const model = String(form.get("model") ?? "");
  const parsed = productInput.safeParse({
    categoryId: form.get("categoryId"),
    lineId: form.get("lineId") || 0,
    model,
    type: form.get("type"),
    slug: String(form.get("slug") || slugify(model)),
    summary: form.get("summary"),
    description: form.get("description"),
    capacityMin: String(form.get("capacityMin") ?? ""),
    capacityMax: String(form.get("capacityMax") ?? ""),
    capacityUnit: form.get("capacityUnit") ?? "kg",
    protection: String(form.get("protection") ?? ""),
    demo: String(form.get("demo") ?? ""),
    brochureLanguage: form.get("brochureLanguage") ?? "es",
    published: form.get("published") === "on",
  });
  if (!parsed.success) return zodErrors(parsed.error);
  const values = parsed.data;

  const featureList = jsonFrom(form, "features", features);
  if (!featureList) return { error: "Revise las características.", fieldErrors: { features: "Hasta 20, de 300 caracteres cada una." } };
  const specList = jsonFrom(form, "specs", specs);
  if (!specList) return { error: "Revise las especificaciones: cada fila necesita dato y valor.", fieldErrors: { specs: "Complete o quite las filas incompletas." } };

  // Capacidad: las dos o ninguna, en kg
  const factor = values.capacityUnit === "t" ? 1000 : 1;
  const [min, max_] = [values.capacityMin, values.capacityMax];
  if ((min === null) !== (max_ === null))
    return { error: "Escriba la capacidad mínima y la máxima, o deje las dos vacías.", fieldErrors: { capacityMin: "Complete las dos." } };
  if (min !== null && max_ !== null && min > max_)
    return { error: "La capacidad mínima no puede superar a la máxima.", fieldErrors: { capacityMin: "Revise el rango." } };

  // La línea tiene que ser de la misma categoría
  let lineId: number | null = null;
  if (values.lineId) {
    const [line] = await db().select().from(productLines).where(and(eq(productLines.id, values.lineId), eq(productLines.categoryId, values.categoryId)));
    if (!line) return { error: "Elija una línea de la categoría elegida.", fieldErrors: { lineId: "Línea de otra categoría." } };
    lineId = line.id;
  }

  if (await slugTaken("products", values.slug, id ?? undefined))
    return { error: "Esa dirección ya la usa otro producto.", fieldErrors: { slug: "Elija otra dirección." } };

  const existing = id ? (await db().select().from(products).where(eq(products.id, id)))[0] : undefined;
  if (id && !existing) return { error: "El producto ya no existe." };

  let image = existing?.image ?? null;
  const imageFile = fileFrom(form, "image");
  if (imageFile) {
    const read = await readImage(imageFile);
    if (read.error) return { error: read.error, fieldErrors: { image: read.error } };
    try {
      image = await saveImage("productos", values.slug, read.data!);
    } catch {
      return { error: "No se pudo leer la imagen. Pruebe con otro archivo.", fieldErrors: { image: "Archivo no válido." } };
    }
  }
  if (values.published && !image)
    return { error: "Para publicar el producto, agregue su imagen.", fieldErrors: { image: "Necesaria para publicar." } };

  const language = values.brochureLanguage === "en" ? ("en" as const) : undefined;
  let brochure = form.get("removeBrochure") === "on" ? null : (existing?.brochure ?? null);
  const pdfFile = fileFrom(form, "brochure");
  if (pdfFile) {
    const read = await readPdf(pdfFile);
    if (read.error) return { error: read.error, fieldErrors: { brochure: read.error } };
    brochure = await savePdf(values.slug, read.data!, language);
  } else if (brochure) {
    // Solo cambió el idioma de la ficha que ya tenía
    brochure = { key: brochure.key, size: brochure.size, ...(language && { language }) };
  }

  const row = {
    categoryId: values.categoryId,
    lineId,
    slug: values.slug,
    model: values.model,
    type: values.type,
    summary: values.summary,
    description: values.description,
    capacityMin: min === null ? null : min * factor,
    capacityMax: max_ === null ? null : max_ * factor,
    protection: values.protection || null,
    environments: Object.keys(ENVIRONMENTS).filter((key) => form.getAll("environments").includes(key)),
    features: featureList,
    specs: specList,
    image,
    brochure,
    demo: values.demo || null,
    published: values.published,
    updatedBy: user.id,
  };

  if (existing) {
    // Si cambia de categoría, pasa al final de la nueva
    const moved = existing.categoryId !== values.categoryId;
    const position = moved ? await nextPosition(values.categoryId) : existing.position;
    await db().update(products).set({ ...row, position }).where(eq(products.id, existing.id));
  } else {
    await db().insert(products).values({ ...row, position: await nextPosition(values.categoryId) });
  }
  refreshSite();
  redirect(`/panel/productos?guardado=${encodeURIComponent(values.model)}`);
}

async function nextPosition(categoryId: number) {
  const [{ last }] = await db().select({ last: max(products.position) }).from(products).where(eq(products.categoryId, categoryId));
  return (last ?? -1) + 1;
}

export async function deleteProduct(id: number): Promise<ActionState> {
  await requireUser();
  await db().delete(products).where(eq(products.id, id));
  refreshSite();
  redirect("/panel/productos");
}

/** Orden dentro de su categoría (el del catálogo del sitio) */
export async function moveProduct(id: number, direction: "up" | "down") {
  await requireUser();
  const [product] = await db().select({ categoryId: products.categoryId }).from(products).where(eq(products.id, id));
  if (!product) return;
  const rows = await db()
    .select({ id: products.id })
    .from(products)
    .where(eq(products.categoryId, product.categoryId))
    .orderBy(asc(products.position), asc(products.id));
  await moveInList(rows.map((row) => row.id), id, direction, (rowId, position) =>
    db().update(products).set({ position }).where(eq(products.id, rowId))
  );
  refreshSite();
}
