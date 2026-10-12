// Línea de tiempo del demo de la balanza de mesa BPA121: pesar → desmontar → limpiar → armar y verificar.
// Funciones puras: dado el tiempo, dicen dónde está cada pieza y qué muestra el display.

/* ─── Geometría (1 unidad = 10 cm) ──────────────────────────────────────── */

export const BASE = { w: 3.2, h: 0.72, d: 2.6, bottom: 0.08 };
export const BASE_TOP = BASE.bottom + BASE.h; // 0.80
export const CELL_TOP = 0.94;
export const SUPPORT_Y = 0.99;
export const PAN_Y = 1.065;
export const PAN_TOP = 1.11;
export const PRODUCT = { radius: 0.62, height: 0.42 };

/** Desplazamiento de cada pieza cuando se separa para la limpieza */
export const EXPLODED = {
  pan: [-3.1, 1.0, -0.2] as [number, number, number],
  support: [3.0, 0.45, 0] as [number, number, number],
};

/** Etiquetas de las piezas en la vista desmontada */
export const PART_LABELS: { label: string; position: [number, number, number] }[] = [
  { label: "Plato", position: [EXPLODED.pan[0], PAN_TOP + EXPLODED.pan[1] + 0.45, 0] },
  { label: "Soporte del plato", position: [EXPLODED.support[0], SUPPORT_Y + EXPLODED.support[1] + 0.4, 0] },
  { label: "Celda de carga", position: [0, CELL_TOP + 0.35, 0] },
  { label: "Base", position: [0, 0.2, BASE.d / 2 + 0.5] },
];

export const PRODUCT_WEIGHT = 1.25; // kg
/** División del display (kg) */
export const DIVISION = 0.005;

export const BENCH_PHASES = [
  { id: "pesar", duration: 4.2 },
  { id: "desmontar", duration: 3.4 },
  { id: "limpiar", duration: 3.8 },
  { id: "armar", duration: 6.4 },
] as const;

const STARTS = BENCH_PHASES.reduce<number[]>((acc, _, i) => {
  acc.push(i === 0 ? 0 : acc[i - 1] + BENCH_PHASES[i - 1].duration);
  return acc;
}, []);

export const CYCLE = STARTS[STARTS.length - 1] + BENCH_PHASES[BENCH_PHASES.length - 1].duration;

export const phaseStart = (index: number) => STARTS[index];

export function phaseAt(t: number) {
  const tt = ((t % CYCLE) + CYCLE) % CYCLE;
  let index = 0;
  while (index < STARTS.length - 1 && tt >= STARTS[index + 1]) index++;
  return { index, p: (tt - STARTS[index]) / BENCH_PHASES[index].duration };
}

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const smoothstep = (a: number, b: number, x: number) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};
const easeOut = (x: number) => 1 - Math.pow(1 - clamp01(x), 3);

export type Power = "on" | "off" | "offMessage" | "selfTest";

export type BenchState = {
  /** 0 = armada, 1 = piezas separadas para limpieza */
  explode: number;
  /** Producto: altura sobre el plato y escala (0 = retirado) */
  product: { lift: number; scale: number; onPan: boolean };
  power: Power;
  /** Intensidad del agua de limpieza (0..1) */
  water: number;
};

export function benchStateAt(index: number, p: number): BenchState {
  switch (index) {
    case 0:
      // El producto está sobre el plato y la balanza indica su peso
      // (se apoya al final del paso 4, así el ciclo empalma sin saltos)
      return {
        explode: 0,
        product: { lift: 0, scale: 1, onPan: true },
        power: "on",
        water: 0,
      };
    case 1: {
      // Se retira el producto, se apaga y se separan plato y soporte
      const lift = easeOut(p / 0.22);
      return {
        explode: smoothstep(0.3, 0.9, p),
        product: { lift: 1.2 * lift, scale: 1 - smoothstep(0.12, 0.24, p), onPan: false },
        power: p < 0.24 ? "on" : p < 0.42 ? "offMessage" : "off",
        water: 0,
      };
    }
    case 2:
      return {
        explode: 1,
        product: { lift: 0, scale: 0, onPan: false },
        power: "off",
        water: smoothstep(0, 0.12, p) * (1 - smoothstep(0.82, 1, p)),
      };
    default: {
      // Se arma, se enciende (autotest y cero) y se vuelve a pesar el mismo producto
      const drop = easeOut((p - 0.62) / 0.12);
      return {
        explode: 1 - smoothstep(0, 0.36, p),
        product: { lift: 0.7 * (1 - drop), scale: p < 0.6 ? 0 : 1, onPan: p >= 0.74 },
        power: p < 0.42 ? "off" : p < 0.54 ? "selfTest" : "on",
        water: 0,
      };
    }
  }
}

/** Texto del display de 6 dígitos */
export function displayText(power: Power, value: number) {
  if (power === "off") return "";
  if (power === "offMessage") return "OFF";
  if (power === "selfTest") return "8.8.8.8.8.8.";
  return (Math.round(value / DIVISION) * DIVISION).toFixed(3);
}
