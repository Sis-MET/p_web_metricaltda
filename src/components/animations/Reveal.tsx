"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import { EASE_OUT } from "@/lib/motion";

type RevealProps = HTMLMotionProps<"div"> & {
  delay?: number;
  /** Desplazamiento vertical inicial en px */
  y?: number;
};

/** Aparece una sola vez al entrar en pantalla: corto y sin bloquear el contenido. */
export function Reveal({ delay = 0, y = 16, children, ...props }: RevealProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5, ease: EASE_OUT, delay }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
