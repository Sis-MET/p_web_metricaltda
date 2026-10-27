"use client";

import { useMemo, useRef, type ComponentRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Line } from "@react-three/drei";
import * as THREE from "three";
import { Blocks, bar, random, span, useBuild } from "./build";
import { COLORS, type Materials } from "./materials";
import { LEVEL, type Box, type Layout } from "./model";

const STEP = 3;
const PIPE_Y = -0.68;
const PIPE_RADIUS = 0.055;
const SLAB = 0.15;
/** Desnivel de la losa: de los bordes hacia el eje, donde están los sumideros */
const FALL = 0.06;
const CHAMBER = 0.7;

// Tubo y losa de largo 1 que empiezan en el origen: crecen escalando su largo
const PIPE_X = new THREE.CylinderGeometry(PIPE_RADIUS, PIPE_RADIUS, 1, 14).rotateZ(-Math.PI / 2).translate(0.5, 0, 0);
const PIPE_Z = new THREE.CylinderGeometry(PIPE_RADIUS, PIPE_RADIUS, 1, 14).rotateX(Math.PI / 2).translate(0, 0, 0.5);
const SLAB_HALF = new THREE.BoxGeometry(1, SLAB, 1).translate(0.5, -SLAB / 2, 0.5);

/* ─── Lluvia y recorrido del agua ───────────────────────────────────────── */

const DROPS = 1400;

function Rain({ layout }: { layout: Layout }) {
  const build = useBuild();
  const lines = useRef<THREE.LineSegments>(null);
  const { half } = layout;

  // Cada gota es un trazo corto: dos vértices
  const positions = useMemo(() => {
    const rand = random(11);
    const array = new Float32Array(DROPS * 6);
    for (let i = 0; i < DROPS; i++) {
      const x = (rand() - 0.5) * (half * 2 + 10);
      const y = rand() * 9;
      const z = (rand() - 0.5) * 10;
      array.set([x, y, z, x, y + 0.35, z], i * 6);
    }
    return array;
  }, [half]);

  useFrame((_, dt) => {
    if (!build.action(STEP) || !lines.current) return;
    const attr = lines.current.geometry.getAttribute("position") as THREE.BufferAttribute;
    const array = attr.array as Float32Array;
    const fall = Math.min(dt, 0.05) * 11;
    for (let i = 0; i < DROPS; i++) {
      let y = array[i * 6 + 1] - fall;
      if (y < LEVEL.slab) y += 9;
      array[i * 6 + 1] = y;
      array[i * 6 + 4] = y + 0.35;
    }
    attr.needsUpdate = true;
  });

  return (
    <lineSegments ref={lines} frustumCulled={false}>
      <bufferGeometry key={positions.length}>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <lineBasicMaterial color={COLORS.water} transparent opacity={0.55} />
    </lineSegments>
  );
}

type LineRef = ComponentRef<typeof Line>;

/** Corrientes de agua: de los bordes de la losa al eje, por la tubería a la cámara y fuera de la obra */
function WaterFlow({ layout }: { layout: Layout }) {
  const build = useBuild();
  const { half, pit, site, spots } = layout;
  const lines = useRef<(LineRef | null)[]>([]);
  const [cx, , cz] = spots.chamber;

  const routes = useMemo(() => {
    const surface = LEVEL.slab + 0.012;
    const edge = surface + FALL;
    const across = Array.from({ length: Math.round(half / 1.5) }, (_, i) => -half + 1 + i * 3).flatMap((x) =>
      [-1, 1].map((side) => [
        [x, edge, side * (pit.z - 0.1)],
        [x, surface, side * 0.12],
      ])
    );
    const toChamber = [
      [-half + 0.8, surface, 0],
      [cx, surface, 0],
      [cx, surface, cz],
      [cx, 0.05, cz],
    ];
    const outfall = [
      [cx, 0.04, cz],
      [cx, 0.04, site.z1],
    ];
    return [...across, toChamber, outfall] as [number, number, number][][];
  }, [cx, cz, half, pit.z, site.z1]);

  useFrame((_, dt) => {
    if (!build.action(STEP)) return;
    for (const line of lines.current) {
      if (!line) continue;
      (line.material as unknown as { dashOffset: number }).dashOffset -= dt * 1.6;
    }
  });

  return (
    <group>
      {routes.map((points, i) => (
        <Line
          key={i}
          ref={(el) => {
            lines.current[i] = el;
          }}
          points={points}
          color={COLORS.water}
          lineWidth={2.6}
          dashed
          dashSize={0.25}
          gapSize={0.35}
        />
      ))}
    </group>
  );
}

/* ─── Relleno, tuberías, cámara y losa de lavado ────────────────────────── */

export function Drainage({ layout, materials }: { layout: Layout; materials: Materials }) {
  const build = useBuild();
  const { half, pit, dig, spots } = layout;
  const [cx, , cz] = spots.chamber;
  const pipeStart = -half + 0.8;

  const main = useRef<THREE.Mesh>(null);
  const branch = useRef<THREE.Mesh>(null);
  const slabs = useRef<(THREE.Mesh | null)[]>([]);
  const water = useRef<THREE.Group>(null);

  const parts = useMemo(() => {
    const fill: Box[] = [{ x: 0, y: LEVEL.bottom, z: 0, w: dig.x * 2, h: LEVEL.fill - LEVEL.bottom, d: dig.z * 2 }];
    const chamber: Box[] = [{ x: cx, y: -1, z: cz, w: CHAMBER, h: 1.02, d: CHAMBER }];
    const grates: Box[] = [
      { x: cx, y: 0.02, z: cz, w: CHAMBER - 0.16, h: 0.015, d: CHAMBER - 0.16 },
      ...Array.from({ length: Math.round(half / 2) }, (_, i) => ({
        x: -half + 2 + i * 4,
        y: LEVEL.slab - 0.005,
        z: 0,
        w: 0.3,
        h: 0.012,
        d: 0.3,
      })),
    ];
    // Malla de la losa
    const y = LEVEL.slab - 0.08;
    const mesh: Box[] = [];
    for (let z = -pit.z + 0.1; z <= pit.z - 0.1; z += 0.3) mesh.push(bar([-pit.x + 0.1, y, z], [pit.x - 0.1, y, z], 0.016));
    for (let x = -pit.x + 0.1; x <= pit.x - 0.1; x += 0.3) mesh.push(bar([x, y, -pit.z + 0.1], [x, y, pit.z - 0.1], 0.016));
    return { fill, chamber, grates, mesh };
  }, [cx, cz, dig.x, dig.z, half, pit.x, pit.z]);

  useFrame(() => {
    const p = build.stage(STEP);
    const pipe = span(p, 0.2, 0.38);
    const turn = span(p, 0.36, 0.44);
    if (main.current) {
      main.current.visible = pipe > 0;
      main.current.scale.x = Math.max((cx - pipeStart) * pipe, 1e-4);
    }
    if (branch.current) {
      branch.current.visible = turn > 0;
      branch.current.scale.z = Math.max(cz * turn, 1e-4);
    }
    // Vaciado de la losa: avanza de un extremo al otro
    const pour = span(p, 0.62, 0.95);
    for (const slab of slabs.current) {
      if (!slab) continue;
      slab.visible = pour > 0;
      slab.scale.x = Math.max(pit.x * 2 * pour, 1e-4);
    }
    if (water.current) water.current.visible = build.action(STEP);
  });

  return (
    <group>
      <Blocks boxes={parts.fill} material={materials.fill} grow={() => span(build.stage(STEP), 0, 0.22)} receiveShadow />
      <mesh ref={main} geometry={PIPE_X} material={materials.pvc} position={[pipeStart, PIPE_Y, 0]} visible={false} />
      <mesh ref={branch} geometry={PIPE_Z} material={materials.pvc} position={[cx, PIPE_Y, 0]} visible={false} />
      <Blocks boxes={parts.chamber} material={materials.concrete} grow={() => span(build.stage(STEP), 0.3, 0.45)} castShadow receiveShadow />
      <Blocks boxes={parts.grates} material={materials.grate} grow={() => (build.stage(STEP) >= 0.95 ? 1 : 0)} />
      <Blocks
        boxes={parts.mesh}
        material={materials.rebar}
        reveal={() => (build.current() === STEP ? span(build.stage(STEP), 0.42, 0.62) : 0)}
      />

      {/* Dos mitades con pendiente hacia el eje: el agua corre a los sumideros */}
      {[-1, 1].map((side, i) => (
        <group key={side} position={[-pit.x, LEVEL.slab, 0]} rotation-x={side * -Math.atan(FALL / pit.z)}>
          <mesh
            ref={(el) => {
              slabs.current[i] = el;
            }}
            geometry={SLAB_HALF}
            material={materials.concrete}
            scale={[1, 1, side * pit.z]}
            visible={false}
            receiveShadow
          />
        </group>
      ))}

      <group ref={water} visible={false}>
        <Rain layout={layout} />
        <WaterFlow layout={layout} />
      </group>
    </group>
  );
}
