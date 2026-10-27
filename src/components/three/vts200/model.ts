// Báscula VTS200 en foso poco profundo (metros y kg): la plataforma queda al nivel del suelo (y = 0).
// Lo comparten la escena 3D y la interfaz del demo. Las cotas de obra civil son ilustrativas:
// en cada proyecto salen del estudio de suelos y del cálculo estructural.

import { VTS200, type ScaleSize } from "@/content/truckScaleProject";
import type { Vec3, View } from "../useResponsiveFraming";

export const WIDTH = VTS200.width;
export const DECK_THICKNESS = 0.3;

/** Cotas de obra (y) */
export const LEVEL = {
  /** Cara superior de los pedestales: la plataforma instalada mide 41 cm con sus celdas */
  pier: -0.41,
  slab: -0.6,
  /** Relleno compactado bajo la losa */
  fill: -0.75,
  footing: -1.05,
  /** Fondo de excavación */
  bottom: -1.4,
};

export const GAP = 0.05;
export const SIDE_WALL = 0.25;
export const FRONT_WALL = 0.3;
const WORK_MARGIN = 0.8;
const END_INSET = 0.35;
export const CELL_Z = WIDTH / 2 - 0.35;

export const FOOTING = { size: 1.1, height: LEVEL.footing - LEVEL.bottom };
export const PEDESTAL = 0.45;
export const TIE_BEAM = 0.3;
export const APPROACH_LENGTH = 4;

export type Cell = { id: string; x: number; z: number; support: number };

/** Dimensiones de una caja apoyada en su base: centro en planta (x, z), base (y) y medidas */
export type Box = { x: number; y: number; z: number; w: number; h: number; d: number };

export type Layout = {
  size: ScaleSize;
  half: number;
  modules: { x: number; length: number }[];
  /** Líneas de apoyo: una celda a cada lado */
  supports: number[];
  cells: Cell[];
  /** Medias medidas interiores del foso (caras de los muros) */
  pit: { x: number; z: number };
  /** Medias medidas de la excavación */
  dig: { x: number; z: number };
  /** Terreno con vegetación alrededor de la obra */
  site: { x: number; z0: number; z1: number };
  /** Área de trabajo que se limpia y se nivela */
  work: { x: number; z0: number; z1: number };
  /** Instrumento topográfico, montículo de tierra, caseta y cámara de drenaje */
  spots: Record<"level" | "pile" | "booth" | "chamber", Vec3>;
};

export function layoutFor(size: ScaleSize): Layout {
  const half = size.length / 2;
  let start = -half;
  const modules = size.modules.map((length) => {
    const x = start + length / 2;
    start += length;
    return { x, length };
  });
  const joints = modules.slice(1).map((m) => m.x - m.length / 2);
  const supports = [-half + END_INSET, ...joints, half - END_INSET];
  const cells = supports.flatMap((x, support) =>
    [-1, 1].map((side, k) => ({ id: `C${support * 2 + k + 1}`, x, z: side * CELL_Z, support }))
  );
  const pit = { x: half + GAP, z: WIDTH / 2 + GAP };
  const dig = { x: pit.x + FRONT_WALL + WORK_MARGIN, z: pit.z + SIDE_WALL + WORK_MARGIN };

  return {
    size,
    half,
    modules,
    supports,
    cells,
    pit,
    dig,
    site: { x: half + 10, z0: -dig.z - 9, z1: dig.z + 7 },
    work: { x: half + 5.5, z0: -dig.z - 5.6, z1: dig.z + 2.8 },
    spots: {
      level: [-dig.x - 2.4, 0, 4.6],
      pile: [-half * 0.25, 0, -dig.z - 3.2],
      booth: [half + 1, 0, -dig.z - 3.4],
      chamber: [half - 0.9, 0, pit.z + SIDE_WALL + 0.42],
    },
  };
}

/* ─── Recorrido de la cámara ────────────────────────────────────────────── */

export function viewsFor({ half }: Layout): { overview: View; steps: View[] } {
  return {
    overview: { position: [-half - 17, 20, 26], target: [0, -0.5, 0] },
    steps: [
      { position: [-half - 13, 17, 22], target: [0, 0, 0] },
      { position: [-half - 12, 10.5, 16], target: [-half * 0.3, -0.8, 0.6] },
      { position: [-half - 6.5, 9.5, 11.5], target: [-half * 0.35, -1.1, 0] },
      { position: [half + 9, 8.5, 12.5], target: [half * 0.25, -0.7, 0.6] },
      { position: [-half - 6.5, 6.5, 9.5], target: [-half + 4, -0.4, 0] },
      { position: [-half - 14, 11.5, 19], target: [2, 0, -1.5] },
    ],
  };
}

/* ─── Etiquetas sobre el modelo ─────────────────────────────────────────── */

export type Label = {
  text: string;
  /** Paso en el que se muestra (0 a 5) */
  step: number;
  /** Avance del paso desde el que aparece y hasta el que sigue visible */
  from: number;
  until?: number;
  /** Solo con la acción del paso activa (p. ej., los estratos del suelo) */
  action?: boolean;
  position: Vec3;
};

export function labelsFor(layout: Layout): Label[] {
  const { half, pit, dig, supports, modules, spots, size } = layout;
  const [s0, s1] = supports;
  const strataX = -half * 0.45;
  return [
    { text: `Replanteo de ${size.length} × ${String(WIDTH).replace(".", ",")} m`, step: 0, from: 0.75, position: [0, 0.7, pit.z] },
    { text: "Camilla de replanteo", step: 0, from: 0.75, position: [-dig.x - 1.3, 1, 0] },

    { text: "Nivel topográfico", step: 1, from: 0, position: [spots.level[0], 1.75, spots.level[2]] },
    { text: "Foso de fundación", step: 1, from: 0.7, position: [-half * 0.15, LEVEL.bottom + 0.2, 0] },
    // En diagonal sobre el talud del fondo: cada una a la altura de su estrato
    { text: "Capa vegetal", step: 1, from: 0.4, action: true, position: [strataX - 3, -0.15, -dig.z] },
    { text: "Limo arcilloso", step: 1, from: 0.55, action: true, position: [strataX, -0.6, -dig.z] },
    { text: "Grava arenosa", step: 1, from: 0.8, action: true, position: [strataX + 3, -1.15, -dig.z] },

    { text: "Zapata", step: 2, from: 0.55, position: [s0, LEVEL.footing, -CELL_Z - FOOTING.size / 2] },
    { text: "Pedestal", step: 2, from: 0.8, position: [s0, LEVEL.pier, CELL_Z] },
    { text: "Viga de amarre", step: 2, from: 0.65, position: [(s0 + s1) / 2, LEVEL.footing, CELL_Z] },

    { text: "Tubería pluvial", step: 3, from: 0.3, until: 0.75, position: [half * 0.2, LEVEL.slab, 0] },
    { text: "Cámara de drenaje", step: 3, from: 0.45, position: [spots.chamber[0], 0.15, spots.chamber[2]] },
    { text: "Losa de lavado", step: 3, from: 0.9, position: [-half * 0.4, LEVEL.slab, -pit.z * 0.55] },

    { text: "Muro de contención", step: 4, from: 0.35, position: [-half * 0.3, 0, -pit.z - SIDE_WALL / 2] },
    { text: "Muro frontal", step: 4, from: 0.5, position: [-pit.x - FRONT_WALL / 2, 0, pit.z * 0.4] },
    { text: "Losa de acceso", step: 4, from: 0.95, position: [-pit.x - FRONT_WALL - APPROACH_LENGTH / 2, 0, 0] },

    { text: "Celdas POWERCELL PDX", step: 5, from: 0.08, until: 0.45, position: [s1, LEVEL.pier + 0.15, CELL_Z] },
    { text: "Módulo de acero VTS200", step: 5, from: 0.5, position: [modules[0].x, 0, -WIDTH / 2] },
    { text: "Caseta de control", step: 5, from: 0.88, position: [spots.booth[0], 2.9, spots.booth[2]] },
  ];
}

/* ─── Camión y lecturas ─────────────────────────────────────────────────── */

export type Axle = { offset: number; load: number; dual: boolean };

/** Tractocamión con semirremolque (5 ejes); offset = posición respecto del eje delantero */
export const TRUCK: Axle[] = [
  { offset: 0, load: 6800, dual: false },
  { offset: -3.7, load: 8900, dual: true },
  { offset: -5.05, load: 8900, dual: true },
  { offset: -11.9, load: 8600, dual: true },
  { offset: -13.25, load: 8600, dual: true },
];

export const TRUCK_SPAN = -TRUCK[TRUCK.length - 1].offset;

/** Posición del eje delantero con el camión centrado en la plataforma */
export const TRUCK_STOP = TRUCK_SPAN / 2;

export type ScaleReading = {
  /** Peso real sobre la plataforma */
  total: number;
  /** Carga por celda, en el orden de `cells` */
  cells: number[];
  axlesOnDeck: number;
};

/**
 * Cada módulo apoya en las dos líneas que lo rodean: la carga de un eje se reparte entre ellas
 * (regla de la palanca) y, en cada línea, por partes iguales entre la celda izquierda y la derecha.
 */
export function computeReading({ half, supports, cells }: Layout, frontX: number): ScaleReading {
  const loads = new Array<number>(cells.length).fill(0);
  let total = 0;
  let axlesOnDeck = 0;

  for (const axle of TRUCK) {
    const x = frontX + axle.offset;
    if (Math.abs(x) > half) continue;
    axlesOnDeck++;
    total += axle.load;

    let i = 0;
    while (i < supports.length - 2 && x > supports[i + 1]) i++;
    const t = Math.min(1, Math.max(0, (x - supports[i]) / (supports[i + 1] - supports[i])));
    for (const [k, load] of [(1 - t) * axle.load, t * axle.load].entries()) {
      loads[(i + k) * 2] += load / 2;
      loads[(i + k) * 2 + 1] += load / 2;
    }
  }

  return { total, cells: loads, axlesOnDeck };
}
