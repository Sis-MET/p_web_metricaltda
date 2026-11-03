import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import type { StoredFile, StoredImage } from "@/lib/db/schema";

/**
 * Imágenes y fichas técnicas subidas desde el panel. Viven en UPLOADS_DIR: en Plesk, una carpeta
 * fuera de la aplicación (los despliegues reemplazan la aplicación, no esa carpeta, y entra en
 * los backups); en desarrollo, ./storage. El sitio las sirve en /archivos/<clave>.
 */

// Datos de tiempo de ejecución, fuera del paquete: el compilador no debe rastrear estas rutas (sin la
// marca, empaqueta en el servidor todo el proyecto y la carpeta de desarrollo)
export const uploadsDir = () =>
  path.resolve(
    /*turbopackIgnore: true*/ process.env.UPLOADS_DIR || path.join(/*turbopackIgnore: true*/ process.cwd(), "storage")
  );

export const FILES_ROUTE = "/archivos";
export const fileUrl = (key: string) => `${FILES_ROUTE}/${key}`;

export type FileFolder = "categorias" | "productos" | "fichas";

/** Ruta en disco de una clave; null si intentaría salir de la carpeta de archivos */
export function resolveKey(key: string) {
  const root = uploadsDir();
  const full = path.resolve(/*turbopackIgnore: true*/ root, key);
  return full.startsWith(root + path.sep) ? full : null;
}

/** Nombre legible para la clave: "pba-439" a partir de "PBA439 / PBA639" */
const toName = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60) || "archivo";

/** Guarda tal cual; el nombre lleva una huella del contenido, así cada versión tiene su dirección */
async function save(folder: FileFolder, name: string, extension: string, data: Buffer) {
  const hash = createHash("sha256").update(data).digest("hex").slice(0, 10);
  const key = `${folder}/${toName(name)}-${hash}.${extension}`;
  const full = resolveKey(key);
  if (!full) throw new Error(`Clave de archivo no válida: ${key}`);
  await mkdir(path.dirname(full), { recursive: true });
  await writeFile(full, data);
  return key;
}

/**
 * Imagen subida: se reduce a 1600 px como máximo y pasa a WebP, con su transparencia. Se anota si es
 * opaca (una foto): el sitio la muestra llenando su marco, y un recorte, entero sobre un fondo.
 */
export async function saveImage(folder: "categorias" | "productos", name: string, input: Buffer): Promise<StoredImage> {
  const { default: sharp } = await import("sharp");
  const { isOpaque } = await sharp(input, { density: 300 }).stats();
  const { data, info } = await sharp(input, { density: 300 })
    .rotate()
    .resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 86, alphaQuality: 90 })
    .toBuffer({ resolveWithObject: true });
  return { key: await save(folder, name, "webp", data), width: info.width, height: info.height, opaque: isOpaque };
}

/** Ficha técnica en PDF */
export async function savePdf(name: string, data: Buffer, language?: "en"): Promise<StoredFile> {
  return { key: await save("fichas", name, "pdf", data), size: data.length, ...(language && { language }) };
}
