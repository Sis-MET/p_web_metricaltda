"use client";

import { useEffect, useRef } from "react";
import { animate, useInView, useReducedMotion } from "framer-motion";
import { EASE_OUT } from "@/lib/motion";

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
    const controls = animate(from, value, {
      duration,
      ease: EASE_OUT,
      onUpdate: (v) => {
        el.textContent = `${prefix}${Math.round(v)}`;
      },
    });
    return () => controls.stop();
  }, [inView, reducedMotion, from, value, prefix, duration]);

  // El valor final se renderiza en el servidor: sin JS (o sin animación) se ve correcto
  return (
    <span ref={ref} className="tabular-nums">
      {prefix}
      {value}
    </span>
  );
}
