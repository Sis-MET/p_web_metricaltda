import { DEMO_HREF } from "./truckScaleProject";

/**
 * Tipos y utilidades del catálogo, sin datos: el catálogo vive en la base (lo administra el área
 * comercial desde /panel) y se lee en el servidor con getCatalog(). Este archivo también lo usan
 * componentes de cliente.
 */

/* ─── Filtros del catálogo ──────────────────────────────────────────────── */

export const ENVIRONMENTS = {
  seco: "Ambientes secos o con polvo",
  humedo: "Humedad y salpicaduras",
  lavado: "Lavado intensivo",
  atex: "Zonas peligrosas (ATEX)",
} as const;

export type Environment = keyof typeof ENVIRONMENTS;

export const isEnvironment = (value: string): value is Environment => value in ENVIRONMENTS;

/* ─── Demos 3D programados ──────────────────────────────────────────────── */

/** Demos que una categoría puede enlazar (se abren encima de la página) */
export const CATEGORY_DEMOS = {
  vts200: {
    href: DEMO_HREF,
    label: "Vea en 3D cómo instalamos una báscula camionera VTS200, de la excavación al montaje",
  },
} as const;

/** Demos que se muestran dentro de la ficha de un producto */
export const PRODUCT_DEMOS = {
  bpa121: "Báscula de sobremesa BPA121: pesaje y desarmado para limpieza",
} as const;

export type CategoryDemoKey = keyof typeof CATEGORY_DEMOS;
export type ProductDemoKey = keyof typeof PRODUCT_DEMOS;

/* ─── Modelo ────────────────────────────────────────────────────────────── */

/**
 * Imagen subida: dirección pública y medidas. `photo`: una foto (sin transparencia), que llena su
 * marco; si no, es un equipo recortado sobre fondo transparente y se muestra entero.
 */
export type CatalogImage = { src: string; width: number; height: number; photo: boolean };

export type Line = { slug: string; name: string };

export type Category = {
  slug: string;
  name: string;
  /** Una línea para menús y tarjetas */
  short: string;
  description: string;
  image: CatalogImage;
  /** Por qué elegir esta categoría: se muestra en su página */
  highlights: { title: string; text: string }[];
  /** Demo 3D enlazado desde la página de la categoría */
  demo?: { href: string; label: string };
  lines: Line[];
};

/** Ficha técnica en PDF: tamaño en bytes; `language` solo cuando no está en español */
export type Brochure = { href: string; size: number; language?: "en" };

export type Product = {
  slug: string;
  /** Slug de su categoría */
  category: string;
  line?: Line;
  model: string;
  /** Tipo de equipo: "Báscula compacta", "Plataforma de pesaje"… */
  type: string;
  image: CatalogImage;
  /** Una o dos líneas: tarjetas, buscadores y vista previa al compartir */
  summary: string;
  description: string;
  /** Rango en kg para mostrar en tarjetas; se omite si depende del modelo */
  capacity?: { min: number; max: number };
  protection?: string;
  environments: Environment[];
  features: string[];
  specs: { label: string; value: string }[];
  brochure?: Brochure;
  /** Demo 3D en la ficha del producto */
  demo?: ProductDemoKey;
};

export const categoryHref = (slug: string) => `/productos/${slug}`;

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
const SUMMARY_KEYS = ["slug", "category", "line", "model", "type", "image", "summary", "capacity", "protection", "environments"] as const;

export type ProductSummary = Pick<Product, (typeof SUMMARY_KEYS)[number]>;

export const toSummary = (product: Product) =>
  Object.fromEntries(SUMMARY_KEYS.map((key) => [key, product[key]])) as ProductSummary;
