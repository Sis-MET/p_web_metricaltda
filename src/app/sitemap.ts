import type { MetadataRoute } from "next";
import { productHref } from "@/content/catalog";
import { SITE_URL } from "@/content/company";
import { PRODUCTS } from "@/content/products";
import { DEMO_HREF } from "@/content/truckScaleProject";
import { NAV } from "@/lib/routes";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = NAV.flatMap((item) => [item.href, ...(item.children ?? []).map((link) => link.href)]);
  const paths = [...new Set([...pages, ...PRODUCTS.map(productHref), DEMO_HREF])];
  return paths.map((path) => ({ url: `${SITE_URL}${path === "/" ? "" : path}` }));
}
