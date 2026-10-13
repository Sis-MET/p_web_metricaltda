"use client";

import { useEffect, useMemo, useRef, useState, type ComponentRef, type RefObject } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  CameraControls,
  CameraControlsImpl,
  Edges,
  Environment,
  Grid,
  Lightformer,
  Line,
  PerformanceMonitor,
  RoundedBox,
} from "@react-three/drei";
import * as THREE from "three";
import {
  CELLS,
  CELL_LABEL_POSITIONS,
  CELL_Z,
  DECK_BOTTOM,
  DECK_HALF_LENGTH,
  DECK_TOP,
  DECK_WIDTH,
  HOTSPOTS,
  RAMP_LENGTH,
  SUPPORT_X,
  computeReading,
  stopPosition,
  surfaceHeight,
  type ScaleReading,
  type TruckConfig,
} from "./truckScaleModel";
import { ADAPTIVE_DPR, scaleView, useResponsiveFraming, type Shift, type View } from "./useResponsiveFraming";
import { ScreenAnchors } from "./ScreenAnchors";
import type { Store } from "@/lib/store";

/* ─── Constantes de escena ──────────────────────────────────────────────── */

// Entorno azul METTLER (mt-900 / mt-800); acero para la plataforma y amarillo Métrica en datos y franjas
const COLORS = {
  background: "#001f44",
  ground: "#002a5a",
  concrete: "#8592a3",
  deck: "#4d6582",
  deckRail: "#2c4664",
  steel: "#dadbdc",
  signal: "#e3b300",
  cable: "#3a3a38",
  cab: "#f6f6f4",
  cargo: "#eeede9",
  brand: "#f9e300",
  terminal: "#2a2b2d",
  chassis: "#1e1f21",
  tire: "#151515",
  glass: "#1c1d1f",
};

const WHEEL_RADIUS = 0.52;
const START_X = -26;
const MAX_SPEED = 5.5; // m/s
const HOLD_SECONDS = 3.5;

const HOTSPOT_POINTS = HOTSPOTS.map((h) => h.position);

/** Cámara por paso: 0 = vista general, 1..4 = hotspots */
const CAMERA_PRESETS: View[] = [
  { position: [-20, 12, 23], target: [0.5, 0.5, 0] },
  { position: [-11, 6, 9.5], target: [-2, 0.8, 0] },
  { position: [-6.4, 1.6, 5.4], target: [-3, 0.35, 1] },
  { position: [3.5, 3.4, 7.5], target: [7.5, 0.3, 0] },
  { position: [18, 2.8, 1], target: [12.6, 1.1, -4.8] },
];

export type SceneProps = {
  truck: TruckConfig;
  playing: boolean;
  xray: boolean;
  step: number;
  active: boolean;
  /** Desplazamiento de la imagen para dejar espacio al texto superpuesto */
  shift: Shift;
  /** Lecturas para el panel del terminal (se publican ~10 veces por segundo) */
  readings: Store<TruckReading>;
  /** Botones numerados y etiquetas de celdas (DOM) que la escena posiciona en pantalla */
  hotspotElements: RefObject<(HTMLElement | null)[]>;
  cellLabelElements: RefObject<(HTMLElement | null)[]>;
};

export type TruckReading = ScaleReading & { displayed: number; stable: boolean };

/* ─── Materiales compartidos ────────────────────────────────────────────── */

function useMaterials() {
  return useMemo(
    () => ({
      concrete: new THREE.MeshStandardMaterial({ color: COLORS.concrete, roughness: 0.92 }),
      deck: new THREE.MeshStandardMaterial({ color: COLORS.deck, metalness: 0.55, roughness: 0.42, transparent: true }),
      deckRail: new THREE.MeshStandardMaterial({ color: COLORS.deckRail, metalness: 0.5, roughness: 0.5, transparent: true }),
      steel: new THREE.MeshStandardMaterial({ color: COLORS.steel, metalness: 1, roughness: 0.22 }),
      plate: new THREE.MeshStandardMaterial({ color: "#5b6878", metalness: 0.7, roughness: 0.4 }),
      cab: new THREE.MeshStandardMaterial({ color: COLORS.cab, metalness: 0.25, roughness: 0.35 }),
      cargo: new THREE.MeshStandardMaterial({ color: COLORS.cargo, metalness: 0.15, roughness: 0.5 }),
      brand: new THREE.MeshStandardMaterial({ color: COLORS.brand, metalness: 0.3, roughness: 0.45 }),
      chassis: new THREE.MeshStandardMaterial({ color: COLORS.chassis, metalness: 0.4, roughness: 0.6 }),
      tire: new THREE.MeshStandardMaterial({ color: COLORS.tire, roughness: 0.9 }),
      hub: new THREE.MeshStandardMaterial({ color: "#aeb8c3", metalness: 0.85, roughness: 0.3 }),
      glass: new THREE.MeshStandardMaterial({ color: COLORS.glass, metalness: 0.9, roughness: 0.08 }),
      light: new THREE.MeshStandardMaterial({ color: "#ffffff", emissive: "#dfeeff", emissiveIntensity: 1.6 }),
      terminal: new THREE.MeshStandardMaterial({ color: COLORS.terminal, metalness: 0.35, roughness: 0.4 }),
      screen: new THREE.MeshStandardMaterial({ color: "#141414", emissive: COLORS.signal, emissiveIntensity: 0.9 }),
    }),
    []
  );
}

type Materials = ReturnType<typeof useMaterials>;

/* ─── Infraestructura: rampas, bases, plataforma ────────────────────────── */

function Ramp({ side, material }: { side: -1 | 1; material: THREE.Material }) {
  const geometry = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.lineTo(RAMP_LENGTH, 0);
    shape.lineTo(0, DECK_TOP);
    shape.closePath();
    const geo = new THREE.ExtrudeGeometry(shape, { depth: DECK_WIDTH + 0.2, bevelEnabled: false });
    geo.translate(0, 0, -(DECK_WIDTH + 0.2) / 2);
    return geo;
  }, []);

  return (
    <mesh
      geometry={geometry}
      material={material}
      position={[side * DECK_HALF_LENGTH, 0, 0]}
      scale={[side, 1, 1]}
      castShadow
      receiveShadow
    />
  );
}

function Deck({ xray, materials }: { xray: boolean; materials: Materials }) {
  const thickness = DECK_TOP - DECK_BOTTOM;
  const moduleLength = (DECK_HALF_LENGTH * 2) / 3;

  // Transparencia progresiva en la vista de rayos X
  useFrame((_, dt) => {
    const target = xray ? 0.12 : 1;
    for (const mat of [materials.deck, materials.deckRail]) {
      mat.opacity = THREE.MathUtils.damp(mat.opacity, target, 6, dt);
      mat.depthWrite = mat.opacity > 0.95;
    }
  });

  return (
    <group>
      {[-1, 0, 1].map((m) => (
        <group key={m} position={[m * moduleLength, DECK_BOTTOM + thickness / 2, 0]}>
          <mesh material={materials.deck} castShadow={!xray} receiveShadow>
            <boxGeometry args={[moduleLength - 0.04, thickness, DECK_WIDTH]} />
            {xray && <Edges color={COLORS.signal} threshold={15} />}
          </mesh>
          {/* Guías laterales */}
          {[-1, 1].map((s) => (
            <mesh
              key={s}
              material={materials.deckRail}
              position={[0, thickness / 2 + 0.07, s * (DECK_WIDTH / 2 - 0.06)]}
              castShadow={!xray}
            >
              <boxGeometry args={[moduleLength - 0.3, 0.14, 0.12]} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}

function Foundations({ materials }: { materials: Materials }) {
  return (
    <group>
      {SUPPORT_X.map((x) => (
        <mesh key={x} material={materials.concrete} position={[x, 0.125, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.9, 0.25, DECK_WIDTH + 0.5]} />
        </mesh>
      ))}
      {/* Losa bajo la plataforma */}
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.004, 0]} receiveShadow>
        <planeGeometry args={[DECK_HALF_LENGTH * 2 + 0.6, DECK_WIDTH + 1]} />
        <meshStandardMaterial color="#25374d" roughness={1} />
      </mesh>
      <Ramp side={-1} material={materials.concrete} />
      <Ramp side={1} material={materials.concrete} />
    </group>
  );
}

/* ─── Celdas de carga ───────────────────────────────────────────────────── */

function LoadCells({ readingRef, materials }: { readingRef: React.RefObject<ScaleReading>; materials: Materials }) {
  const ringMaterials = useMemo(
    () =>
      CELLS.map(
        () =>
          new THREE.MeshStandardMaterial({
            color: "#2a2a28",
            emissive: COLORS.signal,
            emissiveIntensity: 0.2,
            metalness: 0.3,
            roughness: 0.4,
          })
      ),
    []
  );

  // El anillo de cada celda brilla según la carga que recibe
  useFrame((_, dt) => {
    const cells = readingRef.current?.cells ?? [];
    ringMaterials.forEach((mat, i) => {
      const target = 0.15 + Math.min(1, (cells[i] ?? 0) / 9000) * 3.2;
      mat.emissiveIntensity = THREE.MathUtils.damp(mat.emissiveIntensity, target, 8, dt);
    });
  });

  return (
    <group>
      {CELLS.map((cell, i) => (
        <group key={cell.id} position={[cell.x, 0.25, cell.z]}>
          {/* Piezas chicas: sin sombra propia (ahorra una pasada por celda en el mapa de sombras) */}
          <mesh material={materials.plate} position={[0, 0.015, 0]}>
            <boxGeometry args={[0.42, 0.03, 0.42]} />
          </mesh>
          <mesh material={materials.steel} position={[0, 0.12, 0]}>
            <cylinderGeometry args={[0.075, 0.085, 0.18, 24]} />
          </mesh>
          <mesh material={ringMaterials[i]} position={[0, 0.13, 0]}>
            <cylinderGeometry args={[0.092, 0.092, 0.03, 24]} />
          </mesh>
          <mesh material={materials.plate} position={[0, 0.235, 0]}>
            <boxGeometry args={[0.36, 0.03, 0.36]} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/* ─── Red digital: cables y pulsos de datos ─────────────────────────────── */

type LineRef = ComponentRef<typeof Line>;

const CABLE_Y = 0.3;
const TERMINAL_POS: [number, number, number] = [12.6, 0, -4.8];

function useCableRoutes() {
  return useMemo(() => {
    const sideA = SUPPORT_X.map((x) => [x, CABLE_Y, -CELL_Z - 0.16] as [number, number, number]);
    const sideB = SUPPORT_X.map((x) => [x, CABLE_Y, CELL_Z + 0.16] as [number, number, number]);
    const last = SUPPORT_X[SUPPORT_X.length - 1];
    const bridge: [number, number, number][] = [
      [last, CABLE_Y, CELL_Z + 0.16],
      [last + 0.35, CABLE_Y, 0],
      [last, CABLE_Y, -CELL_Z - 0.16],
    ];
    const homeRun: [number, number, number][] = [
      [last, CABLE_Y, -CELL_Z - 0.16],
      [last + 0.6, 0.05, -CELL_Z - 0.9],
      [TERMINAL_POS[0] - 0.4, 0.05, TERMINAL_POS[2] + 0.6],
      [TERMINAL_POS[0], 0.05, TERMINAL_POS[2]],
      [TERMINAL_POS[0], 1.05, TERMINAL_POS[2]],
    ];
    return [sideA, sideB, bridge, homeRun];
  }, []);
}

function DataNetwork({ activityRef }: { activityRef: React.RefObject<number> }) {
  const routes = useCableRoutes();
  const pulses = useRef<(LineRef | null)[]>([]);

  // Los pulsos viajan hacia el terminal; más rápido cuando cambia la carga
  useFrame((_, dt) => {
    const speed = 0.6 + (activityRef.current ?? 0) * 2.4;
    for (const line of pulses.current) {
      if (!line) continue;
      const mat = line.material as unknown as { dashOffset: number };
      mat.dashOffset -= dt * speed;
    }
  });

  return (
    <group>
      {routes.map((points, i) => (
        <group key={i}>
          <Line points={points} color={COLORS.cable} lineWidth={3} />
          <Line
            ref={(el) => {
              pulses.current[i] = el;
            }}
            points={points}
            color={COLORS.signal}
            lineWidth={2.4}
            dashed
            dashSize={0.18}
            gapSize={0.9}
            transparent
            opacity={0.95}
          />
        </group>
      ))}
    </group>
  );
}

function Terminal({ materials, stableRef }: { materials: Materials; stableRef: React.RefObject<boolean> }) {
  const led = useRef<THREE.MeshStandardMaterial>(null);

  // LED verde encendido cuando la lectura está estable
  useFrame((_, dt) => {
    const mat = led.current;
    if (mat) mat.emissiveIntensity = THREE.MathUtils.damp(mat.emissiveIntensity, stableRef.current ? 2.6 : 0.2, 10, dt);
  });

  return (
    <group position={TERMINAL_POS} rotation-y={Math.PI / 4}>
      <mesh material={materials.concrete} position={[0, 0.05, 0]} receiveShadow castShadow>
        <boxGeometry args={[0.7, 0.1, 0.7]} />
      </mesh>
      <mesh material={materials.chassis} position={[0, 0.6, 0]} castShadow>
        <cylinderGeometry args={[0.05, 0.05, 1.1, 12]} />
      </mesh>
      <RoundedBox args={[0.78, 0.56, 0.2]} radius={0.04} position={[0, 1.35, 0]} material={materials.terminal} castShadow />
      <mesh material={materials.screen} position={[0.04, 1.39, 0.101]}>
        <planeGeometry args={[0.56, 0.24]} />
      </mesh>
      <mesh position={[-0.3, 1.2, 0.105]}>
        <circleGeometry args={[0.025, 16]} />
        <meshStandardMaterial ref={led} color="#0f3d2a" emissive="#3ee08f" emissiveIntensity={0.3} />
      </mesh>
    </group>
  );
}

/* ─── Camión ────────────────────────────────────────────────────────────── */

function Wheels({
  axle,
  spinRef,
  materials,
}: {
  axle: TruckConfig["axles"][number];
  spinRef: React.RefObject<number>;
  materials: Materials;
}) {
  const group = useRef<THREE.Group[]>([]);
  const width = axle.dual ? 0.62 : 0.34;

  useFrame(() => {
    for (const g of group.current) if (g) g.rotation.z = -(spinRef.current ?? 0) / WHEEL_RADIUS;
  });

  return (
    <>
      {[-1, 1].map((side) => (
        <group
          key={side}
          position={[axle.offset, WHEEL_RADIUS, side * (1.25 - width / 2 + 0.05)]}
          ref={(el) => {
            if (el) group.current[side === -1 ? 0 : 1] = el;
          }}
        >
          <mesh material={materials.tire} rotation-x={Math.PI / 2} castShadow>
            <cylinderGeometry args={[WHEEL_RADIUS, WHEEL_RADIUS, width, 28]} />
          </mesh>
          <mesh material={materials.hub} rotation-x={Math.PI / 2} position={[0, 0, side * (width / 2 + 0.002)]}>
            <cylinderGeometry args={[0.26, 0.26, 0.02, 20]} />
          </mesh>
        </group>
      ))}
    </>
  );
}

function Truck({
  truck,
  truckRef,
  spinRef,
  materials,
}: {
  truck: TruckConfig;
  truckRef: React.RefObject<THREE.Group | null>;
  spinRef: React.RefObject<number>;
  materials: Materials;
}) {
  const lastAxle = truck.axles[truck.axles.length - 1].offset;
  const isSemi = truck.body === "semi";
  const cargoStart = isSemi ? -2.4 : -1.25;
  const cargoEnd = lastAxle - (isSemi ? 1.6 : 1.3);
  const cargoLength = cargoStart - cargoEnd;
  const cargoBottom = isSemi ? 1.35 : 1.15;
  const cargoHeight = isSemi ? 2.65 : 2.45;
  const frameEnd = isSemi ? -5.7 : cargoEnd + 0.2;

  return (
    <group ref={truckRef}>
      {/* Chasis */}
      <mesh material={materials.chassis} position={[(1.2 + frameEnd) / 2, 0.92, 0]} castShadow>
        <boxGeometry args={[1.2 - frameEnd, 0.24, 1.1]} />
      </mesh>

      {/* Cabina */}
      <RoundedBox args={[2.45, 2.45, 2.45]} radius={0.14} smoothness={3} position={[0.18, 2.2, 0]} material={materials.cab} castShadow />
      <mesh material={materials.glass} position={[1.41, 2.72, 0]}>
        <boxGeometry args={[0.04, 0.95, 2.1]} />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} material={materials.glass} position={[0.6, 2.75, s * 1.226]}>
          <boxGeometry args={[0.9, 0.7, 0.02]} />
        </mesh>
      ))}
      <mesh material={materials.brand} position={[0.18, 1.45, 0]}>
        <boxGeometry args={[2.47, 0.22, 2.47]} />
      </mesh>
      <mesh material={materials.chassis} position={[1.46, 1.15, 0]} castShadow>
        <boxGeometry args={[0.16, 0.36, 2.35]} />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} material={materials.light} position={[1.55, 1.18, s * 0.9]}>
          <boxGeometry args={[0.02, 0.12, 0.32]} />
        </mesh>
      ))}

      {/* Carga */}
      {isSemi && (
        <mesh material={materials.chassis} position={[-4.2, 1.18, 0]}>
          <cylinderGeometry args={[0.5, 0.5, 0.08, 20]} />
        </mesh>
      )}
      <RoundedBox
        args={[cargoLength, cargoHeight, 2.5]}
        radius={0.06}
        smoothness={2}
        position={[(cargoStart + cargoEnd) / 2, cargoBottom + cargoHeight / 2, 0]}
        material={materials.cargo}
        castShadow
      />
      <mesh material={materials.brand} position={[(cargoStart + cargoEnd) / 2, cargoBottom + 0.35, 0]}>
        <boxGeometry args={[cargoLength + 0.01, 0.16, 2.52]} />
      </mesh>
      {/* Subchasis del semirremolque sobre los ejes traseros */}
      {isSemi && (
        <mesh
          material={materials.chassis}
          position={[(truck.axles[truck.axles.length - 2].offset + lastAxle) / 2, cargoBottom - 0.15, 0]}
        >
          <boxGeometry args={[3.2, 0.3, 1.1]} />
        </mesh>
      )}

      {truck.axles.map((axle) => (
        <Wheels key={axle.offset} axle={axle} spinRef={spinRef} materials={materials} />
      ))}
    </group>
  );
}

/* ─── Mundo: simulación + cámara ────────────────────────────────────────── */

type Phase = "approach" | "weigh" | "exit";

function World({
  truck,
  playing,
  xray,
  step,
  shift,
  readings,
  hotspotElements,
  cellLabelElements,
}: Omit<SceneProps, "active">) {
  const materials = useMaterials();
  const controls = useRef<CameraControls>(null);

  const truckRef = useRef<THREE.Group>(null);
  const sim = useRef({ phase: "approach" as Phase, x: START_X, speed: MAX_SPEED, hold: 0 });
  const spin = useRef(0);
  const reading = useRef<ScaleReading>(computeReading(truck, START_X));
  const displayed = useRef(0);
  const activity = useRef(0);
  const stable = useRef(false);
  const emitClock = useRef(0);
  const playingRef = useRef(playing);

  useEffect(() => {
    playingRef.current = playing;
  }, [playing]);

  // Nuevo camión: si está en pausa queda pesándose; si no, entra desde la izquierda
  useEffect(() => {
    sim.current = playingRef.current
      ? { phase: "approach", x: START_X, speed: MAX_SPEED, hold: 0 }
      : { phase: "weigh", x: stopPosition(truck), speed: 0, hold: 0 };
  }, [truck]);

  // Cámara: sin zoom con la rueda (no secuestra el scroll de la página).
  // El touch-action del visor se fija en CSS (ver TruckScaleDemo) para que el scroll vertical siga funcionando en móviles.
  useEffect(() => {
    const c = controls.current;
    if (!c) return;
    c.mouseButtons.wheel = CameraControlsImpl.ACTION.NONE;
    c.mouseButtons.middle = CameraControlsImpl.ACTION.NONE;
    c.touches.two = CameraControlsImpl.ACTION.TOUCH_DOLLY_TRUCK;
    c.touches.three = CameraControlsImpl.ACTION.NONE;
  }, []);

  const { distance } = useResponsiveFraming(controls, shift);

  // Vista del paso elegido (también se reencuadra si cambia el tamaño del visor)
  useEffect(() => {
    controls.current?.setLookAt(...scaleView(CAMERA_PRESETS[step] ?? CAMERA_PRESETS[0], distance), true);
  }, [step, distance]);

  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 0.05);
    const s = sim.current;
    const stopX = stopPosition(truck);
    const endX = DECK_HALF_LENGTH + RAMP_LENGTH + 14 - truck.axles[truck.axles.length - 1].offset;
    const prevX = s.x;

    if (playingRef.current) {
      if (s.phase === "approach") {
        const remaining = stopX - s.x;
        s.speed = MAX_SPEED * THREE.MathUtils.clamp(remaining / 7, 0.06, 1);
        s.x = Math.min(stopX, s.x + s.speed * dt);
        if (stopX - s.x < 0.005) {
          s.x = stopX;
          s.phase = "weigh";
          s.hold = 0;
          s.speed = 0;
        }
      } else if (s.phase === "weigh") {
        s.hold += dt;
        if (s.hold > HOLD_SECONDS) s.phase = "exit";
      } else {
        s.speed = Math.min(MAX_SPEED, s.speed + 2.2 * dt);
        s.x += s.speed * dt;
        if (s.x > endX) {
          s.phase = "approach";
          s.x = START_X;
          s.speed = MAX_SPEED;
        }
      }
    }

    const moved = s.x - prevX;
    if (moved > 0) spin.current += moved;

    // Posición e inclinación del camión según la rampa
    const span = Math.abs(truck.axles[truck.axles.length - 1].offset);
    const hFront = surfaceHeight(s.x);
    const hRear = surfaceHeight(s.x - span);
    if (truckRef.current) {
      truckRef.current.position.set(s.x, hFront, 0);
      truckRef.current.rotation.z = Math.asin(THREE.MathUtils.clamp((hFront - hRear) / span, -1, 1));
    }

    // Lectura: el indicador se estabiliza como en un terminal real
    const r = computeReading(truck, s.x);
    const prevTotal = reading.current.total;
    reading.current = r;
    displayed.current = THREE.MathUtils.damp(displayed.current, r.total, 5, dt);
    if (Math.abs(displayed.current - r.total) < 1) displayed.current = r.total;
    activity.current = THREE.MathUtils.damp(activity.current, r.total !== prevTotal || moved > 0.001 ? 1 : 0, 3, dt);
    stable.current = s.phase === "weigh" && Math.abs(displayed.current - r.total) < 10 && r.total > 0;

    // Al panel: ~10 veces por segundo y solo a los componentes suscritos (no re-renderiza la escena)
    emitClock.current += dt;
    if (emitClock.current > 0.1) {
      emitClock.current = 0;
      readings.set({ ...r, displayed: displayed.current, stable: stable.current });
    }
  });

  return (
    <>
      <color attach="background" args={[COLORS.background]} />
      <fog attach="fog" args={[COLORS.background, 32 * distance, 80 * distance]} />

      <hemisphereLight args={["#d8e5f3", "#002a5a", 0.8]} />
      <directionalLight
        position={[-12, 20, 12]}
        intensity={2.4}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0004}
        shadow-camera-left={-24}
        shadow-camera-right={24}
        shadow-camera-top={14}
        shadow-camera-bottom={-14}
      />
      <Environment resolution={256} frames={1}>
        <Lightformer intensity={2.5} position={[0, 12, 0]} rotation-x={Math.PI / 2} scale={[40, 12, 1]} />
        <Lightformer intensity={1.2} position={[-14, 4, 10]} scale={[12, 3, 1]} color="#d8e5f3" />
        <Lightformer intensity={0.8} position={[14, 3, -10]} scale={[12, 3, 1]} color="#7ea7d3" />
      </Environment>

      <mesh rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[220, 220]} />
        <meshStandardMaterial color={COLORS.ground} roughness={0.95} />
      </mesh>
      <Grid
        position={[0, 0.002, 0]}
        args={[220, 220]}
        cellSize={1}
        cellThickness={0.5}
        cellColor="#0b3d78"
        sectionSize={6}
        sectionThickness={1}
        sectionColor="#1b5296"
        fadeDistance={60}
        fadeStrength={1.6}
        infiniteGrid
      />

      <Foundations materials={materials} />
      <LoadCells readingRef={reading} materials={materials} />
      <DataNetwork activityRef={activity} />
      <Deck xray={xray} materials={materials} />
      <Terminal materials={materials} stableRef={stable} />
      <Truck truck={truck} truckRef={truckRef} spinRef={spin} materials={materials} />

      {/* Botones numerados y etiquetas de celdas: elementos DOM posicionados desde aquí */}
      <ScreenAnchors points={HOTSPOT_POINTS} elements={hotspotElements} />
      <ScreenAnchors points={CELL_LABEL_POSITIONS} elements={cellLabelElements} isVisible={() => xray} />

      <CameraControls
        ref={controls}
        makeDefault
        minDistance={4}
        maxDistance={42 * distance}
        maxPolarAngle={Math.PI / 2.15}
        smoothTime={0.55}
      />
    </>
  );
}

export default function TruckScaleScene({ active, ...props }: SceneProps) {
  // Resolución según los fps; si el equipo no da abasto, además se apagan las sombras dinámicas
  const [dpr, setDpr] = useState(ADAPTIVE_DPR.initial);
  const [shadows, setShadows] = useState(true);
  const initial = CAMERA_PRESETS[0];

  return (
    <Canvas
      shadows={shadows}
      dpr={[1, dpr]}
      // Fuera de pantalla: "demand" renderiza solo al montar (compila shaders por adelantado) y luego se detiene
      frameloop={active ? "always" : "demand"}
      camera={{ position: initial.position, fov: 38, near: 0.1, far: 220 }}
      gl={{ antialias: true, powerPreference: "high-performance", stencil: false }}
      aria-label="Modelo 3D interactivo de una báscula de camiones"
      fallback={
        <div className="flex h-full items-center justify-center p-8 text-center text-sm text-white/70">
          Su navegador no admite gráficos 3D (WebGL).
        </div>
      }
    >
      <PerformanceMonitor
        flipflops={3}
        onChange={({ factor }) => setDpr(ADAPTIVE_DPR.fromFactor(factor))}
        onFallback={() => {
          setDpr(ADAPTIVE_DPR.min);
          setShadows(false);
        }}
      />
      <World {...props} />
    </Canvas>
  );
}
