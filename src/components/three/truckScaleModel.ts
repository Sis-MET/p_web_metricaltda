// Modelo simplificado de una báscula de camiones sobre suelo (unidades en metros y kg).
// Lo comparten la escena 3D y el panel de lecturas para que ambos muestren lo mismo.

export const DECK_HALF_LENGTH = 9; // plataforma de 18 m
export const DECK_WIDTH = 3;
export const DECK_BOTTOM = 0.5;
export const DECK_TOP = 0.85;
export const RAMP_LENGTH = 3;

/** Líneas de apoyo: cada una tiene una celda de carga a cada lado. */
export const SUPPORT_X = [-8.7, -3, 3, 8.7];
export const CELL_Z = 1.25;

export type Cell = { id: string; x: number; z: number; support: number };

export const CELLS: Cell[] = SUPPORT_X.flatMap((x, support) => [
  { id: `C${support * 2 + 1}`, x, z: -CELL_Z, support },
  { id: `C${support * 2 + 2}`, x, z: CELL_Z, support },
]);

export type Axle = { offset: number; load: number; dual: boolean };

export type TruckConfig = {
  id: string;
  label: string;
  short: string;
  body: "rigid" | "semi";
  /** offset = posición del eje respecto del eje delantero (negativo = hacia atrás) */
  axles: Axle[];
};

export const TRUCKS: TruckConfig[] = [
  {
    id: "c2",
    label: "Camión rígido",
    short: "2 ejes",
    body: "rigid",
    axles: [
      { offset: 0, load: 6200, dual: false },
      { offset: -5.2, load: 10800, dual: true },
    ],
  },
  {
    id: "c3",
    label: "Camión de carga",
    short: "3 ejes",
    body: "rigid",
    axles: [
      { offset: 0, load: 6500, dual: false },
      { offset: -4.6, load: 9300, dual: true },
      { offset: -5.95, load: 9300, dual: true },
    ],
  },
  {
    id: "t3s2",
    label: "Tractocamión con semirremolque",
    short: "5 ejes",
    body: "semi",
    axles: [
      { offset: 0, load: 6800, dual: false },
      { offset: -3.7, load: 8900, dual: true },
      { offset: -5.05, load: 8900, dual: true },
      { offset: -11.9, load: 8600, dual: true },
      { offset: -13.25, load: 8600, dual: true },
    ],
  },
];

export const totalLoad = (truck: TruckConfig) => truck.axles.reduce((sum, a) => sum + a.load, 0);

/** Posición del eje delantero cuando el camión queda centrado en la plataforma. */
export const stopPosition = (truck: TruckConfig) => -truck.axles[truck.axles.length - 1].offset / 2;

/** Altura del piso de rodadura en x: suelo, rampa o plataforma. */
export function surfaceHeight(x: number) {
  const ax = Math.abs(x);
  if (ax <= DECK_HALF_LENGTH) return DECK_TOP;
  if (ax < DECK_HALF_LENGTH + RAMP_LENGTH) return (DECK_TOP * (DECK_HALF_LENGTH + RAMP_LENGTH - ax)) / RAMP_LENGTH;
  return 0;
}

export type ScaleReading = {
  /** Peso real sobre la plataforma */
  total: number;
  /** Carga por celda, en el mismo orden que CELLS */
  cells: number[];
  axlesOnDeck: number;
  /** Posición x de cada eje (m), esté o no sobre la plataforma */
  axles: number[];
};

/** Puntos numerados del recorrido guiado (posiciones en la escena) */
export const HOTSPOTS: { id: number; label: string; position: [number, number, number] }[] = [
  { id: 1, label: "Plataforma", position: [-6, DECK_TOP + 0.35, DECK_WIDTH / 2 + 0.2] },
  { id: 2, label: "Celdas de carga", position: [-3, 0.45, CELL_Z + 0.55] },
  { id: 3, label: "Red digital", position: [6, 0.3, CELL_Z + 0.6] },
  { id: 4, label: "Terminal", position: [12.6, 1.75, -4.8] },
];

/** Dónde va la etiqueta de cada celda en la vista de rayos X */
export const CELL_LABEL_POSITIONS: [number, number, number][] = CELLS.map((c) => [
  c.x,
  0.75,
  c.z < 0 ? c.z - 0.35 : c.z + 0.35,
]);

/**
 * Reparte la carga de cada eje entre las dos líneas de apoyo que lo rodean (regla de la palanca)
 * y la divide en partes iguales entre la celda izquierda y la derecha.
 */
export function computeReading(truck: TruckConfig, frontX: number): ScaleReading {
  const cells = new Array<number>(CELLS.length).fill(0);
  const axles = truck.axles.map((axle) => frontX + axle.offset);
  let total = 0;
  let axlesOnDeck = 0;

  for (const [a, axle] of truck.axles.entries()) {
    const x = axles[a];
    if (Math.abs(x) > DECK_HALF_LENGTH) continue;

    axlesOnDeck++;
    total += axle.load;

    let i = 0;
    while (i < SUPPORT_X.length - 2 && x > SUPPORT_X[i + 1]) i++;
    const t = Math.min(1, Math.max(0, (x - SUPPORT_X[i]) / (SUPPORT_X[i + 1] - SUPPORT_X[i])));
    const toSupport = [(1 - t) * axle.load, t * axle.load];

    for (const [k, load] of toSupport.entries()) {
      const support = i + k;
      cells[support * 2] += load / 2;
      cells[support * 2 + 1] += load / 2;
    }
  }

  return { total, cells, axlesOnDeck, axles };
}
