"use client";

import { useRef, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useReducedMotion } from "framer-motion";
import { ArrowRight, CircleCheck, Move3d, Pause, Play, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { SectionLink } from "@/components/navigation/SectionLink";
import type { BenchSceneState } from "@/components/three/BenchScaleScene";
import { PART_LABELS } from "@/components/three/benchScaleModel";
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

const BenchScaleScene = dynamic(() => import("@/components/three/scenes").then((m) => m.BenchScaleScene), {
  ssr: false,
  loading: () => <ViewerPlaceholder />,
});

const INTRO = "Se desmonta por partes para su limpieza y, al volver a armarla, sigue pesando con la misma exactitud.";

const STEPS = [
  {
    title: "Pesar",
    text: "Con el producto sobre el plato, la balanza indica su peso en cuanto la lectura se estabiliza.",
  },
  {
    title: "Desmontar",
    text: "Se retira el producto, se apaga la balanza y se separan el plato y su soporte para acceder a cada superficie.",
  },
  {
    title: "Limpiar",
    text: "Cada pieza se lava por separado, ideal para mantener la higiene en la industria alimentaria.",
  },
  {
    title: "Armar y verificar",
    text: "Al volver a armarla y encenderla, hace su autotest, se pone en cero e indica el mismo peso que antes de la limpieza.",
  },
];

const kg = new Intl.NumberFormat("es-BO", { minimumFractionDigits: 3, maximumFractionDigits: 3 });

const INITIAL: BenchSceneState = { phase: 0, text: "0.000", stable: false, verified: false, before: null, after: null };

// Escritorio: el texto va a la derecha, así que el modelo se corre a la izquierda
const SHIFT_DESKTOP = { x: -0.16, y: 0 };
const SHIFT_MOBILE = { x: 0, y: -0.02 };

type States = Store<BenchSceneState>;

/* ─── Piezas de la interfaz suscritas al estado de la escena ────────────── */

function Indicator({ states }: { states: States }) {
  const s = useStore(states);
  const off = s.text === "";
  const selfTest = s.text.startsWith("8.8");
  const status = off ? (
    <StatusLed tone="off" label="Apagada" />
  ) : selfTest ? (
    <StatusLed tone="busy" label="Autotest" />
  ) : s.stable ? (
    <StatusLed tone="ok" label="Estable" />
  ) : (
    <StatusLed tone="busy" label="Pesando" />
  );

  return (
    <HmiPanel title="BPA121 · Indicación" status={status} className="w-56">
      <div className="px-4 py-3" aria-live="polite" aria-atomic="true">
        <p
          className={cn(
            "rounded bg-black/40 px-3 py-1.5 text-right text-3xl font-semibold tabular-nums tracking-tight",
            off ? "text-white/15" : "text-[#ff5a4e] [text-shadow:0_0_12px_rgba(255,70,60,0.55)]"
          )}
        >
          {off ? "------" : selfTest ? "8.8.8.8.8" : s.text}
        </p>
        <div className="mt-2 flex items-center justify-between text-[10px] uppercase tracking-wider">
          <span className={cn(!off && s.text === "0.000" ? "text-[#ff5a4e]" : "text-white/25")}>→0←</span>
          <span className="text-white/25">g</span>
          <span className={cn(off ? "text-white/25" : "text-[#ff5a4e]")}>kg</span>
          <span className="text-white/25">Net</span>
        </div>
      </div>
    </HmiPanel>
  );
}

function Verification({ states }: { states: States }) {
  const s = useStore(states);
  return (
    <dl className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
      <div>
        <dt className="text-[11px] uppercase tracking-wider text-white/50">Antes de limpiar</dt>
        <dd className="font-mono font-semibold tabular-nums">{s.before !== null ? `${kg.format(s.before)} kg` : "—"}</dd>
      </div>
      <ArrowRight className="size-4 text-white/30" aria-hidden />
      <div>
        <dt className="text-[11px] uppercase tracking-wider text-white/50">Después de armar</dt>
        <dd className="font-mono font-semibold tabular-nums">{s.after !== null ? `${kg.format(s.after)} kg` : "—"}</dd>
      </div>
      <span
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold transition-colors",
          s.after !== null ? "bg-emerald-400/15 text-emerald-300" : "bg-white/10 text-white/60"
        )}
      >
        {s.after !== null && <CircleCheck className="size-3.5" aria-hidden />}
        {s.after !== null ? "Misma lectura" : "Verificando"}
      </span>
    </dl>
  );
}

function PhasePill({ states }: { states: States }) {
  const { phase } = useStore(states);
  return (
    <p className="rounded-full border border-white/10 bg-ink-950/85 px-3 py-2 text-xs font-semibold">
      <span className="text-white/50">Paso {phase + 1} de 4 · </span>
      {STEPS[phase].title}
    </p>
  );
}

function Steps({ states, onSelect, variant }: { states: States; onSelect: (i: number) => void; variant: "list" | "chips" }) {
  const { phase } = useStore(states);
  return variant === "list" ? (
    <StepList steps={STEPS} active={phase} onSelect={onSelect} />
  ) : (
    <StepChips steps={STEPS} active={phase} onSelect={onSelect} />
  );
}

function MobileText({ states, interacted }: { states: States; interacted: boolean }) {
  const { phase } = useStore(states);
  return (
    <p className="mt-3 line-clamp-4 text-sm leading-relaxed text-white/70 sm:text-base lg:hidden" aria-live="polite">
      {interacted ? STEPS[phase].text : INTRO}
    </p>
  );
}

/* ─── Demo ──────────────────────────────────────────────────────────────── */

export function BenchScaleDemo() {
  const reducedMotion = useReducedMotion();
  const isDesktop = useIsDesktop();
  const viewerRef = useRef<HTMLDivElement>(null);
  const { shouldMount, isActive } = useDemoActivation(viewerRef);
  const [states] = useState(() => createStore<BenchSceneState>(INITIAL));
  const labelElements = useRef<(HTMLElement | null)[]>([]);

  const [userPlaying, setUserPlaying] = useState<boolean | null>(null);
  const playing = userPlaying ?? !reducedMotion;
  const [seek, setSeek] = useState({ phase: 0, id: 0 });
  const [resetView, setResetView] = useState(0);

  const goToStep = (i: number) => {
    setSeek((s) => ({ phase: i, id: s.id + 1 }));
    setUserPlaying(true);
  };

  const controls = (
    <div className="flex items-center gap-2">
      <PhasePill states={states} />
      <ViewerButton label={playing ? "Pausar" : "Reproducir"} onClick={() => setUserPlaying(!playing)}>
        {playing ? <Pause /> : <Play />}
      </ViewerButton>
      <ViewerButton label="Restablecer vista" onClick={() => setResetView((n) => n + 1)}>
        <RotateCcw />
      </ViewerButton>
    </div>
  );

  return (
    <section
      id="demo-mesa"
      data-header-theme="dark"
      aria-label="Demo 3D: balanza de mesa BPA121"
      className="relative isolate h-svh min-h-[40rem] scroll-mt-0 overflow-hidden bg-[#121211] text-white"
    >
      <div ref={viewerRef} className="absolute inset-0 [&_*]:touch-pan-y!">
        {shouldMount && (
          <BenchScaleScene
            playing={playing}
            seek={seek}
            resetView={resetView}
            active={isActive}
            shift={isDesktop ? SHIFT_DESKTOP : SHIFT_MOBILE}
            states={states}
            labelElements={labelElements}
          />
        )}
      </div>

      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[45%] bg-gradient-to-b from-[#121211] via-[#121211]/70 to-transparent lg:hidden" />
      <div aria-hidden className="pointer-events-none absolute inset-y-0 right-0 hidden w-[55%] bg-gradient-to-l from-[#121211] via-[#121211]/80 to-transparent lg:block" />
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-[#121211] via-[#121211]/60 to-transparent" />

      {/* Etiquetas de las piezas: la escena las posiciona y muestra con la balanza desmontada */}
      <div className="pointer-events-none absolute inset-0">
        {PART_LABELS.map((part, i) => (
          <span
            key={part.label}
            ref={(el) => {
              labelElements.current[i] = el;
            }}
            style={{ opacity: 0, visibility: "hidden" }}
            className="absolute left-0 top-0 select-none whitespace-nowrap rounded-full border border-white/15 bg-[#0b0b0a]/90 px-2.5 py-1 text-[11px] font-semibold text-white transition-[opacity,visibility] duration-300"
          >
            {part.label}
          </span>
        ))}
      </div>

      <div className="pointer-events-none relative mx-auto flex h-full max-w-7xl flex-col px-4 pb-5 pt-24 sm:px-6 lg:px-8 lg:pb-10 lg:pt-32">
        <div className="flex items-start justify-between gap-8 lg:flex-row-reverse">
          {/* Texto */}
          <div className="pointer-events-auto max-w-md">
            <p className="font-heading text-xs font-bold uppercase tracking-[0.18em] text-ink-300">
              Demo 3D · Industria alimentaria
            </p>
            <h2 className="mt-3 font-heading text-3xl font-extrabold leading-[1.05] tracking-tight sm:text-4xl lg:text-5xl">
              Balanza de mesa BPA121
            </h2>
            <p className="mt-3 hidden text-base leading-relaxed text-white/70 lg:block">{INTRO}</p>
            <MobileText states={states} interacted={userPlaying !== null} />

            <div className="mt-7 hidden lg:block">
              <Steps states={states} onSelect={goToStep} variant="list" />
            </div>

            <div className="mt-6 hidden lg:block">
              <Verification states={states} />
            </div>

            <div className="mt-8 hidden flex-wrap gap-3 lg:flex">
              <Button asChild variant="light">
                <SectionLink section="contacto" consulta="cotizacion">
                  Solicitar cotización <ArrowRight />
                </SectionLink>
              </Button>
              <Button asChild variant="glass">
                <Link href="/productos">Ver todos los productos</Link>
              </Button>
            </div>
          </div>

          <div className="pointer-events-auto hidden lg:block">{controls}</div>
        </div>

        {/* Pie: indicación de la balanza */}
        <div className="mt-auto flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div className="pointer-events-auto lg:hidden">{controls}</div>
          <div className="pointer-events-auto self-start">
            <Indicator states={states} />
          </div>
          <p className="hidden items-center gap-2 text-xs text-white/50 lg:inline-flex">
            <Move3d className="size-4" aria-hidden />
            Arrastre para girar la vista
          </p>
          <div className="pointer-events-auto lg:hidden">
            <Steps states={states} onSelect={goToStep} variant="chips" />
          </div>
        </div>
      </div>
    </section>
  );
}
