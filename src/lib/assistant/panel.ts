import { createStore, createStoredStore, useStore } from "@/lib/store";

/** Apertura del chat del asesor: el botón flotante y cualquier otro botón del sitio lo controlan. */

export const PANEL_ID = "asesor-virtual";
export const LAUNCHER_ID = "asesor-virtual-boton";

/**
 * Relación del visitante con el asesor durante la visita:
 * - `nuevo`: todavía no lo vio; el botón llama la atención y aparece la invitación
 * - `invitado`: vio la invitación sin responder; el botón muestra un mensaje pendiente
 * - `visto`: abrió el chat o cerró la invitación; el asesor ya no insiste
 */
export type Engagement = "nuevo" | "invitado" | "visto";

const ENGAGEMENTS: readonly Engagement[] = ["nuevo", "invitado", "visto"];

const engagement = createStoredStore<Engagement>("session", "metrica:asesor-invitacion", "nuevo", (raw) =>
  ENGAGEMENTS.includes(raw as Engagement) ? (raw as Engagement) : "nuevo"
);

const open = createStore(false);

const show = () => {
  open.set(true);
  engagement.set("visto");
};

/** Cierra y devuelve el foco al botón flotante */
const close = () => {
  open.set(false);
  document.getElementById(LAUNCHER_ID)?.focus({ preventScroll: true });
};

export const assistantPanel = {
  open: show,
  close,
  toggle: () => (open.get() ? close() : show()),
  invited: () => engagement.update((current) => (current === "nuevo" ? "invitado" : current)),
  dismissInvitation: () => engagement.set("visto"),
};

export const useAssistantOpen = () => useStore(open, false);
export const useAssistantEngagement = () => useStore(engagement, "visto");
