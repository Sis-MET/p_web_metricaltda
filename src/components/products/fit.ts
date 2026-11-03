import type { CatalogImage } from "@/content/catalog";

/**
 * Encuadre de una imagen del catálogo: una foto llena su marco (se recorta en los bordes); un equipo
 * recortado sobre fondo transparente entra entero, con el aire de `cutout` alrededor.
 */
export const fitClass = (image: Pick<CatalogImage, "photo">, cutout: string) =>
  image.photo ? "object-cover" : `object-contain ${cutout}`;
