/**
 * Proyecto llave en mano de una báscula camionera METTLER TOLEDO VTS200, con los datos de su ficha técnica.
 * Lo comparten el demo de pesaje del inicio, el demo 3D de la instalación y el Asistente de Métrica.
 */

export const DEMO_HREF = "/demo/bascula-de-camiones";
export const DEMO_TITLE = "Demo 3D: instalación de una báscula camionera VTS200";

/** Sección del inicio con el demo de pesaje (el slide de básculas y la salida del demo llevan ahí) */
export const WEIGHING_SECTION_ID = "demo-pesaje";

/** Báscula de camiones del catálogo: su ficha y la cotización del proyecto */
export const TRUCK_SCALE_PRODUCT = { category: "basculas-de-camiones", slug: "powercell-pdx" } as const;

/** Paso (0 a 5) de `?paso=` en la dirección del demo; el primero si falta o no es válido */
export function stepFromQuery(value: string | null) {
  const step = Number(value);
  return Number.isInteger(step) && step >= 1 && step <= PROJECT_STEPS.length ? step - 1 : 0;
}

export const VTS200 = {
  name: "METTLER TOLEDO VTS200",
  /** Ancho estándar de la plataforma (m) */
  width: 3.4,
  /** División del indicador (kg) */
  division: 20,
  cells: "POWERCELL PDX",
};

/** Largos estándar con su capacidad: todo el proyecto se dimensiona a partir de aquí */
export type ScaleSize = {
  length: number;
  /** kg */
  capacity: number;
  /** Largo de cada módulo de acero (m) */
  modules: number[];
};

export const SCALE_SIZES: ScaleSize[] = [
  { length: 16, capacity: 50_000, modules: [5, 6, 5] },
  { length: 18, capacity: 60_000, modules: [6, 6, 6] },
  { length: 24, capacity: 80_000, modules: [6, 6, 6, 6] },
];

export const DEFAULT_SIZE = 1;

export const PHASES = [
  { id: "preparacion", name: "Preparación" },
  { id: "construccion", name: "Construcción" },
  { id: "instalacion", name: "Instalación" },
] as const;

export type PhaseId = (typeof PHASES)[number]["id"];

export type ProjectStep = {
  phase: PhaseId;
  title: string;
  /** Nombre corto para la línea de tiempo del demo */
  short: string;
  text: string;
  result: string;
};

export const PROJECT_STEPS: ProjectStep[] = [
  {
    phase: "preparacion",
    title: "Preparación del terreno",
    short: "Terreno",
    text: "Iniciamos con el acondicionamiento del terreno: limpiamos el área, retiramos la vegetación y el material suelto, y replanteamos la báscula y sus accesos según el largo elegido.",
    result: "Área despejada y replanteada para la obra.",
  },
  {
    phase: "preparacion",
    title: "Estudio de suelos, topografía y excavación",
    short: "Suelos y excavación",
    text: "Evaluamos el suelo y hacemos el levantamiento topográfico para fijar los niveles del proyecto. Con esos datos excavamos el foso hasta la cota de fundación.",
    result: "Terreno evaluado y excavado a la profundidad de diseño.",
  },
  {
    phase: "construccion",
    title: "Encofrado y hormigonado de zapatas",
    short: "Zapatas",
    text: "Bajo cada celda de carga va una zapata. Las armamos, encofamos y hormigonamos junto con las vigas de amarre que las unen: la cimentación arriostrada resiste movimientos horizontales y asentamientos diferenciales.",
    result: "Cimentación arriostrada que da estabilidad a la estructura de pesaje.",
  },
  {
    phase: "construccion",
    title: "Sistema pluvial y losa de lavado",
    short: "Pluvial y losa",
    text: "Instalamos tuberías, sumideros y una cámara de drenaje, y vaciamos la losa de lavado con pendientes que llevan el agua de lluvia fuera del foso, lejos de la estructura y de los componentes electrónicos.",
    result: "Foso que evacúa el agua y se limpia con facilidad.",
  },
  {
    phase: "construccion",
    title: "Muro frontal y muros de contención",
    short: "Muros",
    text: "Levantamos los muros de contención que sostienen el terreno a los lados del foso y los muros frontales donde apoyan las losas de acceso, al mismo nivel que la plataforma.",
    result: "Foso confinado y accesos a nivel para el ingreso de los camiones.",
  },
  {
    phase: "instalacion",
    title: "Montaje de la VTS200 y caseta de control",
    short: "Montaje",
    text: "Colocamos las celdas digitales POWERCELL PDX, montamos los módulos de acero de la VTS200 e instalamos la caseta de control con el indicador o la computadora donde funciona el software de su empresa.",
    result: "Báscula y caseta integradas para registrar, supervisar y gestionar el pesaje de sus vehículos.",
  },
];

/** Cómo pesa una celda POWERCELL PDX, en el orden de los puntos numerados del demo */
export const LOAD_CELL_STEPS = [
  {
    title: "Columna de acero",
    text: "El peso de cada eje comprime una columna de acero inoxidable apenas unas micras. Al ser basculante, vuelve sola a la vertical cuando la plataforma se mueve.",
  },
  {
    title: "Galgas extensométricas",
    text: "Pegadas a la columna, cambian su resistencia eléctrica en proporción exacta a esa deformación.",
  },
  {
    title: "Electrónica digital",
    text: "La propia celda convierte la señal a digital y la compensa por temperatura y linealidad: sin cajas de conexión analógicas.",
  },
  {
    title: "Red hasta la caseta",
    text: "Las celdas se conectan en cadena y envían su lectura al indicador, que suma todas y vigila el estado de cada una.",
  },
];

export const LOAD_CELL_NOTE =
  "Si una celda falla o se sobrecarga, el indicador lo avisa antes de que afecte la medición.";

/** Demo de pesaje del inicio: el recorrido del peso, del eje del camión al indicador de la caseta */
export const WEIGHING_STEPS = [
  {
    title: "Plataforma de acero",
    text: "Los módulos de la VTS200 reciben cada eje y reparten su peso entre las líneas de apoyo, esté donde esté el camión.",
  },
  {
    title: `Celdas ${VTS200.cells}`,
    text: "Cada celda mide la fuerza en su apoyo y la convierte en señal digital dentro de la propia celda, sin cajas de conexión analógicas.",
  },
  {
    title: "Red digital",
    text: "Las celdas van conectadas en cadena hasta la caseta. El indicador supervisa cada una y avisa ante cualquier anomalía.",
  },
  {
    title: "Indicador en la caseta",
    text: "Suma las celdas, muestra el peso cuando se estabiliza y entrega el ticket o el dato al software del cliente.",
  },
];

export const phaseOf = (step: ProjectStep) => {
  const index = PHASES.findIndex((phase) => phase.id === step.phase);
  return { ...PHASES[index], number: index + 1 };
};

const tonnes = (kg: number) => `${kg / 1000} t`;

export const sizeLabel = (size: ScaleSize) => `${size.length} m · ${tonnes(size.capacity)}`;

/** Resumen para el formulario de cotización */
export const quoteSummary = (size: ScaleSize) =>
  `Proyecto de instalación de una báscula camionera ${VTS200.name} de ${size.length} m (${tonnes(size.capacity)}): obra civil, montaje y caseta de control.`;
