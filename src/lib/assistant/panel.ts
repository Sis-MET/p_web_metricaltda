import { createStore, createStoredStore, useStore } from "@/lib/store";

/** Apertura del chat del asistente: el botón flotante y cualquier otro botón del sitio lo controlan. */

export const PANEL_ID = "asesor-virtual";
export const LAUNCHER_ID = "asesor-virtual-boton";

/**
 * La invitación aparece una vez por visita: deja de ofrecerse cuando ya se mostró, cuando el
 * visitante la cierra o cuando abre el chat por su cuenta.
 */
const invited = createStoredStore("session", "metrica:asesor-invitacion", false, (raw) => raw === true);

const open = createStore(false);

const show = () => {
  open.set(true);
  invited.set(true);
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
  /** La invitación ya se mostró (o el visitante la cerró) */
  invited: () => invited.set(true),
};

export const useAssistantOpen = () => useStore(open, false);
/** En el servidor se da por mostrada: la invitación solo se decide en el navegador */
export const useInvitationPending = () => !useStore(invited, true);
