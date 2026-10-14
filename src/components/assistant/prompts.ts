import { ClipboardCheck, Truck, Wheat, Wrench, type LucideIcon } from "lucide-react";
import { categoryHref } from "@/content/categories";
import { SERVICES } from "@/content/services";
import { QUOTE_HREF } from "@/lib/routes";

/** Lo que el cliente puede pedirle al asesor con un toque: `label` en el botón, `message` en el chat */
export type Prompt = { label: string; message: string };

export const STARTERS: (Prompt & { icon: LucideIcon })[] = [
  { icon: Wheat, label: "Planta de alimentos", message: "Tengo una planta de alimentos y necesito pesar mi producción" },
  { icon: Truck, label: "Pesar camiones", message: "Necesito pesar camiones con carga" },
  { icon: ClipboardCheck, label: "Calibrar mis balanzas", message: "Quiero calibrar mis balanzas" },
  { icon: Wrench, label: "Mi balanza falla", message: "Mi balanza presenta una falla" },
];

const [FOOD, TRUCKS, CALIBRATE, FAILURE] = STARTERS;

export type Invitation = { text: string; replies: Prompt[] };

const PRODUCT_PAGE = /^\/productos\/[^/]+\/[^/]+$/;

/**
 * Invitación del asesor según la página que mira el cliente. Ninguna donde ya está completando
 * un formulario: ahí solo distraería.
 */
export function invitationFor(pathname: string): Invitation | undefined {
  if (pathname === QUOTE_HREF || pathname.startsWith("/contacto")) return undefined;

  if (PRODUCT_PAGE.test(pathname))
    return {
      text: "¿Este equipo es el indicado para su proceso? Cuénteme qué necesita pesar y se lo confirmo.",
      replies: [
        { label: "¿Me sirve este equipo?", message: "¿Este equipo me sirve para mi proceso?" },
        { label: "Ver alternativas", message: "¿Qué otras opciones tengo parecidas a este equipo?" },
      ],
    };

  if (pathname.startsWith(categoryHref("basculas-de-camiones")))
    return {
      text: "¿Va a pesar camiones? Le ayudo a definir la báscula adecuada para su operación.",
      replies: [TRUCKS, { label: "Renovar mi báscula", message: "Quiero renovar o mejorar mi báscula de camiones actual" }],
    };

  if (pathname.startsWith(SERVICES.calibracion.href))
    return {
      text: "¿Necesita calibrar sus balanzas para una auditoría o un cliente? Le oriento sobre el servicio.",
      replies: [CALIBRATE, { label: "¿Cada cuánto calibrar?", message: "¿Cada cuánto debo calibrar mis balanzas?" }],
    };

  if (pathname.startsWith(SERVICES.soporte.href))
    return {
      text: "¿Su balanza presenta una falla o necesita mantenimiento? Cuénteme qué ocurre.",
      replies: [FAILURE, { label: "Mantenimiento preventivo", message: "Quiero un plan de mantenimiento preventivo para mis balanzas" }],
    };

  return {
    text: "Hola, soy el Asistente de Métrica. ¿Qué necesita pesar? Le recomiendo el equipo adecuado en un par de minutos.",
    replies: [FOOD, TRUCKS, CALIBRATE],
  };
}
