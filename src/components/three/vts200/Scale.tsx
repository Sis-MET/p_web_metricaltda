"use client";

import { useMemo, useRef, type ComponentRef, type RefObject } from "react";
import { useFrame } from "@react-three/fiber";
import { Line } from "@react-three/drei";
import * as THREE from "three";
import { easeOut, segment, span, useBuild } from "./build";
import { COLORS, type Materials } from "./materials";
import { CELL_Z, DECK_THICKNESS, LEVEL, SIDE_WALL, WIDTH, type Box, type Layout, type ScaleReading } from "./model";

const STEP = 5;
const MODULES = { from: 0.14, to: 0.7 };
const LIFT = 7;
const HOOK = 3.6;

/* ─── Celdas POWERCELL PDX ──────────────────────────────────────────────── */

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
  const rings = useMemo(
    () =>
      layout.cells.map(
        () =>
          new THREE.MeshStandardMaterial({
            color: "#2a2a28",
            emissive: COLORS.signal,
            emissiveIntensity: 0.2,
            metalness: 0.3,
            roughness: 0.4,
          })
      ),
    [layout.cells]
  );

  useFrame((_, dt) => {
    const p = build.stage(STEP);
    const loads = reading.current.cells;
    groups.current.forEach((group, i) => {
      if (!group) return;
      const s = span(p, i * 0.008, 0.08 + i * 0.008);
      group.visible = s > 0;
      group.scale.setScalar(Math.max(s, 1e-4));
      // El anillo de cada celda brilla según la carga que recibe
      const target = 0.15 + Math.min(1, (loads[i] ?? 0) / 9000) * 3.2;
      rings[i].emissiveIntensity = THREE.MathUtils.damp(rings[i].emissiveIntensity, target, 8, dt);
    });
  });

  return (
    <group>
      {layout.cells.map((cell, i) => (
        <group
          key={cell.id}
          position={[cell.x, LEVEL.pier, cell.z]}
          ref={(el) => {
            groups.current[i] = el;
          }}
          visible={false}
        >
          <mesh material={materials.plate} position={[0, 0.015, 0]}>
            <boxGeometry args={[0.36, 0.03, 0.36]} />
          </mesh>
          <mesh material={materials.steel} position={[0, 0.06, 0]}>
            <cylinderGeometry args={[0.07, 0.08, 0.06, 24]} />
          </mesh>
          <mesh material={rings[i]} position={[0, 0.065, 0]}>
            <cylinderGeometry args={[0.088, 0.088, 0.02, 24]} />
          </mesh>
          <mesh material={materials.plate} position={[0, 0.1, 0]}>
            <boxGeometry args={[0.3, 0.02, 0.3]} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/* ─── Módulos de acero: bajan uno por uno con la grúa ───────────────────── */

function Modules({ layout, materials }: { layout: Layout; materials: Materials }) {
  const build = useBuild();
  const groups = useRef<(THREE.Group | null)[]>([]);
  const rigs = useRef<(THREE.Group | null)[]>([]);
  const n = layout.modules.length;
  const slot = (MODULES.to - MODULES.from) / n;

  // Caras de la caja: +x, -x, arriba, abajo, +z, -z
  const faces = useMemo(
    () => [materials.deckSide, materials.deckSide, materials.deckTop, materials.deckSide, materials.deckSide, materials.deckSide],
    [materials]
  );

  useFrame(() => {
    const p = build.stage(STEP);
    for (let i = 0; i < n; i++) {
      const group = groups.current[i];
      if (!group) continue;
      const t = span(p, MODULES.from + i * slot, MODULES.from + (i + 1) * slot);
      group.visible = t > 0;
      group.position.y = -DECK_THICKNESS / 2 + (1 - easeOut(t)) * LIFT;
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
            <mesh material={faces} castShadow receiveShadow>
              <boxGeometry args={[module.length - 0.03, DECK_THICKNESS, WIDTH]} />
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

type LineRef = ComponentRef<typeof Line>;

function Network({ layout, active }: { layout: Layout; active: RefObject<number> }) {
  const build = useBuild();
  const group = useRef<THREE.Group>(null);
  const pulse = useRef<LineRef>(null);
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

  useFrame((_, dt) => {
    const visible = span(build.stage(STEP), 0.86, 1) > 0;
    if (group.current) group.current.visible = visible;
    if (!visible || !pulse.current) return;
    // Los datos viajan hacia la caseta; más rápido mientras se pesa
    (pulse.current.material as unknown as { dashOffset: number }).dashOffset -= dt * (0.6 + active.current * 2.4);
  });

  return (
    <group ref={group} visible={false}>
      <Line points={points} color="#3a3a38" lineWidth={3} />
      <Line ref={pulse} points={points} color={COLORS.signal} lineWidth={2.4} dashed dashSize={0.18} gapSize={0.9} transparent opacity={0.95} />
    </group>
  );
}

/* ─── Conjunto ──────────────────────────────────────────────────────────── */

export function Scale({
  layout,
  materials,
  reading,
  activity,
}: {
  layout: Layout;
  materials: Materials;
  reading: RefObject<ScaleReading>;
  /** 0..1: cuánto cambia la carga (acelera los pulsos de datos) */
  activity: RefObject<number>;
}) {
  return (
    <group>
      <LoadCells layout={layout} materials={materials} reading={reading} />
      <Modules layout={layout} materials={materials} />
      <Booth layout={layout} materials={materials} />
      <Network layout={layout} active={activity} />
    </group>
  );
}
