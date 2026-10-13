import type { StaticImageData } from "next/image";
import { BriefcaseBusiness, MessageSquareText, MessageSquareWarning, type LucideIcon } from "lucide-react";
import { CATEGORIES, categoryHref } from "@/content/categories";
import { SERVICES } from "@/content/services";

/** Mapa del sitio: alimenta el header, el footer, las migas de pan y el sitemap. */

export type NavLink = {
  label: string;
  href: string;
  description?: string;
  /** Imagen (productos) o ícono (el resto) en el menú desplegable */
  image?: StaticImageData;
  icon?: LucideIcon;
};
export type NavItem = NavLink & { children?: NavLink[] };

export const QUOTE_HREF = "/cotizacion";

export const NAV: NavItem[] = [
  { label: "Inicio", href: "/" },
  { label: "Nosotros", href: "/nosotros" },
  {
    label: "Productos",
    href: "/productos",
    children: CATEGORIES.map((category) => ({
      label: category.name,
      href: categoryHref(category.slug),
      description: category.short,
      image: category.image,
    })),
  },
  {
    label: "Servicios",
    href: "/servicios",
    children: Object.values(SERVICES).map((service) => ({
      label: service.name,
      href: service.href,
      description: service.short,
      icon: service.icon,
    })),
  },
  {
    label: "Contacto",
    href: "/contacto",
    children: [
      {
        label: "Contáctenos",
        href: "/contacto",
        description: "Consultas generales y asesoría comercial",
        icon: MessageSquareText,
      },
      {
        label: "Reclamos y sugerencias",
        href: "/contacto/reclamos-y-sugerencias",
        description: "Ayúdenos a mejorar nuestro servicio",
        icon: MessageSquareWarning,
      },
      {
        label: "Trabaja con nosotros",
        href: "/contacto/trabaja-con-nosotros",
        description: "Envíe su hoja de vida",
        icon: BriefcaseBusiness,
      },
    ],
  },
];

export const navItem = (href: string) => NAV.find((item) => item.href === href);

/** La sección del menú está activa en su página y en todas las que cuelgan de ella */
export function isActivePath(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

/** Migas de pan de una página estática según el mapa del sitio */
export function trailFor(href: string): NavLink[] {
  for (const item of NAV) {
    if (item.href === href) return [item];
    const child = item.children?.find((link) => link.href === href);
    if (child) return [item, child];
  }
  return [];
}
