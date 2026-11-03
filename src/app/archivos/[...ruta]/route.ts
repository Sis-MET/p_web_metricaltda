import { readFile } from "node:fs/promises";
import path from "node:path";
import { resolveKey } from "@/lib/storage";

const TYPES: Record<string, string> = {
  ".webp": "image/webp",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".pdf": "application/pdf",
};

/**
 * Archivos subidos desde el panel (imágenes y fichas técnicas). Cada versión tiene su propia
 * dirección (el nombre lleva una huella del contenido): el navegador los guarda sin volver a pedirlos.
 */
export async function GET(_request: Request, { params }: { params: Promise<{ ruta: string[] }> }) {
  const key = (await params).ruta.join("/");
  const full = resolveKey(key);
  const type = TYPES[path.extname(key).toLowerCase()];
  if (!full || !type) return new Response("No encontrado", { status: 404 });

  try {
    const data = await readFile(full);
    return new Response(new Uint8Array(data), {
      headers: {
        "Content-Type": type,
        "Content-Length": String(data.length),
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
        ...(type === "application/pdf" && { "Content-Disposition": `inline; filename="${path.basename(key)}"` }),
      },
    });
  } catch {
    return new Response("No encontrado", { status: 404 });
  }
}
