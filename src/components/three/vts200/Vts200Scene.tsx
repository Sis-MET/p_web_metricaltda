"use client";

import { useEffect, useMemo, useRef, type RefObject } from "react";
import { useFrame } from "@react-three/fiber";
import { CameraControls } from "@react-three/drei";
import type { Store } from "@/lib/store";
import { ScreenAnchors } from "../ScreenAnchors";
import { scaleView, useResponsiveFraming, type Shift } from "../useResponsiveFraming";
import type { SceneLoopProps } from "../useSceneLoop";
import { BuildContext, type Build } from "./build";
import { Drainage } from "./Drainage";
import { Foundation } from "./Foundation";
import { Landscape, SUN } from "./Landscape";
import { COLORS, useMaterials } from "./materials";
import { MOUNT_STEP, cellTagPoints, viewsFor, type Label, type Layout, type TruckReading } from "./model";
import { Scale } from "./Scale";
import { Site } from "./Site";
import { Truck } from "./Truck";
import { useTruckRun } from "./useTruckRun";
import { Vts200Canvas } from "./Vts200Canvas";
import { Walls } from "./Walls";

/** Duración de la animación de cada paso (s) */
const STEP_SECONDS = [6, 7, 8, 8, 7, 10];

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
  labels: Label[];
  /** Etiquetas (DOM) que la escena posiciona sobre el modelo */
  labelElements: RefObject<(HTMLElement | null)[]>;
  /** Lectura de cada celda en la vista de celdas (DOM) */
  cellTagElements: RefObject<(HTMLElement | null)[]>;
};

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
  labels,
  labelElements,
  cellTagElements,
  castShadows,
}: Omit<Vts200SceneProps, keyof SceneLoopProps> & { castShadows: boolean }) {
  const materials = useMaterials();
  const controls = useRef<CameraControls>(null);

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
  const cellView = step === MOUNT_STEP && action;

  useEffect(() => {
    // La vista de celdas va dentro del foso: no se aleja en pantallas angostas
    const view = overview ? views.overview : cellView ? views.cell : (views.steps[step] ?? views.overview);
    controls.current?.setLookAt(...scaleView(view, cellView && !overview ? 1 : distance), true);
  }, [cellView, distance, overview, step, views]);

  /* Avance de la obra */
  useFrame((_, dt) => {
    if (!live.current.playing) return;
    const p = progress.get();
    if (p < 1) progress.set(Math.min(1, p + Math.min(dt, 0.05) / STEP_SECONDS[live.current.step]));
  });

  /* Camión: entra, se detiene centrado, se pesa y sale */
  const { truckRef, spin, reading, activity } = useTruckRun(layout, readings, () => ({
    on: live.current.weighing,
    moving: true,
    onExit: live.current.onWeighed,
  }));

  /* Etiquetas: las del paso en curso, cuando su pieza ya está construida */
  const points = useMemo(() => labels.map((label) => label.position), [labels]);
  const labelVisible = (i: number) => {
    const label = labels[i];
    if (label.step !== live.current.step) return false;
    const p = build.stage(label.step);
    return (
      p >= label.from &&
      (label.until === undefined || p < label.until) &&
      (label.action === undefined || label.action === live.current.action)
    );
  };
  const cellPoints = useMemo(() => cellTagPoints(layout), [layout]);
  const inCellView = () => live.current.step === MOUNT_STEP && live.current.action;

  return (
    <BuildContext.Provider value={build}>
      <color attach="background" args={[COLORS.haze]} />
      {/* Bruma de altura: los cerros se desvanecen hacia el horizonte */}
      <fog attach="fog" args={[COLORS.haze, 90, 1900]} />

      <hemisphereLight args={["#cfe0f1", "#8a7a5e", 0.55]} />
      <directionalLight
        position={SUN}
        intensity={3.1}
        color="#fff4e2"
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
      <directionalLight position={[16, 8, -10]} intensity={0.35} color="#b1cae6" />

      <Landscape layout={layout} materials={materials} />
      <Site layout={layout} materials={materials} />
      <Foundation layout={layout} materials={materials} />
      <Drainage layout={layout} materials={materials} />
      <Walls layout={layout} materials={materials} />
      <Scale layout={layout} materials={materials} reading={reading} activity={activity} cellView={cellView} />
      <Truck truckRef={truckRef} spinRef={spin} materials={materials} />

      <ScreenAnchors points={points} elements={labelElements} isVisible={labelVisible} />
      <ScreenAnchors points={cellPoints} elements={cellTagElements} isVisible={inCellView} />

      <CameraControls
        ref={controls}
        makeDefault
        minDistance={cellView ? 0.2 : 3}
        maxDistance={60 * distance}
        maxPolarAngle={Math.PI / 2.1}
        smoothTime={0.6}
      />
    </BuildContext.Provider>
  );
}

export default function Vts200Scene({ active, onReady, ...props }: Vts200SceneProps) {
  const initial = viewsFor(props.layout).overview;
  return (
    <Vts200Canvas
      active={active}
      onReady={onReady}
      camera={{ position: initial.position, fov: 42, near: 0.05, far: 6000 }}
      label="Modelo 3D interactivo de la instalación de una báscula camionera VTS200"
    >
      {(castShadows) => <World {...props} castShadows={castShadows} />}
    </Vts200Canvas>
  );
}
