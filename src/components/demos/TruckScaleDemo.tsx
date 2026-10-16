"use client";

import { useRef, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useReducedMotion } from "framer-motion";
import { ArrowRight, Move3d, Pause, Play, RotateCcw, ScanEye } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { TruckReading } from "@/components/three/TruckScaleScene";
import {
  CELLS,
  DECK_HALF_LENGTH,
  DECK_WIDTH,
  HOTSPOTS,
  RAMP_LENGTH,
  SUPPORT_X,
  TRUCKS,
  type TruckConfig,
} from "@/components/three/truckScaleModel";
import { productHref } from "@/content/catalog";
import { createStore, useStore, type Store } from "@/lib/store";
import {
  HmiPanel,
  StatusLed,
  StepChips,
  StepList,
  ViewerButton,
  ViewerPlaceholder,
  useDemoActivation,
  useIsDesktop,
} from "./DemoShell";
import { cn } from "@/lib/utils";

// three.js se descarga aparte, al acercarse a la sección. El aviso de carga lo pone el demo:
// cubre la descarga y la compilación de shaders
const TruckScaleScene = dynamic(() => import("@/components/three/scenes").then((m) => m.TruckScaleScene), { ssr: false });

const TRUCK_SCALE = { category: "basculas-de-camiones", slug: "powercell-pdx" } as const;

const INTRO =
  "Vea cómo cada eje carga las celdas más cercanas mientras el camión avanza. Active los rayos X para ver las celdas y la red digital bajo la plataforma.";

const STEPS = [
  {
    title: "Plataforma",
    text: "Módulos de acero reciben el peso de cada eje y lo transmiten a las líneas de apoyo, sin importar en qué parte de la plataforma esté el camión.",
  },
  {
    title: "Celdas POWERCELL PDX",
    text: "Cada celda mide la fuerza en su punto de apoyo y convierte la señal a digital dentro de la propia celda, sin cajas de conexión analógicas.",
  },
  {
    title: "Red digital",
    text: "Las celdas se conectan en cadena y envían sus lecturas al terminal. El sistema supervisa cada celda y alerta ante cualquier anomalía antes de que afecte la medición.",
  },
  {
    title: "Terminal de pesaje",
    text: "Suma las lecturas de las ocho celdas, muestra el peso bruto estable y lo integra a su sistema para emitir tickets y reportes.",
  },
];

const EMPTY_READING: TruckReading = {
  total: 0,
  cells: CELLS.map(() => 0),
  axlesOnDeck: 0,
  axles: [],
  displayed: 0,
  stable: false,
};

const kg = new Intl.NumberFormat("es-BO", { maximumFractionDigits: 0 });
const tonnes = new Intl.NumberFormat("es-BO", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
/** Las básculas de camiones indican en divisiones de 10 kg */
const toDivision = (value: number) => Math.round(value / 10) * 10;

// Escritorio: el texto va a la izquierda, así que el modelo se corre a la derecha
const SHIFT_DESKTOP = { x: 0.19, y: 0 };
const SHIFT_MOBILE = { x: 0, y: -0.02 };

/* ─── Vista en planta de la plataforma (estilo HMI) ─────────────────────── */

const PLAN = { width: 320, height: 118, deckTop: 40, deckBottom: 84 };
const metersToX = (m: number) => PLAN.width / 2 + (m * (PLAN.width / 2)) / (DECK_HALF_LENGTH + RAMP_LENGTH);
const sideToY = (z: number) =>
  (PLAN.deckTop + PLAN.deckBottom) / 2 + (z / (DECK_WIDTH / 2)) * ((PLAN.deckBottom - PLAN.deckTop) / 2) * 0.85;
const DECK_X0 = metersToX(-DECK_HALF_LENGTH);
const DECK_X1 = metersToX(DECK_HALF_LENGTH);
/** Inicio de la rampa de entrada (borde izquierdo de la vista) */
const RAMP_X = metersToX(-(DECK_HALF_LENGTH + RAMP_LENGTH));

function PlanView({ readings, truck }: { readings: Store<TruckReading>; truck: TruckConfig }) {
  const r = useStore(readings);
  const max = Math.max(...r.cells, 1);

  return (
    <svg viewBox={`0 0 ${PLAN.width} ${PLAN.height}`} className="h-auto w-full" role="img" aria-label="Vista en planta: carga por celda y posición de los ejes">
      {/* Retícula de 1 m */}
      {Array.from({ length: (DECK_HALF_LENGTH + RAMP_LENGTH) * 2 + 1 }, (_, i) => {
        const x = metersToX(i - DECK_HALF_LENGTH - RAMP_LENGTH);
        return <line key={i} x1={x} x2={x} y1={14} y2={PLAN.height - 14} stroke="rgba(255,255,255,0.04)" />;
      })}

      {/* Rampas y plataforma */}
      <polygon
        points={`${RAMP_X},${PLAN.deckTop + 6} ${DECK_X0},${PLAN.deckTop} ${DECK_X0},${PLAN.deckBottom} ${RAMP_X},${PLAN.deckBottom - 6}`}
        fill="rgba(255,255,255,0.03)"
        stroke="rgba(255,255,255,0.12)"
      />
      <polygon
        points={`${PLAN.width},${PLAN.deckTop + 6} ${DECK_X1},${PLAN.deckTop} ${DECK_X1},${PLAN.deckBottom} ${PLAN.width},${PLAN.deckBottom - 6}`}
        fill="rgba(255,255,255,0.03)"
        stroke="rgba(255,255,255,0.12)"
      />
      <rect
        x={DECK_X0}
        y={PLAN.deckTop}
        width={DECK_X1 - DECK_X0}
        height={PLAN.deckBottom - PLAN.deckTop}
        fill="rgba(0,0,0,0.35)"
        stroke="rgba(249,227,0,0.5)"
      />
      {[-3, 3].map((m) => (
        <line
          key={m}
          x1={metersToX(m)}
          x2={metersToX(m)}
          y1={PLAN.deckTop}
          y2={PLAN.deckBottom}
          stroke="rgba(249,227,0,0.3)"
          strokeDasharray="3 3"
        />
      ))}

      {/* Ejes del camión */}
      {r.axles.map((x, i) => {
        if (Math.abs(x) > DECK_HALF_LENGTH + RAMP_LENGTH) return null;
        const onDeck = Math.abs(x) <= DECK_HALF_LENGTH;
        const px = metersToX(x);
        const dual = truck.axles[i]?.dual;
        return (
          <g key={i} opacity={onDeck ? 0.95 : 0.35}>
            <line x1={px} x2={px} y1={PLAN.deckTop + 3} y2={PLAN.deckBottom - 3} stroke="#ffffff" strokeWidth={1.2} />
            <rect x={px - (dual ? 2.5 : 1.5)} y={PLAN.deckTop + 1} width={dual ? 5 : 3} height={6} fill="#ffffff" />
            <rect x={px - (dual ? 2.5 : 1.5)} y={PLAN.deckBottom - 7} width={dual ? 5 : 3} height={6} fill="#ffffff" />
          </g>
        );
      })}

      {/* Celdas: intensidad según la carga, lectura en toneladas */}
      {CELLS.map((cell, i) => {
        const x = metersToX(cell.x);
        const y = sideToY(cell.z);
        const value = r.cells[i] ?? 0;
        const top = cell.z < 0;
        const anchor = cell.support === 0 ? "start" : cell.support === SUPPORT_X.length - 1 ? "end" : "middle";
        const dx = anchor === "start" ? -5 : anchor === "end" ? 5 : 0;
        return (
          <g key={cell.id}>
            <rect x={x - 4.5} y={y - 4.5} width={9} height={9} fill="#1a1a19" stroke="rgba(249,227,0,0.7)" />
            <rect x={x - 4.5} y={y - 4.5} width={9} height={9} fill="#f9e300" opacity={value / max} />
            <text
              x={x + dx}
              y={top ? PLAN.deckTop - 8 : PLAN.deckBottom + 15}
              textAnchor={anchor}
              className="fill-white/80 text-[8.5px]"
            >
              <tspan className="fill-sun-400">{cell.id}</tspan> {tonnes.format(value / 1000)}
            </text>
          </g>
        );
      })}

      <text x={2} y={PLAN.height - 2} className="fill-white/35 text-[7px] tracking-widest">
        ENTRADA
      </text>
      <text x={PLAN.width - 2} y={PLAN.height - 2} textAnchor="end" className="fill-white/35 text-[7px] tracking-widest">
        SALIDA
      </text>
    </svg>
  );
}

/* ─── Terminal (display + estado) ───────────────────────────────────────── */

function Terminal({ readings, truck }: { readings: Store<TruckReading>; truck: TruckConfig }) {
  const r = useStore(readings);
  const status = r.stable ? (
    <StatusLed tone="ok" label="Estable" />
  ) : r.total > 0 ? (
    <StatusLed tone="busy" label="En movimiento" />
  ) : (
    <StatusLed tone="off" label="Sin carga" />
  );

  return (
    <HmiPanel title="Terminal de pesaje · Red PDX 8/8" status={status} className="w-full sm:w-auto">
      <div className="flex flex-col sm:flex-row">
        <div className="flex flex-col justify-center px-4 py-3 sm:w-48 sm:border-r sm:border-white/10" aria-live="polite" aria-atomic="true">
          <p className="text-[10px] uppercase tracking-[0.14em] text-white/45">Peso bruto</p>
          <p className="mt-1 text-right text-3xl font-semibold tabular-nums tracking-tight text-white sm:text-[2rem]">
            {kg.format(toDivision(r.displayed))}
            <span className="ml-1.5 text-sm font-medium text-white/45">kg</span>
          </p>
          <div className="mt-2 flex items-center justify-between gap-2 text-[10px] uppercase tracking-wider">
            <span className={cn(r.total === 0 ? "text-sun-400" : "text-white/25")}>→0←</span>
            <span className="text-white/25">Neto</span>
            <span className="text-white/60">
              Ejes {r.axlesOnDeck}/{truck.axles.length}
            </span>
          </div>
        </div>
        <div className="hidden px-3 py-2 sm:block sm:w-[22rem]">
          <PlanView readings={readings} truck={truck} />
        </div>
      </div>
    </HmiPanel>
  );
}

/* ─── Demo ──────────────────────────────────────────────────────────────── */

export function TruckScaleDemo() {
  const reducedMotion = useReducedMotion();
  const isDesktop = useIsDesktop();
  const viewerRef = useRef<HTMLDivElement>(null);
  const { shouldMount, isActive, isReady, onReady } = useDemoActivation(viewerRef);
  const [readings] = useState(() => createStore<TruckReading>(EMPTY_READING));
  const hotspotElements = useRef<(HTMLElement | null)[]>([]);
  const cellLabelElements = useRef<(HTMLElement | null)[]>([]);

  const [truckIndex, setTruckIndex] = useState(2);
  // Con "reducir movimiento" arranca en pausa hasta que el usuario lo active
  const [userPlaying, setUserPlaying] = useState<boolean | null>(null);
  const playing = userPlaying ?? !reducedMotion;
  const [xray, setXray] = useState(false);
  const [step, setStep] = useState(0);

  const truck = TRUCKS[truckIndex];

  const selectStep = (next: number) => {
    setStep(next);
    // Las celdas y la red se ven mejor con la plataforma transparente
    if (next === 2 || next === 3) setXray(true);
  };
  const toggleStep = (i: number) => selectStep(step === i + 1 ? 0 : i + 1);

  const controls = (
    <div className="flex flex-wrap items-center gap-2">
      <div role="radiogroup" aria-label="Tipo de camión" className="flex rounded-full border border-white/10 bg-mt-950/85 p-1">
        {TRUCKS.map((t, i) => (
          <button
            key={t.id}
            type="button"
            role="radio"
            aria-checked={i === truckIndex}
            title={t.label}
            onClick={() => setTruckIndex(i)}
            className={cn(
              "rounded-full px-3 py-1.5 text-xs font-semibold transition-colors duration-200 sm:text-sm",
              i === truckIndex ? "bg-white text-mt-950" : "text-white/70 hover:text-white"
            )}
          >
            {t.short}
          </button>
        ))}
      </div>
      <ViewerButton label={playing ? "Pausar" : "Reproducir"} onClick={() => setUserPlaying(!playing)}>
        {playing ? <Pause /> : <Play />}
      </ViewerButton>
      <ViewerButton label="Rayos X" pressed={xray} onClick={() => setXray((x) => !x)}>
        <ScanEye />
      </ViewerButton>
      <ViewerButton label="Vista general" onClick={() => selectStep(0)}>
        <RotateCcw />
      </ViewerButton>
    </div>
  );

  return (
    <section
      id="demo-camion"
      data-header-theme="dark"
      aria-label="Demo 3D: báscula de camiones"
      className="relative isolate flex min-h-svh scroll-mt-0 flex-col overflow-hidden bg-mt-900 text-white"
    >
      {/* Escena a pantalla completa */}
      <div ref={viewerRef} className="absolute inset-0 [&_*]:touch-pan-y!">
        {shouldMount && (
          <TruckScaleScene
            truck={truck}
            playing={playing}
            xray={xray}
            step={step}
            active={isActive}
            onReady={onReady}
            shift={isDesktop ? SHIFT_DESKTOP : SHIFT_MOBILE}
            readings={readings}
            hotspotElements={hotspotElements}
            cellLabelElements={cellLabelElements}
          />
        )}
        {!isReady && <ViewerPlaceholder />}
      </div>

      {/* Degradados para leer el texto sobre el modelo */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[45%] bg-gradient-to-b from-mt-900 via-mt-900/70 to-transparent lg:hidden" />
      <div aria-hidden className="pointer-events-none absolute inset-y-0 left-0 hidden w-[55%] bg-gradient-to-r from-mt-900 via-mt-900/80 to-transparent lg:block" />
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-mt-900 via-mt-900/60 to-transparent" />

      {/* Puntos numerados y etiquetas de celdas: la escena los posiciona en cada cuadro */}
      <div className="pointer-events-none absolute inset-0">
        {HOTSPOTS.map((h, i) => (
          <button
            key={h.id}
            ref={(el) => {
              hotspotElements.current[i] = el;
            }}
            type="button"
            onClick={() => selectStep(step === h.id ? 0 : h.id)}
            aria-label={`Ver ${h.label}`}
            style={{ opacity: 0, visibility: "hidden" }}
            className={cn(
              "pointer-events-auto absolute left-0 top-0 flex size-8 items-center justify-center rounded-full border text-xs font-bold transition-[background-color,border-color,color] duration-200",
              step === h.id
                ? "border-sun-400 bg-sun-400 text-ink-950"
                : "border-white/50 bg-mt-950/85 text-white ring-4 ring-mt-300/20 hover:border-white hover:bg-mt-800"
            )}
          >
            {h.id}
          </button>
        ))}
        {CELLS.map((cell, i) => (
          <span
            key={cell.id}
            ref={(el) => {
              cellLabelElements.current[i] = el;
            }}
            style={{ opacity: 0, visibility: "hidden" }}
            className="absolute left-0 top-0 select-none rounded bg-mt-950/90 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-sun-200 ring-1 ring-white/15 transition-[opacity,visibility] duration-300"
          >
            {cell.id}
          </span>
        ))}
      </div>

      <div className="pointer-events-none relative mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 pb-5 pt-24 sm:px-6 lg:px-8 lg:pb-10 lg:pt-28">
        <div className="flex items-start justify-between gap-8">
          {/* Texto */}
          <div className="pointer-events-auto max-w-md">
            <p className="font-heading text-xs font-bold uppercase tracking-[0.18em] text-mt-200">
              Demo 3D · POWERCELL PDX
            </p>
            <h2 className="mt-3 font-heading text-3xl font-extrabold leading-[1.05] tracking-tight sm:text-4xl lg:text-5xl">
              Básculas de camiones
            </h2>
            <p className="mt-3 hidden text-base leading-relaxed text-white/70 lg:block">{INTRO}</p>
            {/* Móvil: el paso elegido reemplaza la descripción */}
            <p className="mt-3 line-clamp-4 text-sm leading-relaxed text-white/70 sm:text-base lg:hidden" aria-live="polite">
              {step > 0 ? STEPS[step - 1].text : INTRO}
            </p>

            <div className="mt-7 hidden lg:block">
              <StepList steps={STEPS} active={step - 1} onSelect={toggleStep} />
            </div>

            <div className="mt-8 hidden gap-3 lg:flex lg:w-max">
              <Button asChild variant="light">
                <Link href={productHref(TRUCK_SCALE)}>
                  Ver la báscula POWERCELL PDX <ArrowRight />
                </Link>
              </Button>
              <Button asChild variant="glass">
                <Link href="/productos">Ver todos los productos</Link>
              </Button>
            </div>
          </div>

          {/* Controles (escritorio) */}
          <div className="pointer-events-auto hidden lg:block">{controls}</div>
        </div>

        {/* Pie: terminal de pesaje */}
        <div className="mt-auto flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <p className="hidden items-center gap-2 text-xs text-white/50 lg:inline-flex">
            <Move3d className="size-4" aria-hidden />
            Arrastre para girar la vista
          </p>
          <div className="pointer-events-auto lg:hidden">{controls}</div>
          <div className="pointer-events-auto">
            <Terminal readings={readings} truck={truck} />
          </div>
          <div className="pointer-events-auto lg:hidden">
            <StepChips steps={STEPS} active={step - 1} onSelect={toggleStep} />
          </div>
        </div>
      </div>
    </section>
  );
}
