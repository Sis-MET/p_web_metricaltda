import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { QUOTE_HREF, trailFor } from "./routes";
import { createStore, useStore } from "./store";

/**
 * Navegación en curso. Next.js mantiene la página anterior hasta que la nueva está lista: sin esto,
 * un clic en una página que tarda parece no hacer nada. El header la usa para marcar la sección
 * pedida apenas se hace clic y avisar qué se está cargando si la página tarda.
 */

type Pending = { id: number; path: string };

const pending = createStore<Pending | null>(null);
let lastId = 0;

/** El aviso solo aparece si la página tarda: en una navegación instantánea sería un parpadeo */
const SLOW_AFTER_MS = 150;
/** Si la página nunca llega (sin conexión, servidor caído), el aviso no queda colgado */
const GIVE_UP_MS = 15_000;

const PRODUCT_PAGE = /^\/productos\/[^/]+\/[^/]+$/;

/** Página del sitio a la que lleva un clic; nada si el clic no navega a otra página */
function destinationOf(event: MouseEvent) {
  if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return undefined;
  const anchor = event.target instanceof Element ? event.target.closest("a[href]") : null;
  if (!(anchor instanceof HTMLAnchorElement)) return undefined;
  if ((anchor.target && anchor.target !== "_self") || anchor.hasAttribute("download")) return undefined;

  const url = new URL(anchor.href);
  // Otro sitio, la misma página (anclas, filtros) o un archivo (fichas técnicas en PDF)
  if (url.origin !== location.origin || url.pathname === location.pathname || /\.\w+$/.test(url.pathname)) return undefined;
  return url.pathname;
}

/** "Cargando Productos…", "Cargando Calibración…": el nombre sale del mapa del sitio */
export function loadingMessage(path: string) {
  if (path === "/") return "Cargando Inicio…";
  if (path === QUOTE_HREF) return "Cargando su cotización…";
  const page = trailFor(path).at(-1);
  if (page) return `Cargando ${page.label}…`;
  return PRODUCT_PAGE.test(path) ? "Cargando la ficha del equipo…" : "Cargando la página…";
}

/**
 * Sigue las navegaciones del sitio: `pendingPath` apenas se hace clic en un enlace interno y
 * `slowPath` cuando la página tarda más de lo normal. Se usa una sola vez (en el header).
 */
export function useNavigationStatus() {
  const pathname = usePathname();
  const current = useStore(pending, null);
  const [slowId, setSlowId] = useState<number>();

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const path = destinationOf(event);
      if (path) pending.set({ id: ++lastId, path });
    };
    // En captura: antes de que Next.js tome el clic del enlace
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  // Llegó la página nueva (o una redirección): la navegación terminó
  useEffect(() => {
    pending.set(null);
  }, [pathname]);

  useEffect(() => {
    if (!current) return;
    const slow = setTimeout(() => setSlowId(current.id), SLOW_AFTER_MS);
    const giveUp = setTimeout(() => pending.set(null), GIVE_UP_MS);
    return () => {
      clearTimeout(slow);
      clearTimeout(giveUp);
    };
  }, [current]);

  return {
    pendingPath: current?.path,
    slowPath: current && current.id === slowId ? current.path : undefined,
  };
}
