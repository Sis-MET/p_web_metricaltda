"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Line } from "@react-three/drei";
import * as THREE from "three";
import { Blocks, random, span, useBuild } from "./build";
import { COLORS, type Materials } from "./materials";
import { LEVEL, WIDTH, type Box, type Layout } from "./model";

/* ─── Suelo: entorno con la obra recortada y la obra con el foso recortado ─ */

type Rect = { x0: number; x1: number; z0: number; z1: number };

// La forma se dibuja en el plano XY y se acuesta: (x, y) pasa a (x, 0, -y)
const toPath = (path: THREE.Path, { x0, x1, z0, z1 }: Rect) =>
  path.moveTo(x0, -z0).lineTo(x1, -z0).lineTo(x1, -z1).lineTo(x0, -z1).closePath();

/** Plano horizontal, con un hueco opcional; sus coordenadas de textura quedan en metros */
function plane(outer: Rect, hole?: Rect) {
  const shape = toPath(new THREE.Shape(), outer) as THREE.Shape;
  if (hole) shape.holes.push(toPath(new THREE.Path(), hole));
  return new THREE.ShapeGeometry(shape).rotateX(-Math.PI / 2);
}

/* ─── Vegetación y piedras: se retiran solo dentro del área de trabajo ──── */

/** `clear`: avance del paso 1 en el que empieza a retirarse; sin él, queda (fuera de la obra) */
type Item = { position: THREE.Vector3; scale: THREE.Vector3; rotation: number; clear?: number };

const dummy = new THREE.Object3D();

function Scatter({ items, geometry, material }: { items: Item[]; geometry: THREE.BufferGeometry; material: THREE.Material }) {
  const build = useBuild();
  const mesh = useRef<THREE.InstancedMesh>(null);
  const last = useRef(Number.NaN);
  // Otro largo de báscula mueve las instancias: hay que volver a ubicarlas
  useEffect(() => {
    last.current = Number.NaN;
  }, [items]);

  useFrame(() => {
    const m = mesh.current;
    const p = build.stage(0);
    if (!m || p === last.current) return;
    last.current = p;
    items.forEach((item, i) => {
      const k = item.clear === undefined ? 1 : 1 - span(p, item.clear, item.clear + 0.15);
      dummy.position.copy(item.position);
      dummy.scale.copy(item.scale).multiplyScalar(Math.max(k, 1e-4));
      dummy.rotation.set(0, item.rotation, 0);
      dummy.updateMatrix();
      m.setMatrixAt(i, dummy.matrix);
    });
    m.instanceMatrix.needsUpdate = true;
  });

  return <instancedMesh key={items.length} ref={mesh} args={[geometry, material, items.length]} castShadow frustumCulled={false} />;
}

const GEOMETRIES = {
  grass: new THREE.ConeGeometry(0.16, 0.36, 5).translate(0, 0.18, 0),
  rock: new THREE.DodecahedronGeometry(0.2),
  mound: new THREE.SphereGeometry(1, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2),
};

function Vegetation({ layout, materials }: { layout: Layout; materials: Materials }) {
  const { site, work } = layout;

  const { grass, rocks, mounds } = useMemo(() => {
    const rand = random(7);
    const inWork = (x: number, z: number) => Math.abs(x) < work.x && z > work.z0 && z < work.z1;
    // La limpieza avanza de un extremo al otro del área de trabajo
    const clearAt = (x: number) => 0.4 * ((x + work.x) / (work.x * 2));

    const make = (count: number, size: () => [number, number, number], { y = 0, onlyWork = false } = {}): Item[] => {
      const items: Item[] = [];
      while (items.length < count) {
        const x = (rand() - 0.5) * (site.x * 2 - 1);
        const z = site.z0 + 0.5 + rand() * (site.z1 - site.z0 - 1);
        const inside = inWork(x, z);
        // Ni sobre el camino de los camiones ni (los montículos) fuera de la obra
        if ((!inside && Math.abs(z) < 2.6) || (onlyWork && !inside)) continue;
        items.push({
          position: new THREE.Vector3(x, y, z),
          scale: new THREE.Vector3(...size()),
          rotation: rand() * Math.PI * 2,
          clear: inside ? clearAt(x) : undefined,
        });
      }
      return items;
    };

    return {
      grass: make(320, () => {
        const s = 0.6 + rand() * 0.8;
        return [s, s * (0.8 + rand() * 0.6), s];
      }),
      rocks: make(45, () => {
        const s = 0.5 + rand() * 0.9;
        return [s * 1.3, s * 0.7, s];
      }, { y: 0.04 }),
      mounds: make(5, () => [1.6 + rand() * 1.6, 0.28 + rand() * 0.18, 1.2 + rand() * 1.2], { onlyWork: true }),
    };
  }, [site.x, site.z0, site.z1, work.x, work.z0, work.z1]);

  return (
    <group>
      <Scatter items={grass} geometry={GEOMETRIES.grass} material={materials.grass} />
      <Scatter items={rocks} geometry={GEOMETRIES.rock} material={materials.rock} />
      <Scatter items={mounds} geometry={GEOMETRIES.mound} material={materials.terrain} />
    </group>
  );
}

/* ─── Replanteo: camillas e hilos que marcan la plataforma ──────────────── */

const STRING_Y = 0.72;

function Staking({ layout, materials }: { layout: Layout; materials: Materials }) {
  const build = useBuild();
  const strings = useRef<THREE.Group>(null);
  const { half, dig } = layout;
  const endX = dig.x + 1.3;
  const sideZ = dig.z + 1.3;

  const boards = useMemo(() => {
    const board = (x: number, z: number, alongZ: boolean, length: number): Box[] => {
      const [dx, dz] = alongZ ? [0, length / 2] : [length / 2, 0];
      return [
        { x: x - dx, y: 0, z: z - dz, w: 0.07, h: 0.9, d: 0.07 },
        { x: x + dx, y: 0, z: z + dz, w: 0.07, h: 0.9, d: 0.07 },
        { x, y: 0.62, z, w: alongZ ? 0.04 : length + 0.1, h: 0.14, d: alongZ ? length + 0.1 : 0.04 },
      ];
    };
    return [
      ...board(-endX, 0, true, WIDTH + 1.2),
      ...board(endX, 0, true, WIDTH + 1.2),
      ...[-1, 1].flatMap((side) => [...board(-half, side * sideZ, false, 1.2), ...board(half, side * sideZ, false, 1.2)]),
    ];
  }, [endX, half, sideZ]);

  // Visibles durante la preparación; desde las zapatas mandan los niveles del foso
  const shown = () => (build.current() <= 1 ? 1 : 0);

  useFrame(() => {
    if (strings.current) strings.current.visible = shown() > 0 && span(build.stage(0), 0.8, 0.95) > 0;
  });

  const lines: [number, number, number][][] = [
    ...[-1, 1].map((s) => [
      [-endX, STRING_Y, (s * WIDTH) / 2],
      [endX, STRING_Y, (s * WIDTH) / 2],
    ]),
    ...[-1, 1].map((s) => [
      [s * half, STRING_Y, -sideZ],
      [s * half, STRING_Y, sideZ],
    ]),
  ] as [number, number, number][][];

  return (
    <group>
      <Blocks
        boxes={boards}
        material={materials.wood}
        grow={(i) => shown() * span(build.stage(0), 0.55 + (i % 9) * 0.015, 0.8)}
        castShadow
      />
      <group ref={strings} visible={false}>
        {lines.map((points, i) => (
          <Line key={i} points={points} color={COLORS.signal} lineWidth={1.4} />
        ))}
      </group>
    </group>
  );
}

/* ─── Topografía: nivel, mira y puntos de control ───────────────────────── */

const EYE = 1.45;
const UP = new THREE.Vector3(0, 1, 0);

function Survey({ layout, materials }: { layout: Layout; materials: Materials }) {
  const build = useBuild();
  const group = useRef<THREE.Group>(null);
  const rod = useRef<THREE.Group>(null);
  const sight = useRef<THREE.Mesh>(null);
  const { half, dig, spots } = layout;
  const [lx, , lz] = spots.level;

  const route = useMemo(
    () =>
      [
        [-half, dig.z + 0.5],
        [half, dig.z + 0.5],
        [half, -dig.z - 0.5],
        [-half, -dig.z - 0.5],
      ].map(([x, z]) => new THREE.Vector3(x, 0, z)),
    [dig.z, half]
  );
  const markers = useMemo<Box[]>(() => route.map((v) => ({ x: v.x + 0.3, y: 0, z: v.z, w: 0.05, h: 0.4, d: 0.05 })), [route]);
  const legs = useMemo(
    () =>
      [0, 1, 2].map((i) => {
        const angle = (i / 3) * Math.PI * 2;
        const foot = new THREE.Vector3(Math.cos(angle) * 0.45, 0, Math.sin(angle) * 0.45);
        const top = new THREE.Vector3(0, 1.25, 0);
        const mid = foot.clone().add(top).multiplyScalar(0.5);
        const quaternion = new THREE.Quaternion().setFromUnitVectors(UP, top.clone().sub(foot).normalize());
        return { mid, quaternion, length: top.distanceTo(foot) };
      }),
    []
  );

  const p = () => span(build.stage(1), 0, 0.3) * (route.length - 1);
  const eye = useMemo(() => new THREE.Vector3(lx, EYE, lz), [lx, lz]);
  const target = useRef(new THREE.Vector3());

  useFrame(() => {
    const visible = build.current() === 1;
    if (group.current) group.current.visible = visible;
    if (!visible || !rod.current || !sight.current) return;

    const t = p();
    const i = Math.min(Math.floor(t), route.length - 2);
    rod.current.position.lerpVectors(route[i], route[i + 1], t - i);

    // Visual horizontal del nivel hasta la mira
    const to = target.current.copy(rod.current.position).setY(EYE);
    sight.current.position.copy(eye).add(to).multiplyScalar(0.5);
    sight.current.scale.set(1, eye.distanceTo(to), 1);
    sight.current.quaternion.setFromUnitVectors(UP, to.sub(eye).normalize());
  });

  return (
    <group ref={group} visible={false}>
      <group position={[lx, 0, lz]}>
        {legs.map((leg, i) => (
          <mesh key={i} material={materials.tripod} position={leg.mid} quaternion={leg.quaternion} castShadow>
            <cylinderGeometry args={[0.02, 0.025, leg.length, 6]} />
          </mesh>
        ))}
        <mesh material={materials.tripod} position={[0, 1.27, 0]}>
          <cylinderGeometry args={[0.12, 0.12, 0.04, 16]} />
        </mesh>
        <mesh material={materials.instrument} position={[0, 1.37, 0]} castShadow>
          <boxGeometry args={[0.2, 0.16, 0.16]} />
        </mesh>
        <mesh material={materials.dark} position={[0, EYE, 0]} rotation-z={Math.PI / 2}>
          <cylinderGeometry args={[0.035, 0.045, 0.3, 12]} />
        </mesh>
      </group>
      <group ref={rod}>
        <mesh material={materials.rod} position={[0, 1.5, 0]} castShadow>
          <boxGeometry args={[0.06, 3, 0.03]} />
        </mesh>
      </group>
      <mesh ref={sight} material={materials.signal}>
        <cylinderGeometry args={[0.012, 0.012, 1, 6]} />
      </mesh>
      <Blocks
        boxes={markers}
        material={materials.signal}
        grow={(i) => (build.current() === 1 ? (p() >= i ? 1 : 0) : 0)}
      />
    </group>
  );
}

/* ─── Excavación y montículo de tierra ──────────────────────────────────── */

function Excavation({ layout, materials }: { layout: Layout; materials: Materials }) {
  const build = useBuild();
  const floor = useRef<THREE.Mesh>(null);
  const walls = useRef<THREE.Group>(null);
  const pile = useRef<THREE.Mesh>(null);
  const { dig, spots } = layout;
  const depth = -LEVEL.bottom;
  const floorGeometry = useMemo(() => plane({ x0: -dig.x, x1: dig.x, z0: -dig.z, z1: dig.z }), [dig.x, dig.z]);

  // Taludes mirando hacia el foso
  const sides = useMemo<{ position: [number, number, number]; rotation: number; length: number }[]>(
    () => [
      { position: [0, -depth / 2, -dig.z], rotation: 0, length: dig.x * 2 },
      { position: [0, -depth / 2, dig.z], rotation: Math.PI, length: dig.x * 2 },
      { position: [-dig.x, -depth / 2, 0], rotation: Math.PI / 2, length: dig.z * 2 },
      { position: [dig.x, -depth / 2, 0], rotation: -Math.PI / 2, length: dig.z * 2 },
    ],
    [depth, dig.x, dig.z]
  );

  useFrame(() => {
    const dug = span(build.stage(1), 0.3, 1);
    if (floor.current) {
      floor.current.position.y = -0.001 - depth * dug;
      // Antes de excavar, el fondo es el mismo terreno de la obra
      floor.current.material = dug > 0 ? materials.dig : materials.site;
    }
    if (walls.current) walls.current.visible = dug > 0;
    if (pile.current) {
      const size = dug * (1 - span(build.stage(4), 0.5, 0.8));
      pile.current.visible = size > 0;
      pile.current.scale.set(2.6 * size, 1.3 * size, 1.9 * size);
    }
  });

  return (
    <group>
      <mesh ref={floor} geometry={floorGeometry} receiveShadow />
      <group ref={walls} visible={false}>
        {sides.map((side, i) => (
          <mesh key={i} material={materials.strata} position={side.position} rotation-y={side.rotation} receiveShadow>
            <planeGeometry args={[side.length, depth]} />
          </mesh>
        ))}
      </group>
      <mesh ref={pile} material={materials.pile} position={spots.pile} castShadow receiveShadow visible={false}>
        <sphereGeometry args={[1, 24, 10, 0, Math.PI * 2, 0, Math.PI / 2]} />
      </mesh>
    </group>
  );
}

/* ─── Conjunto ──────────────────────────────────────────────────────────── */

export function Site({ layout, materials }: { layout: Layout; materials: Materials }) {
  const build = useBuild();
  const { site, work, dig } = layout;

  // Entorno con el terreno recortado, terreno con el área de trabajo recortada y esta con el foso
  const geometries = useMemo(() => {
    const plot = { x0: -site.x, x1: site.x, z0: site.z0, z1: site.z1 };
    const area = { x0: -work.x, x1: work.x, z0: work.z0, z1: work.z1 };
    return {
      ground: plane({ x0: -120, x1: 120, z0: -120, z1: 120 }, plot),
      plot: plane(plot, area),
      work: plane(area, { x0: -dig.x, x1: dig.x, z0: -dig.z, z1: dig.z }),
    };
  }, [dig.x, dig.z, site.x, site.z0, site.z1, work.x, work.z0, work.z1]);

  // El área de trabajo pasa de terreno natural a limpio y compactado
  useFrame(() => {
    materials.site.color.lerpColors(COLORS.natural, COLORS.cleared, span(build.stage(0), 0.1, 0.55));
  });

  return (
    <group>
      <mesh geometry={geometries.ground} material={materials.ground} receiveShadow />
      <mesh geometry={geometries.plot} material={materials.terrain} receiveShadow />
      <mesh geometry={geometries.work} material={materials.site} receiveShadow />
      <Vegetation layout={layout} materials={materials} />
      <Staking layout={layout} materials={materials} />
      <Survey layout={layout} materials={materials} />
      <Excavation layout={layout} materials={materials} />
    </group>
  );
}
