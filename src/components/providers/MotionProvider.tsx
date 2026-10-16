"use client";

import { LazyMotion, MotionConfig } from "framer-motion";
import type { ReactNode } from "react";

// Los componentes `m` pesan una fracción de `motion`: las funciones de animación se descargan aparte,
// después de la página. `strict` avisa si alguien vuelve a usar `motion`, que las incluiría enteras.
const loadFeatures = () => import("@/lib/motion-features").then((module) => module.default);

/** Animaciones del sitio: carga diferida y respeto de "reducir movimiento" del sistema operativo */
export function MotionProvider({ children }: { children: ReactNode }) {
  return (
    <LazyMotion features={loadFeatures} strict>
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </LazyMotion>
  );
}
