"use client";

import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "framer-motion";
import { Check, Loader2 } from "lucide-react";
import { HmiPanel, StatusLed } from "@/components/demos/DemoShell";
import { cn } from "@/lib/utils";

/** Diagnóstico de equipo ilustrativo: los puntos de revisión se van marcando al entrar en pantalla. */

const CHECKS = [
  { label: "Celdas de carga", result: "OK" },
  { label: "Cableado y conexiones", result: "OK" },
  { label: "Terminal de pesaje", result: "OK" },
  { label: "Nivelación y estructura", result: "OK" },
  { label: "Repuestos", result: "Originales" },
];

const STEP_MS = 650;

export function SupportDiagnostic() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });
  const reducedMotion = useReducedMotion();
  const [done, setDone] = useState(0);

  useEffect(() => {
    if (!inView || reducedMotion || done >= CHECKS.length) return;
    const id = setTimeout(() => setDone(done + 1), STEP_MS);
    return () => clearTimeout(id);
  }, [inView, reducedMotion, done]);

  const completed = reducedMotion ? CHECKS.length : done;
  const finished = completed >= CHECKS.length;

  return (
    <div ref={ref}>
      <HmiPanel
        surface="light"
        title="Diagnóstico de equipo"
        status={
          finished ? (
            <StatusLed surface="light" tone="ok" label="Equipo operativo" />
          ) : (
            <StatusLed surface="light" tone="busy" label="Revisando" />
          )
        }
      >
        <ul className="divide-y divide-neutral-100">
          {CHECKS.map((check, i) => {
            const isDone = i < completed;
            const isRunning = !isDone && i === completed && inView;
            return (
              <li key={check.label} className="flex items-center justify-between gap-4 px-4 py-3 text-xs">
                <span className="flex items-center gap-3 text-neutral-700">
                  <span className="w-5 text-neutral-300 tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                  {check.label}
                </span>
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 uppercase tracking-wider transition-colors duration-300",
                    isDone ? "text-emerald-600" : isRunning ? "text-amber-600" : "text-neutral-300"
                  )}
                >
                  {isDone ? (
                    <Check className="size-3.5" aria-hidden />
                  ) : isRunning ? (
                    <Loader2 className="size-3.5 animate-spin" aria-hidden />
                  ) : null}
                  {isDone ? check.result : isRunning ? "Revisando" : "En espera"}
                </span>
              </li>
            );
          })}
        </ul>

        {/* Avance del diagnóstico */}
        <div className="border-t border-neutral-200 px-4 py-3">
          <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-neutral-500">
            <span>Soporte remoto · Visita en terreno</span>
            <span className="tabular-nums">
              {completed}/{CHECKS.length}
            </span>
          </div>
          <div className="mt-2 h-1 overflow-hidden rounded-full bg-neutral-100">
            <div
              className="h-full origin-left rounded-full bg-emerald-500 transition-transform duration-500 ease-out"
              style={{ transform: `scaleX(${completed / CHECKS.length})` }}
            />
          </div>
        </div>
      </HmiPanel>
    </div>
  );
}
