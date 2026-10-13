import { FlaskConical, Pickaxe, Pill, Wheat, type LucideIcon } from "lucide-react";

/** Datos institucionales: una sola fuente para el header, el footer, contacto y SEO. */

export const SITE_URL = "https://www.metrica.com.bo";

export const COMPANY = {
  name: "Métrica Ltda.",
  tagline: "Expertos en sistemas de pesaje",
  description:
    "Representantes exclusivos de METTLER TOLEDO en Bolivia. Venta de balanzas y básculas, calibración acreditada NB/ISO/IEC 17025 y soporte técnico.",
  founded: 2007,
  mission: "Métrica Ltda. es un equipo de expertos que brinda soluciones integrales en sistemas de pesaje y metrología de masa.",
  vision: "Ser reconocido como líder y referente nacional en tecnología de pesaje.",
} as const;

export const EMAILS = {
  info: "info@metrica.com.bo",
  comercial: "comercial@metrica.com.bo",
} as const;

export type Phone = { label: string; display: string; number: string };

const phone = (label: string, display: string, number: string): Phone => ({ label, display, number });

export const SALES_PHONE = phone("Área comercial", "+591 71538792", "+59171538792");

/** El área comercial atiende también por WhatsApp */
const WHATSAPP_NUMBER = "59171538792";

export function whatsappUrl(message?: string) {
  const base = `https://wa.me/${WHATSAPP_NUMBER}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

export type Office = {
  city: string;
  address: string[];
  phones: Phone[];
  mapsQuery: string;
};

export const OFFICES: Office[] = [
  {
    city: "La Paz",
    address: ["Calle Fernando Guachalla", "Pje. Gral. Donato Cardozo #715-B", "Zona Sopocachi"],
    phones: [SALES_PHONE, phone("Oficina", "2 2422060", "+59122422060"), phone("Oficina", "2 2910878", "+59122910878")],
    mapsQuery: "Pasaje General Donato Cardozo 715, Sopocachi, La Paz, Bolivia",
  },
  {
    city: "Santa Cruz",
    address: ["Calle Prolongación Mutualista", "Entre 6.º y 7.º anillo #6170"],
    phones: [phone("Oficina", "+591 67010001", "+59167010001")],
    mapsQuery: "Prolongación Mutualista 6170, Santa Cruz de la Sierra, Bolivia",
  },
];

export const mapsUrl = (office: Office) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(office.mapsQuery)}`;

export const SOCIAL_LINKS: { label: "Facebook" | "Instagram" | "LinkedIn"; href: string }[] = [
  // Pendiente: las URLs de las redes sociales oficiales
];

/** Solo el laboratorio de calibración está acreditado; soporte técnico no. */
export const ACCREDITATION = {
  code: "DTA-CET-041",
  standard: "NB/ISO/IEC 17025:2018",
  body: "Dirección Técnica de Acreditación (DTA) del IBMETRO",
  since: 2012,
  scope: "Instrumentos de pesar de funcionamiento no automático (balanzas) y pesas patrón.",
  verifyUrl:
    "https://ibmetro.gob.bo/dta/catalogo-oec?oec=M%C3%A9trica&tramite=&tipo=&norma=&sector=&estado=%C3%A7&pag=1",
  certificateUrl: "https://ibmetro.gob.bo/dta/catalogo-oec?download=DTA-CET-041",
} as const;

export const BRANDS = {
  exclusive: { name: "METTLER TOLEDO", href: "https://www.mt.com/" },
  authorized: [
    { name: "Haefner", href: "https://www.haefner.de/en/" },
    { name: "Precisa", href: "https://www.precisa.com/" },
    { name: "Intercomp", href: "https://www.intercompcompany.com/" },
  ],
} as const;

export const INDUSTRIES: { icon: LucideIcon; label: string }[] = [
  { icon: Wheat, label: "Alimentos y bebidas" },
  { icon: FlaskConical, label: "Química" },
  { icon: Pill, label: "Farmacéutica" },
  { icon: Pickaxe, label: "Minería" },
];

export const STATS = [
  { value: COMPANY.founded, from: 1990, prefix: "", label: "Año de fundación" },
  { value: new Date().getFullYear() - COMPANY.founded, from: 0, prefix: "+", label: "Años de experiencia" },
  { value: 500, from: 0, prefix: "+", label: "Clientes atendidos" },
];
