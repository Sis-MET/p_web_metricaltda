import type { MetadataRoute } from "next";
import { categoryHref, productHref } from "@/content/catalog";
import { SITE_URL } from "@/content/company";
import { DEMO_HREF } from "@/content/truckScaleProject";
import { getCatalog } from "@/lib/catalog";
import { NAV } from "@/lib/routes";

/** Las páginas fijas y las del catálogo publicado (se arma al pedirlo: el catálogo cambia desde el panel) */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { categories, products } = await getCatalog();
  const pages = NAV.flatMap((item) => [item.href, ...(item.children ?? []).map((link) => link.href)]);
  const catalog = [...categories.map((category) => categoryHref(category.slug)), ...products.map(productHref)];
  const paths = [...new Set([...pages, ...catalog, DEMO_HREF])];
  return paths.map((path) => ({ url: `${SITE_URL}${path === "/" ? "" : path}` }));
}
