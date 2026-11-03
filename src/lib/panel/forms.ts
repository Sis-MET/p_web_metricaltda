import "server-only";
import { z } from "zod";
import type { ActionState } from "./types";

export type { ActionState };
export { slugify } from "./slug";

export const IMAGE_MAX_MB = 8;
export const PDF_MAX_MB = 20;

export const slugSchema = z
  .string()
  .trim()
  .min(2, "La dirección es muy corta.")
  .max(80, "La dirección es muy larga.")
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use solo minúsculas, números y guiones (por ejemplo: pba-439).");

/** Archivo elegido en el formulario (null si no eligió ninguno) */
export function fileFrom(form: FormData, name: string): File | null {
  const value = form.get(name);
  return value instanceof File && value.size > 0 ? value : null;
}

/** Lista o pares que el formulario envía como JSON en un campo oculto */
export function jsonFrom<T>(form: FormData, name: string, schema: z.ZodType<T>): T | null {
  try {
    const parsed = schema.safeParse(JSON.parse(String(form.get(name) ?? "[]")));
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

/** Imagen: tamaño y tipo (sharp la decodifica al guardar: lo que no sea imagen falla ahí) */
export async function readImage(file: File) {
  if (file.size > IMAGE_MAX_MB * 1024 * 1024) return { error: `La imagen supera los ${IMAGE_MAX_MB} MB.` };
  if (!/^image\/(png|jpe?g|webp|avif)$/.test(file.type)) return { error: "La imagen debe ser PNG, JPG, WebP o AVIF." };
  return { data: Buffer.from(await file.arrayBuffer()) };
}

/** Ficha técnica: un PDF de verdad (empieza con %PDF) y de tamaño razonable */
export async function readPdf(file: File) {
  if (file.size > PDF_MAX_MB * 1024 * 1024) return { error: `La ficha supera los ${PDF_MAX_MB} MB.` };
  const data = Buffer.from(await file.arrayBuffer());
  if (data.subarray(0, 5).toString("latin1") !== "%PDF-") return { error: "La ficha técnica debe ser un archivo PDF." };
  return { data };
}

/** Primer error de zod, y uno por campo */
export function zodErrors(error: z.ZodError): ActionState {
  const fieldErrors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "");
    if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
  }
  return { error: "Revise los campos marcados.", fieldErrors };
}

/** Mueve una fila hacia arriba o abajo en una lista ordenada y renumera las posiciones */
export async function moveInList(
  ids: number[],
  id: number,
  direction: "up" | "down",
  setPosition: (id: number, position: number) => Promise<unknown>
) {
  const index = ids.indexOf(id);
  const target = direction === "up" ? index - 1 : index + 1;
  if (index < 0 || target < 0 || target >= ids.length) return;
  const order = [...ids];
  [order[index], order[target]] = [order[target], order[index]];
  await Promise.all(order.map((rowId, position) => setPosition(rowId, position)));
}
