"use client";

import { Suspense, useEffect, useMemo, useRef, useState, type KeyboardEvent, type ReactNode, type RefObject } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  CloudRain,
  Expand,
  FoldHorizontal,
  Gauge,
  Layers,
  Pause,
  Play,
  RotateCcw,
  ScanEye,
  SkipBack,
  Truck,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { TruckReading } from "@/components/three/vts200/Vts200Scene";
import { FOCUS_CELL, labelsFor, layoutFor, type Cell, type Layout } from "@/components/three/vts200/model";
import {
  DEFAULT_SIZE,
  DEMO_TITLE,
  LOAD_CELL_NOTE,
  LOAD_CELL_STEPS,
  PHASES,
  PROJECT_SECTION_ID,
  PROJECT_STEPS,
  SCALE_SIZES,
  TRUCK_SCALE_PRODUCT,
  VTS200,
  phaseOf,
  quoteSummary,
  sizeLabel,
  stepFromQuery,
} from "@/content/truckScaleProject";
import { formDrafts } from "@/lib/form-drafts";
import { quote } from "@/lib/quote-store";
import { QUOTE_HREF } from "@/lib/routes";
import { createStore, useStore, type Store } from "@/lib/store";
import { cn } from "@/lib/utils";
import { DemoDialog } from "./DemoDialog";
import { HmiPanel, StatusLed, ViewerButton, useDemoActivation, useIsDesktop } from "./DemoShell";
import { ViewerPlaceholder } from "./ViewerPlaceholder";

// three.js se descarga al abrir el demo, nunca con la página
const Vts200Scene = dynamic(() => import("@/components/three/scenes").then((m) => m.Vts200Scene), { ssr: false });

const LAST = PROJECT_STEPS.length - 1;

/** Acción propia de cada paso (el primero elige el largo; el último, además, pesa un camión) */
const TOGGLES: ({ label: string; icon: LucideIcon; hint: string } | null)[] = [
  null,
  { label: "Ver estratos del suelo", icon: Layers, hint: "Capas del terreno a la vista en el talud" },
  { label: "Ver armadura", icon: ScanEye, hint: "El hormigón se vuelve transparente" },
  { label: "Simular lluvia", icon: CloudRain, hint: "El agua corre a los sumideros y sale por la cámara" },
  { label: "Ver empuje del suelo", icon: FoldHorizontal, hint: "Crece con la profundidad: los muros lo resisten" },
  { label: "Ver celdas de carga", icon: Gauge, hint: "La plataforma se vuelve transparente y una celda se abre por dentro" },
];

/** Imagen fija de cada paso (capturas de la página): el momento que mejor lo muestra */
const STILL_PROGRESS = [1, 1, 0.76, 0.8, 1, 1];

const EMPTY_READING: TruckReading = { total: 0, cells: [], axlesOnDeck: 0, displayed: 0, stable: false };

const kg = new Intl.NumberFormat("es-BO", { maximumFractionDigits: 0 });
const tonnes = new Intl.NumberFormat("es-BO", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const toDivision = (value: number) => Math.round(value / VTS200.division) * VTS200.division;
const width = String(VTS200.width).replace(".", ",");

function factsFor(step: number, layout: Layout): string[] {
  const { size, cells, modules } = layout;
  if (step === 0) return [`${size.length} × ${width} m`, `${size.capacity / 1000} t de capacidad`];
  if (step === 2) return [`${cells.length} zapatas con pedestal`, "Vigas de amarre en ambos sentidos"];
  if (step === LAST) return [`${modules.length} módulos de acero`, `${cells.length} celdas ${VTS200.cells}`, `División de ${VTS200.division} kg`];
  return [];
}

// Escritorio: el texto va a la izquierda, así que el modelo se corre a la derecha
const SHIFT_DESKTOP = { x: 0.14, y: 0 };
const SHIFT_MOBILE = { x: 0, y: 0.04 };
const NO_SHIFT = { x: 0, y: 0 };

/* ─── Avance del paso ───────────────────────────────────────────────────── */

function ProgressControls({
  progress,
  playing,
  onPlay,
  onScrub,
  step,
  onStep,
}: {
  progress: Store<number>;
  playing: boolean;
  onPlay: (playing: boolean) => void;
  onScrub: (value: number) => void;
  step: number;
  onStep: (step: number) => void;
}) {
  const p = useStore(progress);
  const done = p >= 1;
  const percent = Math.round(p * 100);
  const togglePlay = () => {
    if (!done) return onPlay(!playing);
    onScrub(0);
    onPlay(true);
  };

  return (
    <div className="flex items-center gap-2 sm:gap-3">
      <ViewerButton label="Paso anterior" onClick={() => onStep(step - 1)}>
        <ChevronLeft />
      </ViewerButton>
      <ViewerButton
        label={done ? "Repetir el paso" : playing ? "Pausar" : "Reproducir"}
        onClick={togglePlay}
      >
        {done ? <RotateCcw /> : playing ? <Pause /> : <Play />}
      </ViewerButton>
      <label className="flex min-w-0 flex-1 items-center gap-3">
        <span className="sr-only">Avance de obra</span>
        <input
          type="range"
          min={0}
          max={100}
          value={percent}
          onChange={(event) => onScrub(Number(event.target.value) / 100)}
          className="h-1.5 w-full cursor-pointer accent-white"
        />
        <span className="w-24 shrink-0 text-right font-mono text-[11px] uppercase tracking-wider text-white/60 tabular-nums">
          Avance {percent} %
        </span>
      </label>
      <button
        type="button"
        onClick={() => onStep(step < LAST ? step + 1 : 0)}
        aria-label={step < LAST ? "Paso siguiente" : "Volver al primer paso"}
        className={cn(
          "inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full border px-3 text-sm font-semibold transition-colors duration-200 sm:px-4 [&_svg]:size-4",
          done
            ? "border-white bg-white text-ink-950 hover:bg-ink-50"
            : "border-white/15 bg-mt-950/85 text-white hover:border-white/40 hover:bg-mt-800"
        )}
      >
        <span className="hidden sm:inline">{step < LAST ? "Siguiente" : "Ver desde el inicio"}</span>
        {step < LAST ? <ChevronRight aria-hidden /> : <SkipBack aria-hidden />}
      </button>
    </div>
  );
}

/** Barra bajo el paso en curso: se llena con su avance */
function StepFill({ progress }: { progress: Store<number> }) {
  const p = useStore(progress);
  return <span className="absolute inset-y-0 left-0 bg-sun-400" style={{ width: `${p * 100}%` }} />;
}

const PHASE_COUNTS = PHASES.map((phase) => PROJECT_STEPS.filter((s) => s.phase === phase.id).length);
/** Índice del primer paso de cada fase */
const PHASE_FIRST = PHASE_COUNTS.map((_, p) => PHASE_COUNTS.slice(0, p).reduce((sum, n) => sum + n, 0));

function Timeline({ step, onStep, progress }: { step: number; onStep: (step: number) => void; progress: Store<number> }) {
  const chips = useRef<HTMLOListElement>(null);

  // Celulares: la ficha del paso en curso queda a la vista en la fila desplazable
  useEffect(() => {
    chips.current
      ?.querySelector('[aria-current="step"]')
      ?.scrollIntoView({ inline: "nearest", block: "nearest", behavior: "smooth" });
  }, [step]);

  const button = (i: number, compact: boolean) => {
    const s = PROJECT_STEPS[i];
    const isCurrent = i === step;
    return (
      <button
        type="button"
        onClick={() => onStep(i)}
        aria-current={isCurrent ? "step" : undefined}
        className={cn(
          "group relative flex w-full items-center gap-2 overflow-hidden rounded-lg border text-left transition-colors duration-200",
          compact ? "py-1.5 pl-1.5 pr-3" : "px-3 py-2",
          isCurrent ? "border-white/40 bg-mt-950/95" : "border-white/10 bg-mt-950/70 hover:border-white/30"
        )}
      >
        <span
          className={cn(
            "flex size-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold",
            isCurrent ? "bg-sun-400 text-ink-950" : i < step ? "bg-white/85 text-ink-950" : "bg-white/10 text-white/70"
          )}
        >
          {i + 1}
        </span>
        <span className={cn("truncate text-xs font-semibold", isCurrent ? "text-white" : "text-white/65 group-hover:text-white")}>
          {s.short}
        </span>
        <span aria-hidden className="absolute inset-x-0 bottom-0 h-0.5 bg-white/10">
          {isCurrent ? <StepFill progress={progress} /> : i < step && <span className="absolute inset-0 bg-white/50" />}
        </span>
      </button>
    );
  };

  return (
    <nav aria-label="Pasos del proyecto">
      {/* Escritorio: pasos agrupados por fase */}
      <div className="hidden gap-3 lg:grid" style={{ gridTemplateColumns: PHASE_COUNTS.map((n) => `${n}fr`).join(" ") }}>
        {PHASES.map((phase, p) => (
          <div key={phase.id}>
            <p className="mb-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-white/45">
              Fase {p + 1} · {phase.name}
            </p>
            <ol className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${PHASE_COUNTS[p]}, minmax(0, 1fr))` }}>
              {Array.from({ length: PHASE_COUNTS[p] }, (_, k) => (
                <li key={PHASE_FIRST[p] + k}>{button(PHASE_FIRST[p] + k, false)}</li>
              ))}
            </ol>
          </div>
        ))}
      </div>
      {/* Móvil: fichas desplazables */}
      <ol ref={chips} className="-mx-4 flex gap-2 overflow-x-auto px-4 [scrollbar-width:none] sm:-mx-6 sm:px-6 lg:hidden">
        {PROJECT_STEPS.map((s, i) => (
          <li key={s.title} className="shrink-0">
            {button(i, true)}
          </li>
        ))}
      </ol>
    </nav>
  );
}

/* ─── Acciones de cada paso ─────────────────────────────────────────────── */

function SizeSelector({ sizeIndex, onSize }: { sizeIndex: number; onSize: (i: number) => void }) {
  return (
    <div role="radiogroup" aria-label="Largo de la báscula" className="flex w-max rounded-full border border-white/10 bg-mt-950/85 p-1">
      {SCALE_SIZES.map((size, i) => (
        <button
          key={size.length}
          type="button"
          role="radio"
          aria-checked={i === sizeIndex}
          onClick={() => onSize(i)}
          className={cn(
            "rounded-full px-3 py-1.5 text-xs font-semibold transition-colors duration-200 sm:text-sm",
            i === sizeIndex ? "bg-white text-mt-950" : "text-white/70 hover:text-white"
          )}
        >
          {sizeLabel(size)}
        </button>
      ))}
    </div>
  );
}

function ActionButton({
  icon: Icon,
  label,
  pressed,
  disabled,
  onClick,
}: {
  icon: LucideIcon;
  label: string;
  pressed?: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={pressed}
      disabled={disabled}
      className={cn(
        "inline-flex h-10 items-center gap-2 rounded-full border px-4 text-sm font-semibold transition-colors duration-200 disabled:opacity-60 [&_svg]:size-4",
        pressed ? "border-white bg-white text-mt-950" : "border-white/20 bg-mt-950/85 text-white hover:border-white/50 hover:bg-mt-800"
      )}
    >
      <Icon aria-hidden />
      {label}
    </button>
  );
}

/** Indicador de la caseta: aparece cuando la báscula ya está montada */
function Indicator({ readings, progress, capacity }: { readings: Store<TruckReading>; progress: Store<number>; capacity: number }) {
  const r = useStore(readings);
  const ready = useStore(progress) >= 0.9;
  if (!ready) return null;

  const status = r.stable ? (
    <StatusLed tone="ok" label="Estable" />
  ) : r.total > 0 ? (
    <StatusLed tone="busy" label="En movimiento" />
  ) : (
    <StatusLed tone="off" label="Sin carga" />
  );

  return (
    <HmiPanel title="Indicador · Caseta" status={status} className="w-full sm:w-80">
      <div className="flex items-center justify-between gap-3 px-4 py-2 sm:block sm:py-3" aria-live="polite" aria-atomic="true">
        <p className="text-[10px] uppercase tracking-[0.14em] text-white/45">Peso bruto</p>
        <p className="text-right text-2xl font-semibold tabular-nums tracking-tight text-white sm:mt-1 sm:text-3xl">
          {kg.format(toDivision(r.displayed))}
          <span className="ml-1.5 text-sm font-medium text-white/45">kg</span>
        </p>
        <div className="mt-2 hidden items-center justify-between gap-2 text-[10px] uppercase tracking-wider text-white/50 sm:flex">
          <span className={cn(r.total === 0 && "text-sun-400")}>→0←</span>
          <span>Ejes {r.axlesOnDeck}/5</span>
          <span>
            Máx {kg.format(capacity)} · d {VTS200.division}
          </span>
        </div>
      </div>
    </HmiPanel>
  );
}

/** Lectura de cada celda sobre el modelo (vista de celdas): la escena las posiciona en cada cuadro */
function CellTags({
  cells,
  readings,
  elements,
}: {
  cells: Cell[];
  readings: Store<TruckReading>;
  elements: RefObject<(HTMLElement | null)[]>;
}) {
  const r = useStore(readings);
  return cells.map((cell, i) => (
    <span
      key={cell.id}
      ref={(el) => {
        elements.current[i] = el;
      }}
      style={{ opacity: 0, visibility: "hidden" }}
      className={cn(
        "absolute left-0 top-0 select-none whitespace-nowrap rounded bg-mt-950/90 px-1.5 py-0.5 font-mono text-[10px] font-semibold tabular-nums ring-1 transition-[opacity,visibility] duration-300",
        i === FOCUS_CELL ? "text-sun-200 ring-sun-400/60" : "text-white/85 ring-white/15"
      )}
    >
      {cell.id} · {tonnes.format((r.cells[i] ?? 0) / 1000)} t
    </span>
  ));
}

/* ─── Demo ──────────────────────────────────────────────────────────────── */

/**
 * Demo 3D del proyecto de una báscula camionera VTS200: seis pasos en tres fases, de la
 * preparación del terreno al montaje. Cada paso se construye con su animación (que se puede
 * recorrer con la barra de avance) y tiene una acción propia.
 * `still`: imagen fija de un paso para las capturas de la página (sin interfaz).
 */
function Demo({ initialStep, still }: { initialStep: number; still: boolean }) {
  const reducedMotion = useReducedMotion();
  const isDesktop = useIsDesktop();
  const viewerRef = useRef<HTMLDivElement>(null);
  const { shouldMount, isActive, isReady, onReady } = useDemoActivation(viewerRef);
  const labelElements = useRef<(HTMLElement | null)[]>([]);
  const cellTagElements = useRef<(HTMLElement | null)[]>([]);

  const [step, setStep] = useState(() => Math.min(LAST, Math.max(0, initialStep)));
  const [sizeIndex, setSizeIndex] = useState(DEFAULT_SIZE);
  const [progress] = useState(() => createStore(still ? STILL_PROGRESS[step] : 0));
  const [readings] = useState(() => createStore(EMPTY_READING));
  const [userPlaying, setPlaying] = useState<boolean | null>(null);
  // Con "reducir movimiento" el paso queda en pausa hasta que el usuario lo reproduzca
  const playing = !still && (userPlaying ?? !reducedMotion);
  const [action, setAction] = useState(false);
  const [weighing, setWeighing] = useState(false);
  const [overview, setOverview] = useState(false);

  const size = SCALE_SIZES[sizeIndex];
  const layout = useMemo(() => layoutFor(size), [size]);
  const labels = useMemo(() => labelsFor(layout), [layout]);
  const current = PROJECT_STEPS[step];
  const phase = phaseOf(current);
  const toggle = TOGGLES[step];
  const facts = factsFor(step, layout);
  // Vista de celdas: la acción del último paso
  const cellView = step === LAST && action;

  const goTo = (next: number) => {
    if (next < 0 || next > LAST) return;
    setStep(next);
    setAction(false);
    setWeighing(false);
    setOverview(false);
    progress.set(reducedMotion ? 1 : 0);
    setPlaying(!reducedMotion);
  };

  const scrub = (value: number) => {
    progress.set(value);
    setPlaying(false);
  };

  const weigh = () => {
    // El camión necesita la báscula terminada
    progress.set(1);
    setWeighing(true);
  };

  // Al abrir las celdas pasa un camión, para verlas trabajar
  const toggleAction = () => {
    const next = !action;
    setAction(next);
    if (next && step === LAST && !weighing) weigh();
  };

  const prepareQuote = () => {
    formDrafts.set("cotizacion", quoteSummary(size));
    quote.add(TRUCK_SCALE_PRODUCT.slug);
  };

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.target instanceof HTMLInputElement) return;
    if (event.key === "ArrowRight") goTo(step + 1);
    if (event.key === "ArrowLeft") goTo(step - 1);
  };

  const stepAction: ReactNode =
    step === 0 ? (
      <SizeSelector sizeIndex={sizeIndex} onSize={setSizeIndex} />
    ) : (
      <>
        {toggle && <ActionButton icon={toggle.icon} label={toggle.label} pressed={action} onClick={toggleAction} />}
        {step === LAST && (
          <ActionButton icon={Truck} label={weighing ? "Pesando…" : "Pesar un camión"} disabled={weighing} onClick={weigh} />
        )}
      </>
    );

  const quoteLink = (
    <Button asChild variant={step === LAST ? "light" : "glass"} size="sm">
      <Link href={QUOTE_HREF} onClick={prepareQuote}>
        Cotizar este proyecto <ArrowRight />
      </Link>
    </Button>
  );

  return (
    <div
      className="relative isolate h-full overflow-hidden bg-mt-900 text-white"
      onKeyDown={onKeyDown}
      // Señal para el script de capturas
      data-demo-ready={still && isReady ? "" : undefined}
    >
      {/* Escena a pantalla completa */}
      <div ref={viewerRef} className="absolute inset-0">
        {shouldMount && (
          <Vts200Scene
            layout={layout}
            step={step}
            progress={progress}
            playing={playing}
            action={action}
            weighing={weighing}
            onWeighed={() => setWeighing(false)}
            readings={readings}
            overview={overview}
            shift={still ? NO_SHIFT : isDesktop ? SHIFT_DESKTOP : SHIFT_MOBILE}
            still={still}
            labels={labels}
            labelElements={labelElements}
            cellTagElements={cellTagElements}
            active={isActive}
            onReady={onReady}
          />
        )}
        {!isReady && <ViewerPlaceholder />}
      </div>

      {!still && (
        <>
          {/* Degradados para leer el texto sobre el modelo */}
          <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[42%] bg-gradient-to-b from-mt-900 via-mt-900/70 to-transparent lg:hidden" />
          <div aria-hidden className="pointer-events-none absolute inset-y-0 left-0 hidden w-[46%] bg-gradient-to-r from-mt-900 via-mt-900/75 to-transparent lg:block" />
          <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-mt-900 via-mt-900/70 to-transparent" />

          {/* Etiquetas sobre las piezas: la escena las posiciona en cada cuadro */}
          <div className="pointer-events-none absolute inset-0">
            {labels.map((label, i) => (
              <span
                key={`${label.step}-${label.text}`}
                ref={(el) => {
                  labelElements.current[i] = el;
                }}
                style={{ opacity: 0, visibility: "hidden" }}
                className={cn(
                  "absolute left-0 top-0 select-none transition-[opacity,visibility] duration-300",
                  label.callout
                    ? "flex size-6 items-center justify-center rounded-full bg-sun-400 text-[11px] font-bold text-ink-950 ring-2 ring-mt-950/80"
                    : "inline-flex items-center gap-1.5 whitespace-nowrap rounded-md bg-mt-950/90 px-2 py-1 text-[11px] font-semibold text-white ring-1 ring-white/15"
                )}
              >
                {label.callout ? (
                  <>
                    {label.callout}
                    <span className="sr-only">{label.text}</span>
                  </>
                ) : (
                  <>
                    <span aria-hidden className="size-1.5 rounded-full bg-sun-400" />
                    {label.text}
                  </>
                )}
              </span>
            ))}
            <CellTags cells={layout.cells} readings={readings} elements={cellTagElements} />
          </div>

          <div className="pointer-events-none relative flex h-full flex-col px-4 pb-4 pt-4 sm:px-6 lg:px-10 lg:pb-6 lg:pt-7">
            <div className="flex items-center gap-3 pr-14">
              <p className="font-heading text-[11px] font-bold uppercase tracking-[0.18em] text-mt-200 sm:text-xs">
                Demo 3D · <span className="hidden sm:inline">Báscula camionera {VTS200.name}</span>
                <span className="sm:hidden">VTS200</span>
              </p>
              <div className="pointer-events-auto ml-auto">
                <ViewerButton label={overview ? "Volver a la vista del paso" : "Vista general"} pressed={overview} onClick={() => setOverview((o) => !o)}>
                  <Expand />
                </ViewerButton>
              </div>
            </div>

            {/* Paso en curso */}
            <section aria-live="polite" className="pointer-events-auto mt-3 max-w-md lg:mt-8">
              <p className="flex flex-wrap items-center gap-x-3 font-mono text-[11px] uppercase tracking-[0.16em] text-white/55">
                <span className="text-mt-200">
                  Fase {phase.number} · {phase.name}
                </span>
                <span>
                  Paso {step + 1} de {PROJECT_STEPS.length}
                </span>
              </p>
              <h2 className="mt-2 font-heading text-2xl font-extrabold leading-[1.08] tracking-tight sm:text-3xl lg:text-4xl">
                {cellView ? `Celdas de carga ${VTS200.cells}` : current.title}
              </h2>
              {cellView ? (
                // Cómo pesa una celda: cada punto coincide con su número sobre la celda abierta
                <ol className="mt-3 space-y-2 lg:mt-4 lg:space-y-3">
                  {LOAD_CELL_STEPS.map((item, i) => (
                    <li key={item.title} className="flex gap-3">
                      <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-sun-400 text-[11px] font-bold text-ink-950">
                        {i + 1}
                      </span>
                      <p className="text-sm leading-snug text-white/75">
                        <span className="font-semibold text-white">{item.title}.</span>{" "}
                        <span className="hidden lg:inline">{item.text}</span>
                      </p>
                    </li>
                  ))}
                </ol>
              ) : (
                <>
                  <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-white/75 lg:line-clamp-none lg:text-base">{current.text}</p>
                  <p className="mt-4 hidden border-l-2 border-sun-400 pl-3 text-sm font-semibold text-white lg:block">
                    <span className="text-mt-200">Resultado:</span> {current.result}
                  </p>
                </>
              )}
              {cellView && <p className="mt-4 hidden text-xs leading-relaxed text-white/55 lg:block">{LOAD_CELL_NOTE}</p>}
              {!cellView && facts.length > 0 && (
                <ul className="mt-4 hidden flex-wrap gap-2 lg:flex">
                  {facts.map((fact) => (
                    <li key={fact} className="rounded-full border border-white/15 bg-mt-950/60 px-3 py-1 font-mono text-[11px] text-white/80">
                      {fact}
                    </li>
                  ))}
                </ul>
              )}
              <div className="mt-6 hidden lg:block">
                <div className="flex flex-wrap gap-2">{stepAction}</div>
                {toggle && <p className="mt-2 text-xs text-white/50">{toggle.hint}</p>}
              </div>
              <div className="mt-8 hidden lg:block">{quoteLink}</div>
            </section>

            {/* Pie: indicador, acción (móvil), avance y pasos */}
            <div className="mt-auto flex flex-col gap-3">
              {step === LAST && (
                // En celulares, la vista de celdas ya muestra cada lectura sobre el modelo
                <div className={cn("pointer-events-auto lg:self-end", cellView && "max-lg:hidden")}>
                  <Indicator readings={readings} progress={progress} capacity={size.capacity} />
                </div>
              )}
              <div className="pointer-events-auto flex flex-wrap items-center gap-2 lg:hidden">
                {stepAction}
                {step === LAST && quoteLink}
              </div>
              <div className="pointer-events-auto">
                <ProgressControls
                  progress={progress}
                  playing={playing}
                  onPlay={setPlaying}
                  onScrub={scrub}
                  step={step}
                  onStep={goTo}
                />
              </div>
              <div className="pointer-events-auto">
                <Timeline step={step} onStep={goTo} progress={progress} />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/** El paso inicial sale de `?paso=` (1 a 6); `&captura` deja la imagen fija del paso, sin interfaz */
function DemoFromQuery() {
  const params = useSearchParams();
  return <Demo initialStep={stepFromQuery(params.get("paso"))} still={params.has("captura")} />;
}

/** El demo a pantalla completa: sobre la página (`modal`) o en su propia dirección (`page`) */
export function Vts200DemoDialog({ mode }: { mode: "modal" | "page" }) {
  return (
    <DemoDialog mode={mode} label={DEMO_TITLE} exitHref={`/#${PROJECT_SECTION_ID}`}>
      {/* La dirección se lee en el navegador: la página se genera estática */}
      <Suspense fallback={<ViewerPlaceholder />}>
        <DemoFromQuery />
      </Suspense>
    </DemoDialog>
  );
}
