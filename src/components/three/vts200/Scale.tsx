"use client";

import { useMemo, useRef, type ComponentRef, type RefObject } from "react";
import { useFrame } from "@react-three/fiber";
import { Edges, Line } from "@react-three/drei";
import * as THREE from "three";
import { easeOut, segment, span, useBuild } from "./build";
import { COLORS, fadeTo, type Materials } from "./materials";
import {
  CELL,
  CELL_VIEW_DIRECTION,
  CELL_Z,
  DECK_THICKNESS,
  FOCUS_CELL,
  LEVEL,
  SIDE_WALL,
  WIDTH,
  type Box,
  type Layout,
  type ScaleReading,
} from "./model";

const STEP = 5;
const MODULES = { from: 0.14, to: 0.7 };
const LIFT = 7;
const HOOK = 3.6;

/* ─── Celdas POWERCELL PDX ──────────────────────────────────────────────── */

// Orientación de la celda abierta: le falta el cuarto que mira a la cámara de la vista de celdas
const OPEN_ANGLE = Math.atan2(CELL_VIEW_DIRECTION.x, CELL_VIEW_DIRECTION.z);
const BODY_Y = CELL.plate + CELL.cup + CELL.body / 2;
const TOP_Y = CELL.plate + CELL.cup + CELL.body;
const GAUGE_RADIUS = 0.0225;

const CELL_GEOMETRY = {
  plate: new THREE.BoxGeometry(0.3, CELL.plate, 0.3).translate(0, CELL.plate / 2, 0),
  cup: new THREE.CylinderGeometry(0.065, 0.065, CELL.cup, 28),
  body: new THREE.CylinderGeometry(CELL.radius, CELL.radius, CELL.body, 32),
  bodyOpen: new THREE.CylinderGeometry(CELL.radius, CELL.radius, CELL.body, 32, 1, true, OPEN_ANGLE + Math.PI / 4, Math.PI * 1.5),
  ring: new THREE.TorusGeometry(CELL.radius + 0.002, 0.004, 8, 32).rotateX(Math.PI / 2),
  top: new THREE.BoxGeometry(0.26, 0.02, 0.26),
  column: new THREE.CapsuleGeometry(0.022, 0.06, 6, 16),
  gauge: new THREE.BoxGeometry(0.012, 0.022, 0.003),
  pcb: new THREE.CylinderGeometry(0.046, 0.046, 0.006, 28),
  chip: new THREE.BoxGeometry(0.016, 0.005, 0.016),
  gland: new THREE.CylinderGeometry(0.011, 0.011, 0.03, 12).rotateZ(Math.PI / 2),
};

/** Carga (kg) con la que se ve la deformación máxima, muy exagerada para que se note */
const FULL_LOAD = 9000;

function LoadCells({
  layout,
  materials,
  reading,
}: {
  layout: Layout;
  materials: Materials;
  reading: RefObject<ScaleReading>;
}) {
  const build = useBuild();
  const groups = useRef<(THREE.Group | null)[]>([]);
  const column = useRef<THREE.Mesh>(null);
  const body = useRef<THREE.Mesh>(null);
  const bodyOpen = useRef<THREE.Mesh>(null);
  const lamp = useRef<THREE.PointLight>(null);
  const focus = layout.cells[FOCUS_CELL];
  // Anillo de estado de cada celda y galgas de la celda abierta: brillan según la carga
  const rings = useMemo(
    () =>
      layout.cells.map(
        () => new THREE.MeshStandardMaterial({ color: "#2a2a28", emissive: COLORS.signal, emissiveIntensity: 0.2, roughness: 0.4 })
      ),
    [layout.cells]
  );
  const gauges = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#7a5a12", emissive: COLORS.signal, emissiveIntensity: 0.2, roughness: 0.5 }),
    []
  );

  useFrame((_, dt) => {
    const p = build.stage(STEP);
    const loads = reading.current.cells;
    groups.current.forEach((group, i) => {
      if (!group) return;
      const s = span(p, i * 0.008, 0.08 + i * 0.008);
      group.visible = s > 0;
      group.scale.setScalar(Math.max(s, 1e-4));
      const load = Math.min(1, (loads[i] ?? 0) / FULL_LOAD);
      rings[i].emissiveIntensity = THREE.MathUtils.damp(rings[i].emissiveIntensity, 0.15 + load * 1.8, 8, dt);
      if (i !== FOCUS_CELL) return;
      gauges.emissiveIntensity = THREE.MathUtils.damp(gauges.emissiveIntensity, 0.2 + load * 4, 8, dt);
      if (column.current) column.current.scale.y = THREE.MathUtils.damp(column.current.scale.y, 1 - load * 0.08, 8, dt);
    });
    // La celda se abre en la vista de celdas, con una luz de inspección
    const open = build.action(STEP);
    if (body.current) body.current.visible = !open;
    if (bodyOpen.current) bodyOpen.current.visible = open;
    if (lamp.current) lamp.current.intensity = THREE.MathUtils.damp(lamp.current.intensity, open ? 0.6 : 0, 6, dt);
  });

  return (
    <group>
      <pointLight
        ref={lamp}
        position={[focus.x + CELL_VIEW_DIRECTION.x * 0.35, LEVEL.pier + 0.2, focus.z + CELL_VIEW_DIRECTION.z * 0.35]}
        intensity={0}
        distance={1.5}
        decay={2}
        color="#fff6e8"
      />
      {layout.cells.map((cell, i) => {
        const isFocus = i === FOCUS_CELL;
        return (
          <group
            key={cell.id}
            position={[cell.x, LEVEL.pier, cell.z]}
            ref={(el) => {
              groups.current[i] = el;
            }}
            visible={false}
          >
            <mesh geometry={CELL_GEOMETRY.plate} material={materials.plate} receiveShadow />
            <mesh geometry={CELL_GEOMETRY.cup} material={materials.steel} position={[0, CELL.plate + CELL.cup / 2, 0]} />
            <mesh ref={isFocus ? body : undefined} geometry={CELL_GEOMETRY.body} material={materials.stainless} position={[0, BODY_Y, 0]} castShadow />
            <mesh geometry={CELL_GEOMETRY.ring} material={rings[i]} position={[0, TOP_Y - 0.015, 0]} />
            <mesh geometry={CELL_GEOMETRY.cup} material={materials.steel} position={[0, TOP_Y + CELL.cup / 2, 0]} />
            <mesh geometry={CELL_GEOMETRY.top} material={materials.plate} position={[0, TOP_Y + CELL.cup + 0.01, 0]} />
            <mesh geometry={CELL_GEOMETRY.gland} material={materials.dark} position={[-CELL.radius - 0.012, CELL.gland, 0]} />
            {isFocus && (
              <>
                <mesh ref={bodyOpen} geometry={CELL_GEOMETRY.bodyOpen} material={materials.stainless} position={[0, BODY_Y, 0]} visible={false} />
                {/* Interior: columna basculante con sus galgas y la electrónica que digitaliza la señal */}
                <mesh ref={column} geometry={CELL_GEOMETRY.column} material={materials.column} position={[0, CELL.column, 0]} />
                {[0, 1, 2, 3].map((k) => {
                  const angle = OPEN_ANGLE + (k * Math.PI) / 2;
                  return (
                    <mesh
                      key={k}
                      geometry={CELL_GEOMETRY.gauge}
                      material={gauges}
                      position={[Math.sin(angle) * GAUGE_RADIUS, CELL.column, Math.cos(angle) * GAUGE_RADIUS]}
                      rotation-y={angle}
                    />
                  );
                })}
                <mesh geometry={CELL_GEOMETRY.pcb} material={materials.pcb} position={[0, CELL.pcb, 0]} />
                <mesh geometry={CELL_GEOMETRY.chip} material={materials.dark} position={[0.012, CELL.pcb + 0.005, -0.01]} />
              </>
            )}
          </group>
        );
      })}
    </group>
  );
}

/* ─── Red digital bajo la plataforma: las celdas en cadena ──────────────── */

type LineRef = ComponentRef<typeof Line>;

/** Hace avanzar los pulsos de datos de las líneas: más rápido mientras cambia la carga */
function advancePulses(lines: (LineRef | null)[], dt: number, activity: number) {
  for (const line of lines) {
    if (line) (line.material as unknown as { dashOffset: number }).dashOffset -= dt * (0.25 + activity * 1.2);
  }
}

function CellNetwork({ layout, active }: { layout: Layout; active: RefObject<number> }) {
  const build = useBuild();
  const group = useRef<THREE.Group>(null);
  const lines = useRef<(LineRef | null)[]>([]);
  const { cells, supports } = layout;

  // Cada celda baja su cable por el prensaestopas a un tendido junto a ella; al final se unen los dos lados
  const routes = useMemo(() => {
    const y = LEVEL.pier + CELL.gland;
    const gland = (x: number) => x - CELL.radius - 0.03;
    const sides = [-1, 1].map((side) => {
      const run = side * (CELL_Z - 0.12);
      return cells
        .filter((cell) => Math.sign(cell.z) === side)
        .flatMap((cell) => [
          [gland(cell.x), y, cell.z],
          [gland(cell.x), y, run],
        ]) as [number, number, number][];
    });
    const last = gland(supports[supports.length - 1]);
    const bridge: [number, number, number][] = [
      [last, y, -(CELL_Z - 0.12)],
      [last, y, CELL_Z - 0.12],
    ];
    return [...sides, bridge];
  }, [cells, supports]);

  useFrame((_, dt) => {
    const visible = build.action(STEP);
    if (group.current) group.current.visible = visible;
    if (visible) advancePulses(lines.current, dt, active.current);
  });

  return (
    <group ref={group} visible={false}>
      {routes.map((points, i) => (
        <group key={i}>
          <Line points={points} color="#3a3a38" lineWidth={2.4} />
          <Line
            ref={(el) => {
              lines.current[i] = el;
            }}
            points={points}
            color={COLORS.signal}
            lineWidth={2}
            dashed
            dashSize={0.05}
            gapSize={0.22}
          />
        </group>
      ))}
    </group>
  );
}

/* ─── Módulos de acero: bajan uno por uno con la grúa ───────────────────── */

function Modules({ layout, materials, xray }: { layout: Layout; materials: Materials; xray: boolean }) {
  const build = useBuild();
  const groups = useRef<(THREE.Group | null)[]>([]);
  const decks = useRef<(THREE.Mesh | null)[]>([]);
  const rigs = useRef<(THREE.Group | null)[]>([]);
  const n = layout.modules.length;
  const slot = (MODULES.to - MODULES.from) / n;

  // Caras de la caja: +x, -x, arriba, abajo, +z, -z
  const faces = useMemo(
    () => [materials.deckSide, materials.deckSide, materials.deckTop, materials.deckSide, materials.deckSide, materials.deckSide],
    [materials]
  );

  useFrame((_, dt) => {
    const p = build.stage(STEP);
    // Vista de celdas: la plataforma se vuelve transparente y deja de dar sombra sobre ellas
    const clear = build.action(STEP);
    fadeTo(materials.deckTop, clear ? 0.12 : 1, dt);
    fadeTo(materials.deckSide, clear ? 0.12 : 1, dt);
    for (let i = 0; i < n; i++) {
      const group = groups.current[i];
      if (!group) continue;
      const t = span(p, MODULES.from + i * slot, MODULES.from + (i + 1) * slot);
      group.visible = t > 0;
      group.position.y = -DECK_THICKNESS / 2 + (1 - easeOut(t)) * LIFT;
      const deck = decks.current[i];
      if (deck) deck.castShadow = !clear;
      const rig = rigs.current[i];
      if (rig) rig.visible = t > 0 && t < 1;
    }
  });

  return (
    <group>
      {layout.modules.map((module, i) => {
        const corners = [-1, 1].flatMap((sx) => [-1, 1].map((sz) => [sx * (module.length / 2 - 0.5), sz * (WIDTH / 2 - 0.3)] as const));
        return (
          <group
            key={`${module.x}`}
            position={[module.x, -DECK_THICKNESS / 2, 0]}
            ref={(el) => {
              groups.current[i] = el;
            }}
            visible={false}
          >
            <mesh
              ref={(el) => {
                decks.current[i] = el;
              }}
              material={faces}
              castShadow
              receiveShadow
            >
              <boxGeometry args={[module.length - 0.03, DECK_THICKNESS, WIDTH]} />
              {xray && <Edges color={COLORS.signal} threshold={15} />}
            </mesh>
            {/* Eslingas de la grúa mientras baja */}
            <group
              ref={(el) => {
                rigs.current[i] = el;
              }}
            >
              {corners.map(([x, z]) => {
                const sling = segment([x, DECK_THICKNESS / 2, z], [0, HOOK, 0]);
                return (
                  <mesh key={`${x}${z}`} material={materials.cable} position={sling.position} quaternion={sling.quaternion}>
                    <cylinderGeometry args={[0.015, 0.015, sling.length, 6]} />
                  </mesh>
                );
              })}
              <mesh material={materials.instrument} position={[0, HOOK + 0.2, 0]}>
                <boxGeometry args={[0.35, 0.4, 0.25]} />
              </mesh>
              <mesh material={materials.cable} position={[0, HOOK + 6, 0]}>
                <cylinderGeometry args={[0.02, 0.02, 11.6, 6]} />
              </mesh>
            </group>
          </group>
        );
      })}
    </group>
  );
}

/* ─── Caseta de control con indicador y computadora ─────────────────────── */

const BOOTH = { w: 2.6, h: 2.5, d: 2.4, wall: 0.08, floor: 0.15 };
const WINDOW = { x: 0.8, y0: 1.05, y1: 1.95 };
// La caseta mira hacia la báscula (+z): ahí van la ventana y el escritorio
const FRONT = BOOTH.d / 2 - BOOTH.wall / 2;

const BOOTH_WALLS: Box[] = (() => {
  const { w, h, d, wall, floor } = BOOTH;
  return [
    { x: 0, y: 0, z: 0, w: w + 0.4, h: floor, d: d + 0.4 },
    { x: 0, y: floor, z: -FRONT, w, h, d: wall },
    { x: -w / 2 + wall / 2, y: floor, z: 0, w: wall, h, d },
    { x: w / 2 - wall / 2, y: floor, z: 0, w: wall, h, d },
    // Frente con la ventana del operador
    { x: 0, y: floor, z: FRONT, w, h: WINDOW.y0, d: wall },
    { x: 0, y: floor + WINDOW.y1, z: FRONT, w, h: h - WINDOW.y1, d: wall },
    ...[-1, 1].map((s) => ({
      x: (s * (w / 2 + WINDOW.x)) / 2,
      y: floor + WINDOW.y0,
      z: FRONT,
      w: w / 2 - WINDOW.x,
      h: WINDOW.y1 - WINDOW.y0,
      d: wall,
    })),
  ];
})();

function Booth({ layout, materials }: { layout: Layout; materials: Materials }) {
  const build = useBuild();
  const group = useRef<THREE.Group>(null);
  const { w, h, d, floor } = BOOTH;

  useFrame(() => {
    const g = group.current;
    if (!g) return;
    const t = span(build.stage(STEP), 0.72, 0.86);
    g.visible = t > 0;
    g.scale.set(1, Math.max(easeOut(t), 1e-4), 1);
  });

  return (
    <group ref={group} position={layout.spots.booth} visible={false}>
      {BOOTH_WALLS.map((b, i) => (
        <mesh key={i} material={i === 0 ? materials.concrete : materials.boothWall} position={[b.x, b.y + b.h / 2, b.z]} castShadow receiveShadow>
          <boxGeometry args={[b.w, b.h, b.d]} />
        </mesh>
      ))}
      <mesh material={materials.boothRoof} position={[0, floor + h + 0.08, 0]} castShadow>
        <boxGeometry args={[w + 0.5, 0.16, d + 0.5]} />
      </mesh>
      <mesh material={materials.glass} position={[0, floor + (WINDOW.y0 + WINDOW.y1) / 2, FRONT]}>
        <boxGeometry args={[WINDOW.x * 2, WINDOW.y1 - WINDOW.y0, 0.02]} />
      </mesh>
      <mesh material={materials.dark} position={[w / 2 + 0.005, floor + 1, 0.45]}>
        <boxGeometry args={[0.02, 2, 0.9]} />
      </mesh>

      {/* Escritorio con el indicador de pesaje y la computadora del software del cliente */}
      <mesh material={materials.boothRoof} position={[0, floor + 0.78, FRONT - 0.45]}>
        <boxGeometry args={[2.2, 0.05, 0.7]} />
      </mesh>
      <group position={[-0.45, floor + 0.8, FRONT - 0.4]}>
        <mesh material={materials.dark} position={[0, 0.13, 0]}>
          <boxGeometry args={[0.36, 0.26, 0.14]} />
        </mesh>
        <mesh material={materials.screen} position={[0, 0.16, 0.071]}>
          <planeGeometry args={[0.26, 0.1]} />
        </mesh>
      </group>
      <group position={[0.45, floor + 0.8, FRONT - 0.55]}>
        <mesh material={materials.dark} position={[0, 0.3, 0]}>
          <boxGeometry args={[0.62, 0.38, 0.04]} />
        </mesh>
        <mesh material={materials.screen} position={[0, 0.3, 0.021]}>
          <planeGeometry args={[0.56, 0.32]} />
        </mesh>
        <mesh material={materials.dark} position={[0, 0.06, 0]}>
          <boxGeometry args={[0.06, 0.12, 0.06]} />
        </mesh>
      </group>
    </group>
  );
}

/* ─── Red digital: de las celdas a la caseta ────────────────────────────── */

function Network({ layout, active }: { layout: Layout; active: RefObject<number> }) {
  const build = useBuild();
  const group = useRef<THREE.Group>(null);
  const pulses = useRef<(LineRef | null)[]>([]);
  const { supports, pit, spots } = layout;
  const [bx, , bz] = spots.booth;

  const points = useMemo(() => {
    // La caseta está del lado -z: el cable sale por el muro de ese lado
    const x = supports[supports.length - 1];
    const wallTop = -(pit.z + SIDE_WALL + 0.1);
    const booth = bz + BOOTH.d / 2 + 0.1;
    return [
      [x, LEVEL.pier + 0.08, -CELL_Z],
      [x, LEVEL.pier + 0.08, -pit.z + 0.08],
      [x, 0.04, -pit.z + 0.08],
      [x, 0.04, wallTop],
      [bx, 0.04, wallTop],
      [bx, 0.04, booth],
      [bx, 0.9, booth],
    ] as [number, number, number][];
  }, [bx, bz, pit.z, supports]);

  // Los datos viajan hacia la caseta
  useFrame((_, dt) => {
    const visible = span(build.stage(STEP), 0.86, 1) > 0;
    if (group.current) group.current.visible = visible;
    if (visible) advancePulses(pulses.current, dt, active.current);
  });

  return (
    <group ref={group} visible={false}>
      <Line points={points} color="#3a3a38" lineWidth={3} />
      <Line
        ref={(el) => {
          pulses.current[0] = el;
        }}
        points={points}
        color={COLORS.signal}
        lineWidth={2.4}
        dashed
        dashSize={0.18}
        gapSize={0.9}
      />
    </group>
  );
}

/* ─── Conjunto ──────────────────────────────────────────────────────────── */

export function Scale({
  layout,
  materials,
  reading,
  activity,
  cellView,
}: {
  layout: Layout;
  materials: Materials;
  reading: RefObject<ScaleReading>;
  /** 0..1: cuánto cambia la carga (acelera los pulsos de datos) */
  activity: RefObject<number>;
  /** Vista de celdas: plataforma transparente, celda abierta y red entre celdas */
  cellView: boolean;
}) {
  return (
    <group>
      <LoadCells layout={layout} materials={materials} reading={reading} />
      <CellNetwork layout={layout} active={activity} />
      <Modules layout={layout} materials={materials} xray={cellView} />
      <Booth layout={layout} materials={materials} />
      <Network layout={layout} active={activity} />
    </group>
  );
}
