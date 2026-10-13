import type { StaticImageData } from "next/image";
import industrialScales from "@/assets/categories/balanzas-industriales.png";
import softwareScreen from "@/assets/categories/software.svg";
import truckScale from "@/assets/products/powercell-pdx.png";

/**
 * Tipos de producto. Archivo liviano a propósito: lo usa el menú del header (cliente),
 * así el catálogo completo no viaja en el bundle de todas las páginas.
 */

export type Category = {
  slug: string;
  name: string;
  /** Una línea para menús y tarjetas */
  short: string;
  description: string;
  image: StaticImageData;
  /** Por qué elegir esta línea: se muestra en la página de la categoría */
  highlights: readonly { title: string; text: string }[];
  /** Demo 3D de la línea, si existe */
  demo?: { href: string; label: string };
};

const CATEGORY_LIST = [
  {
    slug: "balanzas-industriales",
    name: "Balanzas industriales",
    short: "Básculas de sobremesa, compactas y plataformas de pesaje",
    description:
      "Robustez, confiabilidad, precisión y ergonomía: balanzas METTLER TOLEDO diseñadas para los procesos de pesaje más exigentes, desde el mostrador hasta las áreas de lavado intensivo y las zonas peligrosas.",
    image: industrialScales,
    highlights: [
      {
        title: "Para cada entorno",
        text: "Equipos para ambientes secos, húmedos, de lavado intensivo y zonas con riesgo de explosión.",
      },
      {
        title: "Exactitud homologada",
        text: "Modelos con aprobación OIML y NTEP, listos para aplicaciones con uso legal.",
      },
      {
        title: "Calibración acreditada",
        text: "Su balanza puede salir calibrada por nuestro laboratorio acreditado por IBMETRO.",
      },
    ],
  },
  {
    slug: "basculas-de-camiones",
    name: "Básculas de camiones",
    short: "Pesaje de alto tonelaje con celdas digitales POWERCELL PDX",
    description:
      "La tecnología, durabilidad y exactitud de las básculas de camiones POWERCELL PDX de METTLER TOLEDO permiten controlar grandes volúmenes transportados con la más alta precisión.",
    image: truckScale,
    demo: { href: "/#demo-camion", label: "Vea en 3D cómo una báscula POWERCELL PDX reparte el peso entre sus celdas" },
    highlights: [
      {
        title: "Celdas digitales",
        text: "Cada celda convierte su señal a digital: sin cajas de conexión analógicas que fallen o se descalibren.",
      },
      {
        title: "Diagnóstico continuo",
        text: "El terminal supervisa cada celda y alerta ante una anomalía antes de que afecte la medición.",
      },
      {
        title: "Instalación y mantenimiento",
        text: "Nuestro equipo de alta capacidad instala, mantiene y renueva básculas de cualquier fabricante.",
      },
    ],
  },
  {
    slug: "software",
    name: "Software especializado",
    short: "Gestión, trazabilidad e integración de sus datos de pesaje",
    description:
      "Lleve los datos de sus balanzas y básculas a donde se toman las decisiones: registros, tickets, reportes e integración con sus sistemas de gestión.",
    image: softwareScreen,
    highlights: [
      {
        title: "Registro de pesajes",
        text: "Cada pesaje queda guardado con fecha, operador y producto o vehículo.",
      },
      {
        title: "Tickets y reportes",
        text: "Emisión de tickets de pesaje y reportes listos para auditorías.",
      },
      {
        title: "Integración",
        text: "Conexión de sus equipos de pesaje con su ERP u otros sistemas de la planta.",
      },
    ],
  },
] as const satisfies readonly Category[];

export type CategorySlug = (typeof CATEGORY_LIST)[number]["slug"];

export const CATEGORIES: readonly (Category & { slug: CategorySlug })[] = CATEGORY_LIST;

export const categoryHref = (slug: CategorySlug) => `/productos/${slug}`;

export const getCategory = (slug: string) => CATEGORIES.find((category) => category.slug === slug);
