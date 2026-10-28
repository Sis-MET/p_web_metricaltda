"use client";

import { useRef, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useReducedMotion } from "framer-motion";
import { ArrowRight, Expand, Move3d, Pause, Play, ScanEye } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/animations/Reveal";
import { EMPTY_READING, layoutFor } from "@/components/three/vts200/model";
import { productHref } from "@/content/catalog";
import {
  DEFAULT_SIZE,
  DEMO_HREF,
  SCALE_SIZES,
  TRUCK_SCALE_PRODUCT,
  VTS200,
  WEIGHING_SECTION_ID,
  WEIGHING_STEPS,
} from "@/content/truckScaleProject";
import { createStore } from "@/lib/store";
import { ActionButton, StepChips, StepList, ViewerButton, useDemoActivation, useIsDesktop } from "./DemoShell";
import { CellTags, ScaleIndicator } from "./ScaleReadout";
import { ViewerPlaceholder } from "./ViewerPlaceholder";

// three.js se descarga aparte, recién al acercarse a la sección
const WeighingScene = dynamic(() => import("@/components/three/scenes").then((m) => m.WeighingScene), { ssr: false });

const SIZE = SCALE_SIZES[DEFAULT_SIZE];
const LAYOUT = layoutFor(SIZE);
/** Partes del recorrido que se ven con la plataforma transparente: las celdas y la red */
const XRAY_PARTS = new Set([1, 2]);

const INTRO = `Vea cómo cada eje de la volqueta carga las celdas ${VTS200.cells} mientras cruza la plataforma y cómo el indicador de la caseta llega al peso estable.`;

// Escritorio: el texto va a la izquierda, así que el modelo se corre a la derecha
const SHIFT_DESKTOP = { x: 0.16, y: 0 };
const SHIFT_MOBILE = { x: 0, y: 0.02 };

/**
 * Demo 3D del inicio: la báscula VTS200 ya instalada y una volqueta que la cruza una y otra vez.
 * Cada parte del recorrido del peso (plataforma, celdas, red e indicador) tiene su vista; los rayos X
 * dejan ver las celdas con su lectura. La instalación completa está en el demo paso a paso.
 */
export function WeighingDemo() {
  const reducedMotion = useReducedMotion();
  const isDesktop = useIsDesktop();
  const viewerRef = useRef<HTMLDivElement>(null);
  const { shouldMount, isActive, isReady, onReady } = useDemoActivation(viewerRef);
  const [readings] = useState(() => createStore(EMPTY_READING));
  const cellTagElements = useRef<(HTMLElement | null)[]>([]);

  // Con "reducir movimiento" empieza en pausa, con el camión ya pesándose sobre la plataforma
  const [userPlaying, setPlaying] = useState<boolean | null>(null);
  const playing = userPlaying ?? !reducedMotion;
  const [xray, setXray] = useState(false);
  const [part, setPart] = useState<number | null>(null);

  const selectPart = (i: number) => {
    if (part === i) return setPart(null);
    setPart(i);
    setXray(XRAY_PARTS.has(i));
  };

  const controls = (
    <div className="flex items-center gap-2">
      <ActionButton icon={ScanEye} label="Rayos X" pressed={xray} onClick={() => setXray(!xray)} />
      <ViewerButton label={playing ? "Pausar" : "Reproducir"} onClick={() => setPlaying(!playing)}>
        {playing ? <Pause /> : <Play />}
      </ViewerButton>
      <ViewerButton label="Vista general" onClick={() => setPart(null)}>
        <Expand />
      </ViewerButton>
    </div>
  );

  return (
    <section
      id={WEIGHING_SECTION_ID}
      data-header-theme="dark"
      aria-label="Demo 3D: cómo pesa una báscula de camiones VTS200"
      className="relative isolate flex min-h-svh flex-col overflow-hidden bg-mt-900 text-white"
    >
      {/* Escena a pantalla completa; el gesto vertical sigue desplazando la página */}
      <div ref={viewerRef} className="absolute inset-0 [&_*]:touch-pan-y!">
        {shouldMount && (
          <WeighingScene
            layout={LAYOUT}
            playing={playing}
            xray={xray}
            part={part}
            readings={readings}
            shift={isDesktop ? SHIFT_DESKTOP : SHIFT_MOBILE}
            cellTagElements={cellTagElements}
            active={isActive}
            onReady={onReady}
          />
        )}
        {!isReady && <ViewerPlaceholder />}
      </div>

      {/* Degradados para leer el texto sobre el modelo */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[45%] bg-gradient-to-b from-mt-900 via-mt-900/70 to-transparent lg:hidden" />
      <div aria-hidden className="pointer-events-none absolute inset-y-0 left-0 hidden w-[52%] bg-gradient-to-r from-mt-900 via-mt-900/80 to-transparent lg:block" />
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-mt-900 via-mt-900/60 to-transparent" />

      {/* Lectura de cada celda con los rayos X: la escena las posiciona en cada cuadro */}
      <div className="pointer-events-none absolute inset-0">
        <CellTags cells={LAYOUT.cells} readings={readings} elements={cellTagElements} />
      </div>

      <div className="pointer-events-none relative mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 pb-5 pt-24 sm:px-6 lg:px-8 lg:pb-10 lg:pt-28">
        <div className="flex items-start justify-between gap-8">
          <Reveal className="pointer-events-auto max-w-md">
            <p className="font-heading text-xs font-bold uppercase tracking-[0.18em] text-mt-200">
              Demo 3D · Báscula camionera VTS200
            </p>
            <h2 className="mt-3 font-heading text-3xl font-extrabold leading-[1.05] tracking-tight sm:text-4xl lg:text-5xl">
              Así pesa una báscula de camiones
            </h2>
            <p className="mt-3 hidden text-base leading-relaxed text-white/70 lg:block">{INTRO}</p>
            {/* Celulares: la parte elegida reemplaza la descripción */}
            <p className="mt-3 line-clamp-4 text-sm leading-relaxed text-white/70 sm:text-base lg:hidden" aria-live="polite">
              {part === null ? INTRO : WEIGHING_STEPS[part].text}
            </p>
            <Link
              href={DEMO_HREF}
              scroll={false}
              className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-white underline-offset-4 hover:underline lg:hidden"
            >
              Ver la instalación paso a paso <ArrowRight className="size-4" aria-hidden />
            </Link>

            <div className="mt-7 hidden lg:block">
              <StepList steps={WEIGHING_STEPS} active={part ?? -1} onSelect={selectPart} />
            </div>

            <div className="mt-8 hidden gap-3 lg:flex lg:w-max">
              <Button asChild variant="light">
                <Link href={DEMO_HREF} scroll={false}>
                  Ver la instalación paso a paso <ArrowRight />
                </Link>
              </Button>
              <Button asChild variant="glass">
                <Link href={productHref(TRUCK_SCALE_PRODUCT)}>Ver la báscula</Link>
              </Button>
            </div>
          </Reveal>

          {/* Controles (escritorio) */}
          <div className="pointer-events-auto hidden lg:block">{controls}</div>
        </div>

        {/* Pie: indicador de la caseta */}
        <div className="mt-auto flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <p className="hidden items-center gap-2 text-xs text-white/50 lg:inline-flex">
            <Move3d className="size-4" aria-hidden />
            Arrastre para girar la vista
          </p>
          <div className="pointer-events-auto lg:hidden">{controls}</div>
          <div className="pointer-events-auto">
            <ScaleIndicator readings={readings} capacity={SIZE.capacity} />
          </div>
          <div className="pointer-events-auto lg:hidden">
            <StepChips steps={WEIGHING_STEPS} active={part ?? -1} onSelect={selectPart} />
          </div>
        </div>
      </div>
    </section>
  );
}
