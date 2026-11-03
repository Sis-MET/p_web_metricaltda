"use server";

import { and, asc, count, eq, max } from "drizzle-orm";
import { redirect } from "next/navigation";
import { z } from "zod";
import { CATEGORY_DEMOS } from "@/content/catalog";
import { db, schema } from "@/lib/db";
import { refreshSite, slugTaken } from "@/lib/panel/catalog-admin";
import { fileFrom, jsonFrom, moveInList, readImage, slugSchema, slugify, zodErrors, type ActionState } from "@/lib/panel/forms";
import { requireUser } from "@/lib/panel/session";
import { saveImage } from "@/lib/storage";

const { categories, productLines, products } = schema;

const highlightsSchema = z
  .array(z.object({ title: z.string().trim().min(1).max(120), text: z.string().trim().min(1).max(300) }))
  .max(6, "Hasta 6 destacados.");

const categoryInput = z.object({
  name: z.string().trim().min(2, "Escriba el nombre.").max(120),
  slug: slugSchema,
  short: z.string().trim().min(5, "Escriba una línea para el menú.").max(200),
  description: z.string().trim().min(10, "Escriba la descripción.").max(2000),
  demo: z.enum(["", ...Object.keys(CATEGORY_DEMOS)] as [string, ...string[]]),
  published: z.boolean(),
});

/** Crea (id null) o actualiza una categoría */
export async function saveCategory(id: number | null, _state: ActionState, form: FormData): Promise<ActionState> {
  const user = await requireUser();
  const name = String(form.get("name") ?? "");
  const parsed = categoryInput.safeParse({
    name,
    slug: String(form.get("slug") || slugify(name)),
    short: form.get("short"),
    description: form.get("description"),
    demo: String(form.get("demo") ?? ""),
    published: form.get("published") === "on",
  });
  if (!parsed.success) return zodErrors(parsed.error);
  const highlights = jsonFrom(form, "highlights", highlightsSchema);
  if (!highlights) return { error: "Revise los destacados: cada uno necesita título y texto.", fieldErrors: { highlights: "Complete o quite las filas incompletas." } };

  const values = parsed.data;
  if (await slugTaken("categories", values.slug, id ?? undefined))
    return { error: "Esa dirección ya la usa otra categoría.", fieldErrors: { slug: "Elija otra dirección." } };

  const existing = id ? (await db().select().from(categories).where(eq(categories.id, id)))[0] : undefined;
  if (id && !existing) return { error: "La categoría ya no existe." };

  let image = existing?.image ?? null;
  const file = fileFrom(form, "image");
  if (file) {
    const read = await readImage(file);
    if (read.error) return { error: read.error, fieldErrors: { image: read.error } };
    try {
      image = await saveImage("categorias", values.slug, read.data!);
    } catch {
      return { error: "No se pudo leer la imagen. Pruebe con otro archivo.", fieldErrors: { image: "Archivo no válido." } };
    }
  }
  if (values.published && !image)
    return { error: "Para publicar la categoría, agregue una imagen.", fieldErrors: { image: "Necesaria para publicar." } };

  const row = { ...values, demo: values.demo || null, highlights, image, updatedBy: user.id };
  if (existing) {
    await db().update(categories).set(row).where(eq(categories.id, existing.id));
  } else {
    const [{ last }] = await db().select({ last: max(categories.position) }).from(categories);
    await db().insert(categories).values({ ...row, position: (last ?? -1) + 1 });
  }
  refreshSite();
  redirect(`/panel/categorias?guardado=${encodeURIComponent(values.name)}`);
}

/** Solo sin productos: primero se mueven o eliminan */
export async function deleteCategory(id: number): Promise<ActionState> {
  await requireUser();
  const [{ total }] = await db().select({ total: count() }).from(products).where(eq(products.categoryId, id));
  if (total > 0)
    return { error: `Tiene ${total} ${total === 1 ? "producto" : "productos"}: muévalos a otra categoría o elimínelos primero.` };
  await db().delete(categories).where(eq(categories.id, id));
  refreshSite();
  redirect("/panel/categorias");
}

export async function moveCategory(id: number, direction: "up" | "down") {
  await requireUser();
  const rows = await db().select({ id: categories.id }).from(categories).orderBy(asc(categories.position), asc(categories.id));
  await moveInList(rows.map((row) => row.id), id, direction, (rowId, position) =>
    db().update(categories).set({ position }).where(eq(categories.id, rowId))
  );
  refreshSite();
}

/* ─── Líneas de una categoría ───────────────────────────────────────────── */

const lineName = z.string().trim().min(2, "Escriba el nombre de la línea.").max(120);

export async function addLine(categoryId: number, _state: ActionState, form: FormData): Promise<ActionState> {
  const user = await requireUser();
  const parsed = lineName.safeParse(form.get("name"));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const slug = slugify(parsed.data);
  const [{ taken }] = await db()
    .select({ taken: count() })
    .from(productLines)
    .where(and(eq(productLines.categoryId, categoryId), eq(productLines.slug, slug)));
  if (taken > 0) return { error: "Esa línea ya existe en la categoría." };
  const [{ last }] = await db().select({ last: max(productLines.position) }).from(productLines).where(eq(productLines.categoryId, categoryId));
  await db().insert(productLines).values({ categoryId, name: parsed.data, slug, position: (last ?? -1) + 1, updatedBy: user.id });
  refreshSite();
  return {};
}

/** Cambia el nombre que se ve; la dirección del filtro (?tipo=) se conserva */
export async function renameLine(id: number, name: string): Promise<ActionState> {
  const user = await requireUser();
  const parsed = lineName.safeParse(name);
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  await db().update(productLines).set({ name: parsed.data, updatedBy: user.id }).where(eq(productLines.id, id));
  refreshSite();
  return {};
}

/** Sus productos quedan sin línea (no se eliminan) */
export async function deleteLine(id: number): Promise<ActionState> {
  await requireUser();
  await db().delete(productLines).where(eq(productLines.id, id));
  refreshSite();
  return {};
}

export async function moveLine(categoryId: number, id: number, direction: "up" | "down") {
  await requireUser();
  const rows = await db()
    .select({ id: productLines.id })
    .from(productLines)
    .where(eq(productLines.categoryId, categoryId))
    .orderBy(asc(productLines.position), asc(productLines.id));
  await moveInList(rows.map((row) => row.id), id, direction, (rowId, position) =>
    db().update(productLines).set({ position }).where(eq(productLines.id, rowId))
  );
  refreshSite();
}
