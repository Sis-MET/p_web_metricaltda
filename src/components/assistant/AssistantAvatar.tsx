import { cn } from "@/lib/utils";

type AssistantAvatarProps = {
  className?: string;
  /** Mientras prepara la respuesta, los ojos miran de lado a lado */
  thinking?: boolean;
};

/**
 * Cara del Asistente de Métrica: el visor de un terminal de pesaje, con ojos que parpadean.
 * El tamaño lo da `className` (size-*); el dibujo ocupa el 62 % del círculo.
 */
export function AssistantAvatar({ className, thinking = false }: AssistantAvatarProps) {
  return (
    <span
      aria-hidden
      className={cn(
        "relative flex shrink-0 items-center justify-center rounded-full bg-gradient-to-b from-mt-600 to-mt-800 text-white ring-1 ring-white/20",
        className
      )}
    >
      <svg viewBox="0 0 32 32" fill="none" className="size-[62%]">
        {/* Visor */}
        <rect x="4" y="6" width="24" height="17" rx="5" fill="currentColor" fillOpacity="0.14" stroke="currentColor" strokeWidth="2" />
        <g className={cn(thinking && "motion-safe:animate-assistant-look")}>
          {[11, 18].map((x) => (
            <rect
              key={x}
              x={x}
              y="11.5"
              width="3"
              height="6"
              rx="1.5"
              fill="currentColor"
              className="origin-center [transform-box:fill-box] motion-safe:animate-assistant-blink"
            />
          ))}
        </g>
        {/* Pie de la balanza */}
        <path d="M16 23v3M9.5 27h13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    </span>
  );
}

/** Puntos de "escribiendo…" */
export function TypingDots({ className }: { className?: string }) {
  return (
    <span className={cn("flex h-5 items-center gap-1", className)} aria-hidden>
      {[0, 160, 320].map((delay) => (
        <span
          key={delay}
          className="size-1.5 rounded-full bg-neutral-400 motion-safe:animate-bounce"
          style={{ animationDelay: `${delay}ms` }}
        />
      ))}
    </span>
  );
}

/** Punto verde de "en línea", con un pulso suave; la posición la da `className` */
export function OnlineDot({ className }: { className?: string }) {
  return (
    <span aria-hidden className={cn("absolute flex size-3", className)}>
      <span className="absolute inset-0 rounded-full bg-emerald-400 opacity-75 [animation-duration:2s] motion-safe:animate-ping" />
      <span className="relative size-full rounded-full bg-emerald-400 ring-2 ring-mt-800" />
    </span>
  );
}
