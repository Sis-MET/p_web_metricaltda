import type { MetadataRoute } from "next";
import { SITE_URL } from "@/content/company";

export default function robots(): MetadataRoute.Robots {
  return {
    // El panel del catálogo y las API no son páginas para buscadores
    rules: { userAgent: "*", allow: "/", disallow: ["/panel", "/api/"] },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
