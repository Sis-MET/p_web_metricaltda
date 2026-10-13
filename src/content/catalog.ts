import type { StaticImageData } from "next/image";
import type { CategorySlug } from "./categories";

/**
 * Tipos y utilidades del catálogo, sin datos: los componentes de cliente los importan
 * sin arrastrar el catálogo completo a su bundle.
 */

/* ─── Filtros del catálogo ──────────────────────────────────────────────── */

export const FAMILIES = {
  sobremesa: "Sobremesa y compactas",
  plataformas: "Plataformas de pesaje",
} as const;

export const ENVIRONMENTS = {
  seco: "Ambientes secos o con polvo",
  humedo: "Humedad y salpicaduras",
  lavado: "Lavado intensivo",
  atex: "Zonas peligrosas (ATEX)",
} as const;

export type Family = keyof typeof FAMILIES;
export type Environment = keyof typeof ENVIRONMENTS;

/* ─── Modelo ────────────────────────────────────────────────────────────── */

export type Product = {
  slug: string;
  category: CategorySlug;
  family?: Family;
  model: string;
  /** Tipo de equipo: "Báscula compacta", "Plataforma de pesaje"… */
  type: string;
  image: StaticImageData;
  /** Una o dos líneas: tarjetas, buscadores y vista previa al compartir */
  summary: string;
  description: string;
  /** Rango en kg para mostrar en tarjetas; se omite si depende del modelo */
  capacity?: { min: number; max: number };
  protection?: string;
  environments: Environment[];
  features: string[];
  specs: { label: string; value: string }[];
  /** Demo 3D en la ficha del producto */
  demo?: "bpa121";
};

export const productHref = (product: Pick<Product, "category" | "slug">) =>
  `/productos/${product.category}/${product.slug}`;

export const productTitle = (product: Pick<Product, "type" | "model">) => `${product.type} ${product.model}`;

const kg = new Intl.NumberFormat("es-BO", { maximumFractionDigits: 2 });

/** "3 – 30 kg", "0,6 kg – 3 t" */
export function formatCapacity({ min, max }: { min: number; max: number }) {
  const format = (value: number) => (value >= 1000 ? `${kg.format(value / 1000)} t` : `${kg.format(value)} kg`);
  const [from, to] = [format(min), format(max)];
  return from.endsWith(" kg") && to.endsWith(" kg") ? `${kg.format(min)} – ${to}` : `${from} – ${to}`;
}

/** Lo mínimo para tarjetas y la lista de cotización: es lo que viaja a los componentes de cliente */
const SUMMARY_KEYS = ["slug", "category", "family", "model", "type", "image", "summary", "capacity", "protection", "environments"] as const;

export type ProductSummary = Pick<Product, (typeof SUMMARY_KEYS)[number]>;

export const toSummary = (product: Product) =>
  Object.fromEntries(SUMMARY_KEYS.map((key) => [key, product[key]])) as ProductSummary;
