"use client";

import { useEffect, useState, useSyncExternalStore, type ReactNode, type RefObject } from "react";
import { useInView } from "framer-motion";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Cuándo montar y animar una escena 3D:
 * - `shouldMount`: con la página inactiva (o si el usuario se acerca antes) se descarga y monta.
 *   Así la compilación de shaders ocurre en segundo plano y no al llegar a la sección.
 * - `isActive`: está visible y la pestaña también → se anima; si no, queda en pausa.
 */
export function useDemoActivation(ref: RefObject<HTMLElement | null>) {
  const isNear = useInView(ref, { once: true, margin: "800px 0px" });
  const isVisible = useInView(ref);
  const [pageVisible, setPageVisible] = useState(true);
  const [idle, setIdle] = useState(false);

  useEffect(() => {
    const onVisibility = () => setPageVisible(!document.hidden);
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  // Precarga cuando el navegador está libre, un momento después de cargar la página
  useEffect(() => {
    const ready = () => setIdle(true);
    if ("requestIdleCallback" in window) {
      const id = window.requestIdleCallback(ready, { timeout: 4000 });
      return () => window.cancelIdleCallback(id);
    }
    const id = setTimeout(ready, 2500);
    return () => clearTimeout(id);
  }, []);

  return { shouldMount: isNear || idle, isActive: isVisible && pageVisible };
}

const DESKTOP_QUERY = "(min-width: 1024px)";

/** true en pantallas de escritorio (lg): el texto va al costado del modelo */
export function useIsDesktop() {
  return useSyncExternalStore(
    (onChange) => {
      const mq = window.matchMedia(DESKTOP_QUERY);
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    },
    () => window.matchMedia(DESKTOP_QUERY).matches,
    () => false
  );
}

/** Fondo del demo: `dark` (azul METTLER) o `light` (fondos claros del sitio). */
export type Surface = "dark" | "light";

export function ViewerPlaceholder() {
  // Toma el color de texto de la sección (claro u oscuro)
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 text-sm opacity-60">
      <Loader2 className="size-5 animate-spin" aria-hidden />
      Cargando modelo 3D…
    </div>
  );
}

export function ViewerButton({
  label,
  pressed,
  surface = "dark",
  onClick,
  children,
}: {
  label: string;
  pressed?: boolean;
  surface?: Surface;
  onClick: () => void;
  children: ReactNode;
}) {
  const light = surface === "light";
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={pressed}
      title={label}
      className={cn(
        // Sin backdrop-blur: sobre un canvas animado obligaría a recalcular el desenfoque en cada cuadro
        "flex size-10 items-center justify-center rounded-full border transition-colors duration-200 [&_svg]:size-4",
        light
          ? pressed
            ? "border-ink-900 bg-ink-900 text-white"
            : "border-ink-950/10 bg-white/90 text-ink-900 hover:border-ink-950/25 hover:bg-white"
          : pressed
            ? "border-white bg-white text-ink-950"
            : "border-white/15 bg-mt-950/85 text-white hover:border-white/40 hover:bg-mt-800"
      )}
    >
      {children}
    </button>
  );
}

/**
 * Panel estilo terminal industrial (HMI): cabecera con estado y cuerpo, sin desenfoque.
 * `surface="light"` para usarlo sobre secciones blancas.
 */
export function HmiPanel({
  title,
  status,
  surface = "dark",
  className,
  children,
}: {
  title: string;
  status?: ReactNode;
  surface?: Surface;
  className?: string;
  children: ReactNode;
}) {
  const light = surface === "light";
  return (
    <div
      className={cn(
        "overflow-hidden rounded-lg border font-mono",
        light
          ? "border-neutral-200 bg-white text-ink-950 shadow-[0_18px_40px_-28px_rgba(0,0,0,0.35)]"
          : "border-white/10 bg-mt-950/90 text-white shadow-[0_24px_60px_-24px_rgba(0,0,0,0.9)]",
        className
      )}
    >
      <div
        className={cn(
          "flex items-center justify-between gap-4 border-b px-3 py-1.5 text-[10px] uppercase tracking-[0.14em]",
          light ? "border-neutral-200 bg-neutral-50 text-neutral-500" : "border-white/10 bg-white/[0.03] text-white/45"
        )}
      >
        <span>{title}</span>
        {status}
      </div>
      {children}
    </div>
  );
}

const LED_STYLES: Record<Surface, Record<"ok" | "busy" | "off", { text: string; dot: string }>> = {
  dark: {
    ok: { text: "text-emerald-300", dot: "bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.9)]" },
    busy: { text: "text-sun-300", dot: "animate-pulse bg-sun-400" },
    off: { text: "text-white/40", dot: "bg-white/30" },
  },
  light: {
    ok: { text: "text-emerald-600", dot: "bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.6)]" },
    busy: { text: "text-amber-700", dot: "animate-pulse bg-amber-500" },
    off: { text: "text-neutral-400", dot: "bg-neutral-300" },
  },
};

export function StatusLed({
  tone,
  label,
  surface = "dark",
}: {
  tone: "ok" | "busy" | "off";
  label: string;
  surface?: Surface;
}) {
  const style = LED_STYLES[surface][tone];
  return (
    <span className={cn("inline-flex items-center gap-1.5", style.text)}>
      <span className={cn("size-1.5 rounded-full", style.dot)} />
      {label}
    </span>
  );
}

type Step = { title: string; text: string };

type StepsProps = { steps: Step[]; active: number; onSelect: (i: number) => void; surface?: Surface };

/** Escritorio: pasos en columna sobre el fondo; el activo (marcado en amarillo) muestra su explicación. */
export function StepList({ steps, active, onSelect, surface = "dark" }: StepsProps) {
  const light = surface === "light";
  return (
    <ol>
      {steps.map((step, i) => {
        const isActive = i === active;
        return (
          <li key={step.title}>
            <button
              type="button"
              onClick={() => onSelect(i)}
              aria-expanded={isActive}
              className={cn(
                "group w-full border-l-2 py-2.5 pl-4 text-left transition-colors duration-200",
                isActive
                  ? "border-sun-400"
                  : light
                    ? "border-ink-950/10 hover:border-ink-950/30"
                    : "border-white/15 hover:border-white/40"
              )}
            >
              <span className="flex items-center gap-3">
                <span
                  className={cn(
                    "flex size-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold transition-colors",
                    isActive
                      ? "bg-sun-400 text-ink-950"
                      : light
                        ? "bg-ink-950/[0.06] text-ink-600 group-hover:text-ink-950"
                        : "bg-white/10 text-white/70 group-hover:text-white"
                  )}
                >
                  {i + 1}
                </span>
                <span
                  className={cn(
                    "font-heading text-[15px] font-bold transition-colors",
                    light
                      ? isActive
                        ? "text-ink-950"
                        : "text-ink-500 group-hover:text-ink-900"
                      : isActive
                        ? "text-white"
                        : "text-white/60 group-hover:text-white/90"
                  )}
                >
                  {step.title}
                </span>
              </span>
              {isActive && (
                <span className={cn("mt-1.5 block pl-9 text-sm leading-relaxed", light ? "text-ink-600" : "text-white/70")}>
                  {step.text}
                </span>
              )}
            </button>
          </li>
        );
      })}
    </ol>
  );
}

/** Móvil: pasos como fichas desplazables en horizontal. */
export function StepChips({ steps, active, onSelect, surface = "dark" }: StepsProps) {
  const light = surface === "light";
  return (
    <ol className="-mx-4 flex gap-2 overflow-x-auto px-4 [scrollbar-width:none] sm:-mx-6 sm:px-6">
      {steps.map((step, i) => {
        const isActive = i === active;
        return (
          <li key={step.title} className="shrink-0">
            <button
              type="button"
              onClick={() => onSelect(i)}
              aria-pressed={isActive}
              className={cn(
                "inline-flex items-center gap-2 rounded-full border py-1.5 pl-1.5 pr-3 text-xs font-semibold transition-colors",
                isActive
                  ? "border-sun-400 bg-sun-400 text-ink-950"
                  : light
                    ? "border-ink-950/10 bg-white/90 text-ink-700"
                    : "border-white/15 bg-mt-950/85 text-white/80"
              )}
            >
              <span
                className={cn(
                  "flex size-5 items-center justify-center rounded-full text-[10px]",
                  isActive ? "bg-ink-950 text-sun-400" : light ? "bg-ink-950/[0.06]" : "bg-white/10"
                )}
              >
                {i + 1}
              </span>
              {step.title}
            </button>
          </li>
        );
      })}
    </ol>
  );
}
