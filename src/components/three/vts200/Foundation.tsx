"use client";

import { useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Blocks, bar, span, useBuild } from "./build";
import { fadeTo, type Materials } from "./materials";
import { CELL_Z, FOOTING, LEVEL, PEDESTAL, TIE_BEAM, type Box, type Layout } from "./model";

const STEP = 2;
const PANEL = 0.03;
const COVER = 0.06;

/** Tableros de encofrado alrededor de una pieza (solo los lados largos en las vigas) */
function formwork(b: Box, sides: "all" | "x" | "z"): Box[] {
  const h = b.h + 0.05;
  const panels: Box[] = [];
  if (sides !== "z")
    panels.push(
      { x: b.x, y: b.y, z: b.z - b.d / 2 - PANEL / 2, w: b.w, h, d: PANEL },
      { x: b.x, y: b.y, z: b.z + b.d / 2 + PANEL / 2, w: b.w, h, d: PANEL }
    );
  if (sides !== "x")
    panels.push(
      { x: b.x - b.w / 2 - PANEL / 2, y: b.y, z: b.z, w: PANEL, h, d: b.d + PANEL * 2 },
      { x: b.x + b.w / 2 + PANEL / 2, y: b.y, z: b.z, w: PANEL, h, d: b.d + PANEL * 2 }
    );
  return panels;
}

/** Estribos (anillos de 4 barras) a lo largo de una pieza, en planos perpendiculares a `axis` */
function stirrups(b: Box, axis: "x" | "y" | "z", spacing: number): Box[] {
  const bars: Box[] = [];
  const [x0, x1] = [b.x - b.w / 2 + COVER, b.x + b.w / 2 - COVER];
  const [y0, y1] = [b.y + COVER, b.y + b.h - COVER];
  const [z0, z1] = [b.z - b.d / 2 + COVER, b.z + b.d / 2 - COVER];
  const range = axis === "x" ? [x0, x1] : axis === "y" ? [y0, y1] : [z0, z1];
  for (let s = range[0]; s <= range[1] + 1e-6; s += spacing) {
    if (axis === "x")
      bars.push(bar([s, y0, z0], [s, y1, z0]), bar([s, y0, z1], [s, y1, z1]), bar([s, y0, z0], [s, y0, z1]), bar([s, y1, z0], [s, y1, z1]));
    else if (axis === "z")
      bars.push(bar([x0, y0, s], [x0, y1, s]), bar([x1, y0, s], [x1, y1, s]), bar([x0, y0, s], [x1, y0, s]), bar([x0, y1, s], [x1, y1, s]));
    else
      bars.push(bar([x0, s, z0], [x1, s, z0]), bar([x0, s, z1], [x1, s, z1]), bar([x0, s, z0], [x0, s, z1]), bar([x1, s, z0], [x1, s, z1]));
  }
  return bars;
}

/** Barras longitudinales en las cuatro esquinas de una pieza */
function longitudinal(b: Box, axis: "x" | "y" | "z", extend = 0): Box[] {
  const [x0, x1] = [b.x - b.w / 2 + COVER, b.x + b.w / 2 - COVER];
  const [y0, y1] = [b.y + COVER, b.y + b.h - COVER];
  const [z0, z1] = [b.z - b.d / 2 + COVER, b.z + b.d / 2 - COVER];
  if (axis === "x")
    return [y0, y1].flatMap((y) => [z0, z1].map((z) => bar([x0 - extend, y, z], [x1 + extend, y, z])));
  if (axis === "z")
    return [y0, y1].flatMap((y) => [x0, x1].map((x) => bar([x, y, z0 - extend], [x, y, z1 + extend])));
  return [x0, x1].flatMap((x) => [z0, z1].map((z) => bar([x, y0, z], [x, y1, z])));
}

/** Parrilla inferior de una zapata */
function grid(b: Box, count: number): Box[] {
  const y = b.y + COVER;
  const bars: Box[] = [];
  for (let i = 0; i < count; i++) {
    const t = i / (count - 1);
    const x = b.x - b.w / 2 + COVER + t * (b.w - COVER * 2);
    const z = b.z - b.d / 2 + COVER + t * (b.d - COVER * 2);
    bars.push(bar([x, y, b.z - b.d / 2 + COVER], [x, y, b.z + b.d / 2 - COVER]));
    bars.push(bar([b.x - b.w / 2 + COVER, y, z], [b.x + b.w / 2 - COVER, y, z]));
  }
  return bars;
}

/**
 * Zapatas arriostradas: una zapata con su pedestal bajo cada celda, unidas por vigas de amarre
 * a lo largo de cada lado y en cada línea de apoyo. Se arman, se encofran y se hormigonan.
 */
export function Foundation({ layout, materials }: { layout: Layout; materials: Materials }) {
  const build = useBuild();
  const { cells, supports } = layout;

  const parts = useMemo(() => {
    const footings: Box[] = cells.map((c) => ({
      x: c.x,
      y: LEVEL.bottom,
      z: c.z,
      w: FOOTING.size,
      h: FOOTING.height,
      d: FOOTING.size,
    }));
    const pedestals: Box[] = cells.map((c) => ({
      x: c.x,
      y: LEVEL.footing,
      z: c.z,
      w: PEDESTAL,
      h: LEVEL.pier - LEVEL.footing,
      d: PEDESTAL,
    }));
    const along: Box[] = [-1, 1].flatMap((side) =>
      supports.slice(1).map((x1, i) => {
        const x0 = supports[i];
        const length = x1 - x0 - FOOTING.size;
        return { x: (x0 + x1) / 2, y: LEVEL.bottom, z: side * CELL_Z, w: length, h: FOOTING.height, d: TIE_BEAM };
      })
    );
    const across: Box[] = supports.map((x) => ({
      x,
      y: LEVEL.bottom,
      z: 0,
      w: TIE_BEAM,
      h: FOOTING.height,
      d: CELL_Z * 2 - FOOTING.size,
    }));

    const rebar = [
      ...footings.flatMap((f) => grid(f, 5)),
      ...pedestals.flatMap((p) => [...longitudinal(p, "y"), ...stirrups(p, "y", 0.15)]),
      ...along.flatMap((b) => [...longitudinal(b, "x", 0.3), ...stirrups(b, "x", 0.25)]),
      ...across.flatMap((b) => [...longitudinal(b, "z", 0.3), ...stirrups(b, "z", 0.25)]),
    ];
    const forms = [
      ...footings.flatMap((f) => formwork(f, "all")),
      ...pedestals.flatMap((p) => formwork(p, "all")),
      ...along.flatMap((b) => formwork(b, "x")),
      ...across.flatMap((b) => formwork(b, "z")),
    ];
    return { footings, pedestals, beams: [...along, ...across], rebar, forms };
  }, [cells, supports]);

  // Vista de armadura: el hormigón se vuelve transparente
  useFrame((_, dt) => fadeTo(materials.footing, build.action(STEP) ? 0.22 : 1, dt));

  const p = () => build.stage(STEP);

  return (
    <group>
      <Blocks
        boxes={parts.rebar}
        material={materials.rebar}
        reveal={() => (build.current() === STEP ? span(p(), 0, 0.3) : 0)}
      />
      <Blocks
        boxes={parts.forms}
        material={materials.formwork}
        grow={() => span(p(), 0.18, 0.4) * (1 - span(p(), 0.88, 1))}
        castShadow
      />
      <Blocks boxes={parts.footings} material={materials.footing} grow={() => span(p(), 0.42, 0.58)} castShadow receiveShadow />
      <Blocks boxes={parts.beams} material={materials.footing} grow={() => span(p(), 0.5, 0.66)} castShadow receiveShadow />
      <Blocks boxes={parts.pedestals} material={materials.footing} grow={() => span(p(), 0.62, 0.84)} castShadow receiveShadow />
    </group>
  );
}
