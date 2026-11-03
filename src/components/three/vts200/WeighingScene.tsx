"use client";

import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import { CameraControls, CameraControlsImpl } from "@react-three/drei";
import * as THREE from "three";
import type { Store } from "@/lib/store";
import { ScreenAnchors } from "../ScreenAnchors";
import { scaleView, useResponsiveFraming, type Shift, type Vec3 } from "../useResponsiveFraming";
import type { SceneLoopProps } from "../useSceneLoop";
import { BuildContext, plane, type Build } from "./build";
import { Drainage } from "./Drainage";
import { GradientEnvironment, type GradientStops } from "./environment";
import { Foundation } from "./Foundation";
import { useMaterials } from "./materials";
import { MOUNT_STEP, cellTagPoints, weighingViewsFor, type Layout, type TruckReading } from "./model";
import { ProviderSign } from "./ProviderSign";
import { Scale } from "./Scale";
import { Truck } from "./Truck";
import { useTruckRun } from "./useTruckRun";
import { Vts200Canvas } from "./Vts200Canvas";
import { Walls } from "./Walls";

// La báscula ya instalada sobre un plano técnico azul METTLER: sin obra ni paisaje, más liviana
// que el demo de la instalación. Usa las mismas piezas (foso, muros, celdas, plataforma y camión).

const BLUE = { background: "#001f44", ground: "#002a5a", line: "#0b3d78", section: "#1b5296" };
const LIGHT: Vec3 = [-12, 20, 12];
const STUDIO: GradientStops = [
  [0, "#d8e5f3"],
  [0.45, "#7ea7d3"],
  [0.55, BLUE.line],
  [1, BLUE.background],
];

/** Retícula de plano técnico: una línea por metro y una más marcada cada 6 m (el mosaico) */
function blueprintTexture() {
  const size = 512;
  const cell = size / 6;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = BLUE.ground;
  ctx.fillRect(0, 0, size, size);
  ctx.strokeStyle = BLUE.line;
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (let i = 1; i < 6; i++) {
    ctx.moveTo(i * cell, 0);
    ctx.lineTo(i * cell, size);
    ctx.moveTo(0, i * cell);
    ctx.lineTo(size, i * cell);
  }
  ctx.stroke();
  // El borde se reparte entre mosaicos vecinos: al repetirse queda una línea del doble de ancho
  ctx.strokeStyle = BLUE.section;
  ctx.lineWidth = 4;
  ctx.strokeRect(0, 0, size, size);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(1 / 6, 1 / 6);
  texture.anisotropy = 8;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/** Suelo azul con la retícula, recortado donde está la obra (foso, muros y relleno) */
function Ground({ layout }: { layout: Layout }) {
  const { dig } = layout;
  const geometry = useMemo(
    () => plane({ x0: -150, x1: 150, z0: -150, z1: 150 }, { x0: -dig.x, x1: dig.x, z0: -dig.z, z1: dig.z }),
    [dig.x, dig.z]
  );
  const map = useMemo(() => blueprintTexture(), []);
  return (
    <mesh geometry={geometry} receiveShadow>
      <meshStandardMaterial map={map} roughness={0.95} />
    </mesh>
  );
}

export type WeighingSceneProps = SceneLoopProps & {
  layout: Layout;
  /** El camión avanza; en pausa queda detenido donde está */
  playing: boolean;
  /** Plataforma transparente: las celdas (una abierta) y la red a la vista */
  xray: boolean;
  /** Parte del recorrido del peso a la vista (índice de WEIGHING_STEPS); null: vista general */
  part: number | null;
  readings: Store<TruckReading>;
  /** Desplazamiento de la imagen para dejar espacio al texto superpuesto */
  shift: Shift;
  /** Lectura de cada celda, visible con los rayos X (DOM) */
  cellTagElements: RefObject<(HTMLElement | null)[]>;
};

function World({
  layout,
  playing,
  xray,
  part,
  readings,
  shift,
  cellTagElements,
  castShadows,
}: Omit<WeighingSceneProps, keyof SceneLoopProps> & { castShadows: boolean }) {
  const materials = useMaterials();
  const controls = useRef<CameraControls>(null);

  const live = useRef({ playing, xray });
  useEffect(() => {
    live.current = { playing, xray };
  });

  // La báscula ya está instalada: todos los pasos terminados; la acción del montaje son los rayos X
  const build = useMemo<Build>(
    () => ({
      current: () => MOUNT_STEP,
      stage: () => 1,
      action: (step) => step === MOUNT_STEP && live.current.xray,
    }),
    []
  );

  // Si empieza en pausa (reducir movimiento), el camión espera sobre la plataforma con su peso
  const [parked] = useState(!playing);
  const { truckRef, spin, reading, activity } = useTruckRun(
    layout,
    readings,
    () => ({ on: true, moving: live.current.playing }),
    parked
  );

  /* Cámara: solo se gira arrastrando; la rueda y el gesto vertical siguen desplazando la página */
  useEffect(() => {
    const c = controls.current;
    if (!c) return;
    c.mouseButtons.wheel = CameraControlsImpl.ACTION.NONE;
    c.mouseButtons.middle = CameraControlsImpl.ACTION.NONE;
    c.mouseButtons.right = CameraControlsImpl.ACTION.NONE;
    c.touches.two = CameraControlsImpl.ACTION.TOUCH_DOLLY;
    c.touches.three = CameraControlsImpl.ACTION.NONE;
  }, []);

  const views = useMemo(() => weighingViewsFor(layout), [layout]);
  const { distance } = useResponsiveFraming(controls, shift);
  useEffect(() => {
    controls.current?.setLookAt(...scaleView(part === null ? views.overview : views.parts[part], distance), true);
  }, [distance, part, views]);

  const cellPoints = useMemo(() => cellTagPoints(layout), [layout]);

  return (
    <BuildContext.Provider value={build}>
      <color attach="background" args={[BLUE.background]} />
      <fog attach="fog" args={[BLUE.background, 45 * distance, 110 * distance]} />
      <GradientEnvironment stops={STUDIO} />

      <hemisphereLight args={["#d8e5f3", BLUE.ground, 0.6]} />
      <directionalLight
        position={LIGHT}
        intensity={2.6}
        castShadow={castShadows}
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0004}
        shadow-normalBias={0.02}
        shadow-camera-left={-22}
        shadow-camera-right={22}
        shadow-camera-top={14}
        shadow-camera-bottom={-14}
      />

      <Ground layout={layout} />
      <Foundation layout={layout} materials={materials} />
      <Drainage layout={layout} materials={materials} />
      <Walls layout={layout} materials={materials} />
      <Scale layout={layout} materials={materials} reading={reading} activity={activity} cellView={xray} />
      <Truck truckRef={truckRef} spinRef={spin} materials={materials} />
      <ProviderSign distance={19} facing={views.overview.position} />

      <ScreenAnchors points={cellPoints} elements={cellTagElements} isVisible={() => live.current.xray} />

      <CameraControls
        ref={controls}
        makeDefault
        minDistance={4}
        maxDistance={55 * distance}
        minPolarAngle={0.3}
        maxPolarAngle={Math.PI / 2.15}
        smoothTime={0.6}
      />
    </BuildContext.Provider>
  );
}

/** Un camión cruza la báscula VTS200 ya instalada y el indicador muestra su peso */
export default function WeighingScene({ active, onReady, ...props }: WeighingSceneProps) {
  const initial = weighingViewsFor(props.layout).overview;
  return (
    <Vts200Canvas
      active={active}
      onReady={onReady}
      camera={{ position: initial.position, fov: 38, near: 0.1, far: 400 }}
      label="Modelo 3D interactivo: un camión cruza una báscula VTS200 y el indicador muestra su peso"
    >
      {(castShadows) => <World {...props} castShadows={castShadows} />}
    </Vts200Canvas>
  );
}
