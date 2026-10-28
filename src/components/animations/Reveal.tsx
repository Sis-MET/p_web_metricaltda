"use client";

import { useEffect, useRef, type ComponentProps, type CSSProperties } from "react";

type RevealProps = ComponentProps<"div"> & {
  delay?: number;
  /** Desplazamiento vertical en px al entrar y al salir */
  y?: number;
};

/**
 * Entra al asomar en pantalla y sale al dejarla, hacia el lado por el que se va: al volver a una
 * sección se anima otra vez. El HTML llega visible y solo se oculta lo que al montarse queda debajo
 * de la pantalla: lo que se ve al cargar o al cambiar de página no espera al JavaScript ni a una
 * animación. La transición está en globals.css ([data-reveal]).
 */
export function Reveal({ delay = 0, y = 16, style, children, ...props }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element || matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const initial = element.getBoundingClientRect();
    if (initial.top >= window.innerHeight) element.dataset.reveal = "below";
    // Lo que ya se ve al cargar no se oculta aunque esté en el borde de la pantalla
    let settled = initial.top >= window.innerHeight || initial.bottom <= 0;

    // Se ve mientras alguna parte del bloque esté entre el 14 % superior de la pantalla (bajo el
    // header) y el 10 % inferior: así la salida ocurre a la vista y no fuera de ella
    const observer = new IntersectionObserver(
      (entries) => {
        // Con el navegador ocupado llegan varios cambios juntos: vale el último
        const entry = entries[entries.length - 1];
        if (entry.isIntersecting) {
          element.dataset.reveal = "shown";
          settled = true;
          return;
        }
        if (!settled) return;
        const top = entry.rootBounds?.top ?? 0;
        element.dataset.reveal = entry.boundingClientRect.top < top ? "above" : "below";
      },
      { rootMargin: "-14% 0px -10% 0px" }
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} style={{ "--reveal-delay": `${delay}s`, "--reveal-y": `${y}px`, ...style } as CSSProperties} {...props}>
      {children}
    </div>
  );
}
