"use client";

import { useEffect, useRef, type ComponentProps, type CSSProperties } from "react";

type RevealProps = ComponentProps<"div"> & {
  delay?: number;
  /** Desplazamiento vertical inicial en px */
  y?: number;
};

/**
 * Aparece una sola vez al entrar en pantalla. El HTML llega visible y solo se oculta, para animarlo,
 * lo que al montarse queda debajo de la pantalla: lo que se ve al cargar o al cambiar de página no
 * espera al JavaScript ni a una animación. La transición está en globals.css ([data-reveal]).
 */
export function Reveal({ delay = 0, y = 16, style, children, ...props }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element || element.getBoundingClientRect().top < window.innerHeight) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    element.dataset.reveal = "hidden";
    // Aparece cuando su borde superior pasa el 90 % de la pantalla (también si es más alto que ella).
    // El margen superior cuenta como visto lo que ya quedó arriba: si se salta la sección sin
    // detenerse (tecla Fin, un ancla, la barra de desplazamiento), no queda oculta.
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        element.dataset.reveal = "shown";
        observer.disconnect();
      },
      { rootMargin: "100000px 0px -10% 0px" }
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
