"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Blocks, span, useBuild } from "./build";
import { fadeTo, type Materials } from "./materials";
import { APPROACH_LENGTH, FRONT_WALL, LEVEL, SIDE_WALL, WIDTH, type Box, type Layout } from "./model";

const STEP = 4;
const EDGE = 0.06;
const APPROACH_SLAB = 0.2;
/** Las losas de acceso sobresalen apenas del suelo para no superponerse con él */
const APPROACH_TOP = 0.01;
const ROAD_LENGTH = 70;

/* ─── Empuje del suelo: crece con la profundidad (distribución triangular) ─ */

const DEPTHS = [0.1, 0.28, 0.46, 0.64];
const HEAD = 0.1;

function EarthPressure({ layout, materials }: { layout: Layout; materials: Materials }) {
  const build = useBuild();
  const group = useRef<THREE.Group>(null);
  const shafts = useRef<THREE.InstancedMesh>(null);
  const heads = useRef<THREE.InstancedMesh>(null);
  const { half, pit } = layout;

  const arrows = useMemo(() => {
    const face = pit.z + SIDE_WALL;
    const columns = Array.from({ length: 6 }, (_, i) => -half + 1.5 + (i * (half * 2 - 3)) / 5);
    return [-1, 1].flatMap((side) =>
      columns.flatMap((x) =>
        DEPTHS.map((depth) => ({ x, y: -depth, side, face, length: 0.15 + (0.6 * depth) / -LEVEL.fill }))
      )
    );
  }, [half, pit.z]);

  useLayoutEffect(() => {
    const dummy = new THREE.Object3D();
    arrows.forEach(({ x, y, side, face, length }, i) => {
      // Las flechas apuntan hacia el muro (de afuera hacia el foso)
      dummy.rotation.set(-side * (Math.PI / 2), 0, 0);
      dummy.position.set(x, y, side * (face + HEAD + (length - HEAD) / 2));
      dummy.scale.set(1, length - HEAD, 1);
      dummy.updateMatrix();
      shafts.current?.setMatrixAt(i, dummy.matrix);
      dummy.position.set(x, y, side * (face + HEAD / 2));
      dummy.scale.set(1, 1, 1);
      dummy.updateMatrix();
      heads.current?.setMatrixAt(i, dummy.matrix);
    });
    if (shafts.current) shafts.current.instanceMatrix.needsUpdate = true;
    if (heads.current) heads.current.instanceMatrix.needsUpdate = true;
  }, [arrows]);

  useFrame(() => {
    if (group.current) group.current.visible = build.action(STEP);
  });

  return (
    <group ref={group} visible={false}>
      <instancedMesh key={`s${arrows.length}`} ref={shafts} args={[undefined, materials.signal, arrows.length]} frustumCulled={false}>
        <cylinderGeometry args={[0.022, 0.022, 1, 8]} />
      </instancedMesh>
      <instancedMesh key={`h${arrows.length}`} ref={heads} args={[undefined, materials.signal, arrows.length]} frustumCulled={false}>
        <coneGeometry args={[0.06, HEAD, 12]} />
      </instancedMesh>
    </group>
  );
}

/**
 * Muros de contención a los lados del foso y muros frontales en los extremos; luego se rellena
 * por fuera hasta el nivel del terreno y se vacían las losas de acceso.
 */
export function Walls({ layout, materials }: { layout: Layout; materials: Materials }) {
  const build = useBuild();
  const { pit, dig } = layout;

  const parts = useMemo(() => {
    const height = -LEVEL.fill;
    const sideWalls: Box[] = [-1, 1].map((s) => ({
      x: 0,
      y: LEVEL.fill,
      z: s * (pit.z + SIDE_WALL / 2),
      w: (pit.x + FRONT_WALL) * 2,
      h: height,
      d: SIDE_WALL,
    }));
    const frontWalls: Box[] = [-1, 1].map((s) => ({
      x: s * (pit.x + FRONT_WALL / 2),
      y: LEVEL.fill,
      z: 0,
      w: FRONT_WALL,
      h: height,
      d: pit.z * 2,
    }));
    // Perfiles de acero en el borde superior del foso
    const edges: Box[] = [
      ...[-1, 1].map((s) => ({ x: 0, y: -EDGE, z: s * (pit.z + EDGE / 2), w: pit.x * 2, h: EDGE, d: EDGE })),
      ...[-1, 1].map((s) => ({ x: s * (pit.x + EDGE / 2), y: -EDGE, z: 0, w: EDGE, h: EDGE, d: pit.z * 2 })),
    ];
    const outerZ = pit.z + SIDE_WALL;
    const outerX = pit.x + FRONT_WALL;
    const backfill: Box[] = [
      ...[-1, 1].map((s) => ({ x: 0, y: LEVEL.fill, z: s * ((outerZ + dig.z) / 2), w: dig.x * 2, h: height, d: dig.z - outerZ })),
      ...[-1, 1].map((s) => ({ x: s * ((outerX + dig.x) / 2), y: LEVEL.fill, z: 0, w: dig.x - outerX, h: height, d: outerZ * 2 })),
    ];
    const approaches: Box[] = [-1, 1].map((s) => ({
      x: s * (outerX + APPROACH_LENGTH / 2),
      y: APPROACH_TOP - APPROACH_SLAB,
      z: 0,
      w: APPROACH_LENGTH,
      h: APPROACH_SLAB,
      d: WIDTH + 0.4,
    }));
    // Camino de entrada y salida de los camiones, a continuación de las losas de acceso
    const roadStart = outerX + APPROACH_LENGTH;
    const roads: Box[] = [-1, 1].map((s) => ({
      x: s * (roadStart + ROAD_LENGTH / 2),
      y: -0.004,
      z: 0,
      w: ROAD_LENGTH,
      h: 0.01,
      d: WIDTH + 1.2,
    }));
    return { sideWalls, frontWalls, edges, backfill, approaches, roads };
  }, [dig.x, dig.z, pit.x, pit.z]);

  // Con el empuje a la vista, el relleno se vuelve transparente
  useFrame((_, dt) => fadeTo(materials.fill, build.action(STEP) ? 0.3 : 1, dt));

  const p = () => build.stage(STEP);

  return (
    <group>
      <Blocks boxes={parts.sideWalls} material={materials.concrete} grow={() => span(p(), 0, 0.4)} castShadow receiveShadow />
      <Blocks boxes={parts.frontWalls} material={materials.concrete} grow={() => span(p(), 0.2, 0.55)} castShadow receiveShadow />
      <Blocks boxes={parts.edges} material={materials.edge} grow={() => span(p(), 0.5, 0.6)} />
      <Blocks boxes={parts.backfill} material={materials.fill} grow={() => span(p(), 0.5, 0.8)} receiveShadow />
      <Blocks boxes={parts.approaches} material={materials.concrete} grow={() => span(p(), 0.75, 1)} castShadow receiveShadow />
      <Blocks boxes={parts.roads} material={materials.asphalt} grow={() => (p() >= 0.95 ? 1 : 0)} receiveShadow />
      <EarthPressure layout={layout} materials={materials} />
    </group>
  );
}
