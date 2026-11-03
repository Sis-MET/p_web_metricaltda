import type { ReactNode } from "react";
import { unstable_rethrow } from "next/navigation";
import { AssistantLauncher } from "@/components/assistant/AssistantLauncher";
import { JsonLd } from "@/components/seo/JsonLd";
import { COMPANY, EMAILS, OFFICES, SITE_URL } from "@/content/company";
import { getCatalog } from "@/lib/catalog";
import { categoryLink, type NavLink } from "@/lib/routes";
import { Footer } from "./Footer";
import { Header } from "./Header";

const ORGANIZATION = {
  "@type": "Organization",
  name: COMPANY.name,
  url: SITE_URL,
  logo: `${SITE_URL}/images/logo/metrica.png`,
  email: EMAILS.info,
  foundingDate: String(COMPANY.founded),
  address: OFFICES.map((office) => ({
    "@type": "PostalAddress",
    streetAddress: office.address.join(", "),
    addressLocality: office.city,
    addressCountry: "BO",
  })),
  contactPoint: OFFICES.flatMap((office) =>
    office.phones.slice(0, 1).map((phone) => ({
      "@type": "ContactPoint",
      telephone: phone.number,
      contactType: "sales",
      areaServed: "BO",
      availableLanguage: "es",
    }))
  ),
};

/** Las categorías del menú; si la base no responde, el sitio sigue en pie sin ellas */
async function productLinks(): Promise<NavLink[]> {
  try {
    return (await getCatalog()).categories.map(categoryLink);
  } catch (error) {
    // Las señales internas de Next (página dinámica) siguen su curso
    unstable_rethrow(error);
    console.error("[catálogo] No se pudo leer el menú de productos", error);
    return [];
  }
}

/** Marco del sitio público: header, footer, asistente y los datos de la empresa para buscadores */
export async function SiteChrome({ children }: { children: ReactNode }) {
  const links = await productLinks();
  return (
    <>
      <Header productLinks={links} />
      {children}
      <Footer productLinks={links} />
      <AssistantLauncher />
      <JsonLd data={ORGANIZATION} />
    </>
  );
}
