export const NAV_SECTIONS = [
  { id: "inicio", label: "Inicio" },
  { id: "nosotros", label: "Nosotros" },
  { id: "productos", label: "Productos" },
  { id: "servicios", label: "Servicios" },
  { id: "contacto", label: "Contacto" },
] as const;

/** Secciones del home: las del menú y los demos 3D, que se enlazan desde botones */
export type SectionId = (typeof NAV_SECTIONS)[number]["id"] | "demo-camion" | "demo-mesa";

// Páginas internas que corresponden a una sección del home (para marcar el menú)
export const PAGE_SECTIONS: Record<string, SectionId> = {
  "/productos": "productos",
  "/servicios": "servicios",
  "/contacto": "contacto",
};

export type Consulta = "cotizacion" | "calibracion" | "soporte" | "otro";

// Evento con el que cualquier botón preselecciona el tipo de consulta del formulario
export const CONSULTA_EVENT = "metrica:consulta";

/**
 * Desplaza suavemente hasta una sección de la página actual.
 * Devuelve false si la sección no existe aquí (el link debe navegar al home).
 */
export function goToSection(id: SectionId, consulta?: Consulta): boolean {
  const target = document.getElementById(id);
  if (!target) return false;

  if (consulta) {
    window.dispatchEvent(new CustomEvent<Consulta>(CONSULTA_EVENT, { detail: consulta }));
  }

  const behavior = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
  if (id === "inicio") window.scrollTo({ top: 0, behavior });
  else target.scrollIntoView({ behavior, block: "start" });
  return true;
}
