"use client";

import { MotionConfig } from "framer-motion";
import type { ReactNode } from "react";

// Respeta "reducir movimiento" del sistema operativo en todas las animaciones
export function MotionProvider({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
