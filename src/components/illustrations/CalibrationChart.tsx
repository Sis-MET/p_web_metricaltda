"use client";

import { useRef } from "react";
import { m, useInView } from "framer-motion";
import { HmiPanel, StatusLed } from "@/components/demos/DemoShell";
import { EASE_OUT } from "@/lib/motion";

/*
 * Curva de calibración ilustrativa (como en un certificado):
 * error de indicación por punto de carga, con su incertidumbre expandida,
 * dentro del error máximo permitido (EMP) escalonado de una balanza clase III.
 */

const W = 420;
const H = 206;
const X0 = 46;
const X1 = 404;
const Y_ZERO = 102;
const PX_PER_E = 44;
const CAPACITY = 3000; // en divisiones de verificación (e)

const COLORS = {
  grid: "rgba(0,0,0,0.06)",
  axis: "rgba(0,0,0,0.28)",
  // Banda de tolerancia en amarillo Métrica; curva y medidas en carbón
  empFill: "rgba(249,227,0,0.2)",
  empStroke: "rgba(168,153,0,0.75)",
  curve: "#171716",
  uncertainty: "#62625e",
};

const x = (load: number) => X0 + (load / CAPACITY) * (X1 - X0);
const y = (error: number) => Y_ZERO - error * PX_PER_E;

const EMP_STEPS = [
  { from: 0, to: 500, mpe: 0.5 },
  { from: 500, to: 2000, mpe: 1 },
  { from: 2000, to: 3000, mpe: 1.5 },
];

const POINTS = [
  { load: 0, error: 0, u: 0.2 },
  { load: 300, error: 0.1, u: 0.22 },
  { load: 750, error: -0.25, u: 0.28 },
  { load: 1500, error: 0.35, u: 0.32 },
  { load: 2250, error: -0.45, u: 0.38 },
  { load: 3000, error: 0.6, u: 0.42 },
];

const upper = EMP_STEPS.flatMap((s) => [`${x(s.from)},${y(s.mpe)}`, `${x(s.to)},${y(s.mpe)}`]);
const lower = [...EMP_STEPS]
  .reverse()
  .flatMap((s) => [`${x(s.to)},${y(-s.mpe)}`, `${x(s.from)},${y(-s.mpe)}`]);
const EMP_BAND = [...upper, ...lower].join(" ");
const CURVE = POINTS.map((p) => `${x(p.load)},${y(p.error)}`).join(" ");

export function CalibrationChart() {
  const ref = useRef<HTMLDivElement>(null);
  // Se dibuja cada vez que entra en pantalla y se borra al salir
  const inView = useInView(ref, { amount: 0.4 });

  return (
    <div ref={ref}>
      <HmiPanel
        surface="light"
        title="Resultados de calibración · Ejemplo"
        status={<StatusLed surface="light" tone="ok" label="Conforme" />}
      >
        <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Ejemplo de curva de calibración: todos los puntos dentro del error máximo permitido">
          {/* Retícula */}
          {[-1.5, -1, -0.5, 0.5, 1, 1.5].map((e) => (
            <line key={e} x1={X0} x2={X1} y1={y(e)} y2={y(e)} stroke={COLORS.grid} />
          ))}
          {[500, 1000, 1500, 2000, 2500, 3000].map((l) => (
            <line key={l} x1={x(l)} x2={x(l)} y1={y(1.6)} y2={y(-1.6)} stroke={COLORS.grid} />
          ))}
          <line x1={X0} x2={X1} y1={Y_ZERO} y2={Y_ZERO} stroke={COLORS.axis} />
          <line x1={X0} x2={X0} y1={y(1.6)} y2={y(-1.6)} stroke={COLORS.axis} />

          {/* EMP escalonado */}
          <m.polygon
            points={EMP_BAND}
            fill={COLORS.empFill}
            stroke={COLORS.empStroke}
            strokeDasharray="4 3"
            initial={{ opacity: 0 }}
            animate={{ opacity: inView ? 1 : 0 }}
            transition={{ duration: 0.6 }}
          />

          {/* Curva de error */}
          <m.polyline
            points={CURVE}
            fill="none"
            stroke={COLORS.curve}
            strokeWidth={1.5}
            initial={{ pathLength: 0 }}
            animate={{ pathLength: inView ? 1 : 0 }}
            transition={{ duration: 1.2, ease: EASE_OUT, delay: 0.3 }}
          />

          {/* Puntos con incertidumbre U (k = 2) */}
          {POINTS.map((p, i) => (
            <m.g
              key={p.load}
              initial={{ opacity: 0 }}
              animate={{ opacity: inView ? 1 : 0 }}
              transition={{ duration: 0.3, delay: 0.35 + i * 0.16 }}
            >
              <line x1={x(p.load)} x2={x(p.load)} y1={y(p.error + p.u)} y2={y(p.error - p.u)} stroke={COLORS.uncertainty} strokeWidth={1.5} />
              <line x1={x(p.load) - 4} x2={x(p.load) + 4} y1={y(p.error + p.u)} y2={y(p.error + p.u)} stroke={COLORS.uncertainty} />
              <line x1={x(p.load) - 4} x2={x(p.load) + 4} y1={y(p.error - p.u)} y2={y(p.error - p.u)} stroke={COLORS.uncertainty} />
              <circle cx={x(p.load)} cy={y(p.error)} r={3.5} fill="#ffffff" stroke={COLORS.curve} strokeWidth={1.5} />
            </m.g>
          ))}

          {/* Ejes */}
          <g className="fill-neutral-500 font-mono text-[9px]">
            <text x={X0 - 6} y={y(1.5) + 3} textAnchor="end">+1,5e</text>
            <text x={X0 - 6} y={Y_ZERO + 3} textAnchor="end">0</text>
            <text x={X0 - 6} y={y(-1.5) + 3} textAnchor="end">−1,5e</text>
            <text x={x(500)} y={H - 6} textAnchor="middle">500e</text>
            <text x={x(2000)} y={H - 6} textAnchor="middle">2000e</text>
            <text x={X1} y={H - 6} textAnchor="end">Máx.</text>
            <text x={X0 + 4} y={14}>Error</text>
            <text x={X1} y={14} textAnchor="end">Carga →</text>
          </g>
        </svg>

        <div className="flex flex-wrap gap-x-4 gap-y-1 border-t border-neutral-200 px-3 py-2 text-[10px] text-neutral-500">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-3 border border-dashed border-sun-600 bg-sun-400/30" /> EMP (error máximo permitido)
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="size-2 rounded-full border border-ink-900" /> Error de indicación
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-px bg-ink-500" /> Incertidumbre U (k = 2)
          </span>
        </div>
      </HmiPanel>
    </div>
  );
}
