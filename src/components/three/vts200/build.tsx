"use client";

import { createContext, useContext, useLayoutEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { Box } from "./model";

/**
 * Avance de la obra. Cada pieza de la escena se construye según el avance (0 a 1) del paso al que
 * pertenece y lo lee en cada cuadro, sin re-renderizar React.
 */
export type Build = {
  /** 1 si el paso ya pasó, 0 si no llegó, el avance actual si es el paso en curso */
  stage: (step: number) => number;
  /** La acción del paso (estratos, armadura, lluvia, empuje) está activa y es el paso en curso */
  action: (step: number) => boolean;
  current: () => number;
};

export const BuildContext = createContext<Build | null>(null);

export function useBuild() {
  const build = useContext(BuildContext);
  if (!build) throw new Error("useBuild fuera de la escena VTS200");
  return build;
}

/** Tramo [from, to] del avance, llevado a 0..1 */
export const span = (p: number, from: number, to: number) => THREE.MathUtils.clamp((p - from) / (to - from), 0, 1);

export const easeOut = (t: number) => 1 - (1 - t) ** 3;

/** Números aleatorios repetibles (mulberry32): la escena se ve igual en cada visita y captura */
export function random(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ─── Cajas instanciadas ────────────────────────────────────────────────── */

// Caja unitaria apoyada en su base: cada instancia la escala a su medida
const UNIT_BOX = new THREE.BoxGeometry(1, 1, 1).translate(0, 0.5, 0);
const dummy = new THREE.Object3D();

/**
 * Cajas de un mismo material en una sola llamada de dibujo.
 * - `grow(i)`: cada caja crece desde su base (0 = oculta, 1 = completa).
 * - `reveal()`: las cajas aparecen de a una, en orden (armaduras).
 */
export function Blocks({
  boxes,
  material,
  grow,
  reveal,
  castShadow,
  receiveShadow,
}: {
  boxes: Box[];
  material: THREE.Material;
  grow?: (i: number) => number;
  reveal?: () => number;
  castShadow?: boolean;
  receiveShadow?: boolean;
}) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const last = useMemo(() => new Float32Array(boxes.length).fill(Number.NaN), [boxes]);

  useLayoutEffect(() => {
    const m = mesh.current;
    if (!m) return;
    boxes.forEach((b, i) => {
      dummy.position.set(b.x, b.y, b.z);
      dummy.scale.set(b.w, b.h, b.d);
      dummy.updateMatrix();
      m.setMatrixAt(i, dummy.matrix);
    });
    m.instanceMatrix.needsUpdate = true;
    last.fill(Number.NaN);
  }, [boxes, last]);

  useFrame(() => {
    const m = mesh.current;
    if (!m) return;
    if (reveal) {
      m.count = Math.round(boxes.length * reveal());
      m.visible = m.count > 0;
    }
    if (!grow) return;

    let visible = false;
    let changed = false;
    boxes.forEach((b, i) => {
      const t = grow(i);
      if (t > 0) visible = true;
      if (last[i] === t) return;
      last[i] = t;
      changed = true;
      dummy.position.set(b.x, b.y, b.z);
      // Oculta: tamaño nulo en las tres medidas (aplanada seguiría proyectando la sombra de su base)
      if (t > 0) dummy.scale.set(b.w, b.h * t, b.d);
      else dummy.scale.setScalar(1e-5);
      dummy.updateMatrix();
      m.setMatrixAt(i, dummy.matrix);
    });
    if (changed) m.instanceMatrix.needsUpdate = true;
    m.visible = visible;
  });

  return (
    <instancedMesh
      // Otra cantidad de cajas (otro largo de báscula) crea una malla nueva
      key={boxes.length}
      ref={mesh}
      args={[UNIT_BOX, material, boxes.length]}
      castShadow={castShadow}
      receiveShadow={receiveShadow}
      frustumCulled={false}
      dispose={null}
    />
  );
}

/**
 * Barras de una armadura entre dos puntos (cajas delgadas). Solo ejes x, y o z: alcanza para
 * parrillas, estribos y barras longitudinales.
 */
export function bar(from: [number, number, number], to: [number, number, number], thickness = 0.022): Box {
  const [x0, y0, z0] = from;
  const [x1, y1, z1] = to;
  const w = Math.abs(x1 - x0) || thickness;
  const h = Math.abs(y1 - y0) || thickness;
  const d = Math.abs(z1 - z0) || thickness;
  return { x: (x0 + x1) / 2, y: Math.min(y0, y1) - (y0 === y1 ? thickness / 2 : 0), z: (z0 + z1) / 2, w, h, d };
}
