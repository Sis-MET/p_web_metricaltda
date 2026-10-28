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

/**
 * Celda POWERCELL PDX sobre su pedestal (alturas desde la cara del pedestal, m): placa de apoyo,
 * copa inferior, cuerpo de acero inoxidable con la columna basculante y la electrónica, y copa
 * superior. Asoma dentro del bolsillo de la plataforma.
 */
export const CELL = {
  plate: 0.025,
  cup: 0.02,
  body: 0.13,
  radius: 0.052,
  /** Centro de la columna y altura de la placa electrónica */
  column: 0.1,
  pcb: 0.163,
  /** Prensaestopas del cable de red, del lado -x */
  gland: 0.07,
};

/** Celda que se abre en la vista de celdas: la segunda línea de apoyo, lado +z */
export const FOCUS_CELL = 3;

/** Paso del montaje de la báscula: su acción es la vista de celdas (plataforma transparente) */
export const MOUNT_STEP = 5;

// Cámara de la vista de celdas respecto de la celda abierta (sin three.js: este archivo también
// lo usa la interfaz del demo, que se carga antes que la escena)
const CELL_VIEW = { x: -0.55, z: 0.33 };
const CELL_VIEW_LENGTH = Math.hypot(CELL_VIEW.x, CELL_VIEW.z);

/** Dirección horizontal desde la celda abierta hacia la cámara de la vista de celdas */
export const CELL_VIEW_DIRECTION = { x: CELL_VIEW.x / CELL_VIEW_LENGTH, z: CELL_VIEW.z / CELL_VIEW_LENGTH };

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

export function viewsFor({ half, cells }: Layout): { overview: View; steps: View[]; cell: View } {
  const focus = cells[FOCUS_CELL];
  return {
    // Debajo de la plataforma (transparente), a la altura de la columna de la celda abierta
    cell: {
      position: [focus.x + CELL_VIEW.x, LEVEL.pier + 0.08, focus.z + CELL_VIEW.z],
      target: [focus.x, LEVEL.pier + CELL.column + 0.01, focus.z],
    },
    // Vistas bajas: detrás de la obra asoman la mina y los cerros
    overview: { position: [-half - 28, 9, 36], target: [6, 2, -8] },
    steps: [
      { position: [-half - 15, 10, 23], target: [1, 0.5, -2] },
      { position: [-half - 13, 7, 17], target: [-half * 0.3, -0.3, -0.5] },
      { position: [-half - 7, 6.5, 12.5], target: [-half * 0.35, -0.8, -1] },
      { position: [half + 10, 6, 14], target: [half * 0.2, -0.3, -1] },
      { position: [-half - 7.5, 4.5, 10.5], target: [-half + 4, 0, -1] },
      { position: [-half - 15, 7, 20], target: [2, 1.5, -3] },
    ],
  };
}

/**
 * Demo de pesaje del inicio (la báscula ya instalada): vista general y una por cada parte del
 * recorrido de la señal, en el orden de WEIGHING_STEPS (plataforma, celdas, red e indicador).
 */
export function weighingViewsFor({ half, spots }: Layout): { overview: View; parts: View[] } {
  const [bx, , bz] = spots.booth;
  return {
    overview: { position: [-half - 14, 10.5, 23], target: [2, 0, -2] },
    parts: [
      { position: [-half - 10, 8, 17], target: [0, 0, -0.5] },
      // Desde arriba y del lado +z: las celdas de ese lado quedan fuera de la sombra del camión
      { position: [-half + 1, 8.5, 9.5], target: [-half * 0.25, -0.4, 0.9] },
      // De frente: el tendido corre por el lado -z hasta la caseta, al fondo
      { position: [half * 0.1, 11, 14], target: [half * 0.6, 0, -3.2] },
      // Más allá del frente del camión detenido, para que no tape la caseta
      { position: [bx + 3, 8, bz + 12], target: [bx - 0.5, 1.2, bz + 0.5] },
    ],
  };
}

/** Lectura de cada celda sobre el modelo: justo encima de su placa superior */
export const cellTagPoints = ({ cells }: Layout): Vec3[] =>
  cells.map((cell) => [cell.x, LEVEL.pier + CELL.plate + CELL.cup * 2 + CELL.body + 0.05, cell.z]);

/* ─── Etiquetas sobre el modelo ─────────────────────────────────────────── */

export type Label = {
  text: string;
  /** Paso en el que se muestra (0 a 5) */
  step: number;
  /** Avance del paso desde el que aparece y hasta el que sigue visible */
  from: number;
  until?: number;
  /** true: solo con la acción del paso activa (estratos, celdas); false: solo sin ella */
  action?: boolean;
  /** Punto numerado (la explicación va en el panel del demo) */
  callout?: number;
  position: Vec3;
};

export function labelsFor(layout: Layout): Label[] {
  const { half, pit, dig, supports, modules, spots, size, cells } = layout;
  const [s0, s1] = supports;
  const strataX = -half * 0.45;
  const focus = cells[FOCUS_CELL];
  const cellPoint = (height: number, outward = 0): Vec3 => [
    focus.x + CELL_VIEW_DIRECTION.x * outward,
    LEVEL.pier + height,
    focus.z + CELL_VIEW_DIRECTION.z * outward,
  ];
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

    { text: "Celdas POWERCELL PDX", step: 5, from: 0.08, until: 0.45, action: false, position: [s1, LEVEL.pier + 0.15, CELL_Z] },
    { text: "Módulo de acero VTS200", step: 5, from: 0.5, action: false, position: [modules[0].x, 0, -WIDTH / 2] },
    { text: "Caseta de control", step: 5, from: 0.88, action: false, position: [spots.booth[0], 2.9, spots.booth[2]] },
    // Celda abierta: puntos numerados sobre sus partes, en el orden del panel
    { text: "Columna de acero", callout: 1, step: 5, from: 0, action: true, position: cellPoint(0.135, 0.022) },
    { text: "Galgas extensométricas", callout: 2, step: 5, from: 0, action: true, position: cellPoint(CELL.column, 0.026) },
    { text: "Electrónica digital", callout: 3, step: 5, from: 0, action: true, position: cellPoint(CELL.pcb, 0.03) },
    { text: "Red hasta la caseta", callout: 4, step: 5, from: 0, action: true, position: [focus.x - 0.08, LEVEL.pier + CELL.gland, focus.z] },
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

/** Lo que muestra el indicador: la lectura, el valor que se va estabilizando y si ya está estable */
export type TruckReading = ScaleReading & { displayed: number; stable: boolean };

export const EMPTY_READING: TruckReading = { total: 0, cells: [], axlesOnDeck: 0, displayed: 0, stable: false };

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
