import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const TONES = {
  light: "bg-[linear-gradient(90deg,var(--color-ink-400)_25%,var(--color-ink-900)_50%,var(--color-ink-400)_75%)]",
  // Sobre fotos o fondos azules: blanco con una sombra leve para leerse en cualquier zona
  dark: "bg-[linear-gradient(90deg,rgba(255,255,255,0.5)_25%,#fff_50%,rgba(255,255,255,0.5)_75%)] drop-shadow-[0_1px_2px_rgba(0,20,46,0.6)]",
} as const;

/** Texto con un brillo que lo recorre: los avisos de carga del sitio ("Cargando Productos…") */
export function ShimmerText({ tone = "light", className, children }: { tone?: keyof typeof TONES; className?: string; children: ReactNode }) {
  return (
    <span className={cn("bg-[length:200%_100%] bg-clip-text text-transparent motion-safe:animate-text-shimmer", TONES[tone], className)}>
      {children}
    </span>
  );
}
