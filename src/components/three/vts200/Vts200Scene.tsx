"use client";

import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { CameraControls, PerformanceMonitor } from "@react-three/drei";
import * as THREE from "three";
import type { Store } from "@/lib/store";
import { ScreenAnchors } from "../ScreenAnchors";
import { ADAPTIVE_DPR, scaleView, useResponsiveFraming, type Shift } from "../useResponsiveFraming";
import { useSceneLoop, type SceneLoopProps } from "../useSceneLoop";
import { BuildContext, type Build } from "./build";
import { Drainage } from "./Drainage";
import { Foundation } from "./Foundation";
import { COLORS, useMaterials } from "./materials";
import {
  APPROACH_LENGTH,
  TRUCK_SPAN,
  TRUCK_STOP,
  computeReading,
  viewsFor,
  type Label,
  type Layout,
  type ScaleReading,
} from "./model";
import { Scale } from "./Scale";
import { Site } from "./Site";
import { Truck } from "./Truck";
import { Walls } from "./Walls";

/** Duración de la animación de cada paso (s) */
const STEP_SECONDS = [6, 7, 8, 8, 7, 10];

const MAX_SPEED = 5.5; // m/s
const HOLD_SECONDS = 3.5;

export type TruckReading = ScaleReading & { displayed: number; stable: boolean };

export type Vts200SceneProps = SceneLoopProps & {
  layout: Layout;
  step: number;
  /** Avance del paso en curso (0..1): la escena lo hace correr mientras `playing` */
  progress: Store<number>;
  playing: boolean;
  /** Acción del paso en curso: estratos, armadura, lluvia o empuje del suelo */
  action: boolean;
  /** Un camión cruza la báscula; al salir se llama a `onWeighed` */
  weighing: boolean;
  onWeighed: () => void;
  /** Lecturas para el indicador (se publican ~10 veces por segundo) */
  readings: Store<TruckReading>;
  overview: boolean;
  /** Desplazamiento de la imagen para dejar espacio al texto superpuesto */
  shift: Shift;
  /** Imagen fija (capturas para la página): paso completo, sin transiciones */
  still?: boolean;
  labels: Label[];
  /** Etiquetas (DOM) que la escena posiciona sobre el modelo */
  labelElements: RefObject<(HTMLElement | null)[]>;
};

type Phase = "approach" | "weigh" | "exit";

function World({
  layout,
  step,
  progress,
  playing,
  action,
  weighing,
  onWeighed,
  readings,
  overview,
  shift,
  still = false,
  labels,
  labelElements,
  castShadows,
}: Omit<Vts200SceneProps, keyof SceneLoopProps> & { castShadows: boolean }) {
  const materials = useMaterials();
  const controls = useRef<CameraControls>(null);
  const { half } = layout;

  // Lo que cambia con la interfaz se lee en cada cuadro desde refs, sin re-renderizar la escena
  const live = useRef({ step, action, playing, weighing, onWeighed });
  useEffect(() => {
    live.current = { step, action, playing, weighing, onWeighed };
  });

  const build = useMemo<Build>(
    () => ({
      current: () => live.current.step,
      stage: (s) => (s < live.current.step ? 1 : s > live.current.step ? 0 : progress.get()),
      action: (s) => live.current.action && s === live.current.step,
    }),
    [progress]
  );

  /* Cámara */
  const views = useMemo(() => viewsFor(layout), [layout]);
  const { distance } = useResponsiveFraming(controls, shift);

  useEffect(() => {
    const view = overview ? views.overview : (views.steps[step] ?? views.overview);
    controls.current?.setLookAt(...scaleView(view, distance), !still);
  }, [distance, overview, step, still, views]);

  /* Camión: entra, se detiene centrado, se pesa y sale */
  const truckRef = useRef<THREE.Group>(null);
  const startX = -(half + APPROACH_LENGTH + 16);
  const endX = half + APPROACH_LENGTH + 16 + TRUCK_SPAN;
  const sim = useRef({ phase: "approach" as Phase, x: startX, speed: MAX_SPEED, hold: 0 });
  const spin = useRef(0);
  const reading = useRef<ScaleReading>(computeReading(layout, startX));
  const displayed = useRef(0);
  const activity = useRef(0);
  const emitClock = useRef(0);
  const parked = still && step === 5;

  useEffect(() => {
    sim.current = parked
      ? { phase: "weigh", x: TRUCK_STOP, speed: 0, hold: 0 }
      : { phase: "approach", x: startX, speed: MAX_SPEED, hold: 0 };
    if (!weighing) readings.set({ ...computeReading(layout, startX), displayed: 0, stable: false });
  }, [layout, parked, readings, startX, weighing]);

  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 0.05);
    const now = live.current;

    // Avance de la obra
    if (now.playing && !still) {
      const p = progress.get();
      if (p < 1) progress.set(Math.min(1, p + dt / STEP_SECONDS[now.step]));
    }

    const truckOn = now.weighing || parked;
    if (truckRef.current) truckRef.current.visible = truckOn;
    if (!truckOn) {
      reading.current = computeReading(layout, startX);
      activity.current = THREE.MathUtils.damp(activity.current, 0, 3, dt);
      return;
    }

    const s = sim.current;
    const prevX = s.x;
    if (!parked) {
      if (s.phase === "approach") {
        const remaining = TRUCK_STOP - s.x;
        s.speed = MAX_SPEED * THREE.MathUtils.clamp(remaining / 7, 0.06, 1);
        s.x = Math.min(TRUCK_STOP, s.x + s.speed * dt);
        if (TRUCK_STOP - s.x < 0.005) Object.assign(s, { x: TRUCK_STOP, phase: "weigh", hold: 0, speed: 0 });
      } else if (s.phase === "weigh") {
        s.hold += dt;
        if (s.hold > HOLD_SECONDS) s.phase = "exit";
      } else {
        s.speed = Math.min(MAX_SPEED, s.speed + 2.2 * dt);
        s.x += s.speed * dt;
        if (s.x > endX) {
          Object.assign(s, { phase: "approach", x: startX, speed: MAX_SPEED });
          now.onWeighed();
        }
      }
    }
    const moved = s.x - prevX;
    spin.current += Math.max(moved, 0);
    truckRef.current?.position.set(s.x, 0, 0);

    // El indicador se estabiliza como en un terminal real
    const r = computeReading(layout, s.x);
    const changed = r.total !== reading.current.total;
    reading.current = r;
    displayed.current = parked ? r.total : THREE.MathUtils.damp(displayed.current, r.total, 5, dt);
    if (Math.abs(displayed.current - r.total) < 1) displayed.current = r.total;
    activity.current = THREE.MathUtils.damp(activity.current, changed || moved > 0.001 ? 1 : 0, 3, dt);
    const stable = s.phase === "weigh" && r.total > 0 && Math.abs(displayed.current - r.total) < 10;

    emitClock.current += dt;
    if (emitClock.current > 0.1) {
      emitClock.current = 0;
      readings.set({ ...r, displayed: displayed.current, stable });
    }
  });

  /* Etiquetas: las del paso en curso, cuando su pieza ya está construida */
  const points = useMemo(() => labels.map((label) => label.position), [labels]);
  const labelVisible = (i: number) => {
    const label = labels[i];
    if (still || label.step !== live.current.step) return false;
    const p = build.stage(label.step);
    return p >= label.from && (label.until === undefined || p < label.until) && (!label.action || live.current.action);
  };

  return (
    <BuildContext.Provider value={build}>
      <color attach="background" args={[COLORS.background]} />
      <fog attach="fog" args={[COLORS.background, 42 * distance, 110 * distance]} />

      <hemisphereLight args={["#dbe7f5", "#3a3326", 0.95]} />
      <directionalLight
        position={[-14, 22, 12]}
        intensity={2.6}
        // Apagar las sombras de la luz (y no del renderizador) obliga a recompilar los materiales:
        // si no, seguirían mostrando la última sombra calculada (la de otro paso)
        castShadow={castShadows}
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0004}
        shadow-normalBias={0.02}
        shadow-camera-left={-30}
        shadow-camera-right={30}
        shadow-camera-top={18}
        shadow-camera-bottom={-18}
      />
      <directionalLight position={[16, 8, -10]} intensity={0.5} color="#b1cae6" />

      <Site layout={layout} materials={materials} />
      <Foundation layout={layout} materials={materials} />
      <Drainage layout={layout} materials={materials} />
      <Walls layout={layout} materials={materials} />
      <Scale layout={layout} materials={materials} reading={reading} activity={activity} />
      <Truck truckRef={truckRef} spinRef={spin} materials={materials} />

      <ScreenAnchors points={points} elements={labelElements} isVisible={labelVisible} />

      <CameraControls
        ref={controls}
        makeDefault
        minDistance={3}
        maxDistance={60 * distance}
        maxPolarAngle={Math.PI / 2.1}
        smoothTime={0.6}
      />
    </BuildContext.Provider>
  );
}

export default function Vts200Scene({ active, onReady, ...props }: Vts200SceneProps) {
  const { frameloop, onCreated } = useSceneLoop({ active, onReady });
  // Resolución según los fps; si el equipo no da abasto, además se apagan las sombras dinámicas
  const [dpr, setDpr] = useState(ADAPTIVE_DPR.initial);
  const [shadows, setShadows] = useState(true);
  const initial = viewsFor(props.layout).overview;

  return (
    <Canvas
      // PCF explícito: con `true` r3f pide PCFSoft y three recompila los shaders al dibujar la primera sombra
      shadows="percentage"
      dpr={props.still ? 1 : [1, dpr]}
      frameloop={frameloop}
      onCreated={onCreated}
      camera={{ position: initial.position, fov: 38, near: 0.1, far: 260 }}
      gl={{ antialias: true, powerPreference: "high-performance", stencil: false }}
      aria-label="Modelo 3D interactivo de la instalación de una báscula camionera VTS200"
      fallback={
        <div className="flex h-full items-center justify-center p-8 text-center text-sm text-white/70">
          Su navegador no admite gráficos 3D (WebGL).
        </div>
      }
    >
      {!props.still && (
        <PerformanceMonitor
          flipflops={3}
          onChange={({ factor }) => setDpr(ADAPTIVE_DPR.fromFactor(factor))}
          onFallback={() => {
            setDpr(ADAPTIVE_DPR.min);
            setShadows(false);
          }}
        />
      )}
      <World {...props} castShadows={shadows} />
    </Canvas>
  );
}
