import type { schema } from "@/lib/db";
import { fileUrl } from "@/lib/storage";
import { imageUrl } from "@/lib/panel/catalog-admin";
import type { ProductFormValues } from "./ProductForm";

type ProductRow = typeof schema.products.$inferSelect;

const decimal = new Intl.NumberFormat("es-BO", { maximumFractionDigits: 3, useGrouping: false });

/** Un producto de la base, como lo muestra el formulario (capacidad en t desde una tonelada) */
export function toFormValues(row: ProductRow): ProductFormValues {
  const inTonnes = (row.capacityMax ?? 0) >= 1000;
  const show = (value: number | null) => (value === null ? "" : decimal.format(inTonnes ? value / 1000 : value));
  return {
    categoryId: row.categoryId,
    lineId: row.lineId,
    model: row.model,
    type: row.type,
    slug: row.slug,
    summary: row.summary,
    description: row.description,
    capacity: { min: show(row.capacityMin), max: show(row.capacityMax), unit: inTonnes ? "t" : "kg" },
    protection: row.protection ?? "",
    environments: row.environments,
    features: row.features,
    specs: row.specs,
    image: imageUrl(row.image),
    brochure: row.brochure && { href: fileUrl(row.brochure.key), size: row.brochure.size, ...(row.brochure.language && { language: row.brochure.language }) },
    demo: row.demo,
    published: row.published,
  };
}

export const EMPTY_PRODUCT: ProductFormValues = {
  categoryId: null,
  lineId: null,
  model: "",
  type: "",
  slug: "",
  summary: "",
  description: "",
  capacity: { min: "", max: "", unit: "kg" },
  protection: "",
  environments: [],
  features: [],
  specs: [],
  image: null,
  brochure: null,
  demo: null,
  published: false,
};
