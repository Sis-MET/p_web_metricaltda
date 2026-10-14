import { createStore, useStore } from "@/lib/store";

/** Apertura del chat del asesor: el botón flotante y cualquier otro botón del sitio lo controlan. */

export const PANEL_ID = "asesor-virtual";
export const LAUNCHER_ID = "asesor-virtual-boton";

const open = createStore(false);

export const assistantPanel = {
  open: () => open.set(true),
  toggle: () => open.set(!open.get()),
  /** Cierra y devuelve el foco al botón flotante */
  close: () => {
    open.set(false);
    document.getElementById(LAUNCHER_ID)?.focus({ preventScroll: true });
  },
};

export const useAssistantOpen = () => useStore(open, false);
