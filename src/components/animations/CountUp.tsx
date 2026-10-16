"use client";

import { useEffect, useRef } from "react";
import { useInView, useReducedMotion } from "framer-motion";

/** La curva de EASE_OUT (salida exponencial) como función, para animar cuadro a cuadro */
const easeOutExpo = (t: number) => (t >= 1 ? 1 : 1 - 2 ** (-10 * t));

/** Número que cuenta hasta su valor la primera vez que aparece en pantalla. */
export function CountUp({
  value,
  from = 0,
  prefix = "",
  duration = 1.4,
}: {
  value: number;
  from?: number;
  prefix?: string;
  duration?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  // Arranca apenas asoma, mientras el bloque todavía está apareciendo (evita un salto visible)
  const inView = useInView(ref, { once: true });
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el || !inView || reducedMotion) return;
    // Sin animate() de framer-motion: traería todo su motor de animación al JavaScript inicial
    const start = performance.now();
    let frame = requestAnimationFrame(function step(now) {
      const progress = Math.min(1, (now - start) / (duration * 1000));
      el.textContent = `${prefix}${Math.round(from + (value - from) * easeOutExpo(progress))}`;
      if (progress < 1) frame = requestAnimationFrame(step);
    });
    return () => cancelAnimationFrame(frame);
  }, [inView, reducedMotion, from, value, prefix, duration]);

  // El valor final se renderiza en el servidor: sin JS (o sin animación) se ve correcto
  return (
    <span ref={ref} className="tabular-nums">
      {prefix}
      {value}
    </span>
  );
}
