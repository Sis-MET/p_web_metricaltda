// Punto de entrada único para las escenas 3D: ambos demos importan desde aquí
// para que three.js y drei se descarguen una sola vez (un solo chunk compartido).
export { default as TruckScaleScene } from "./TruckScaleScene";
export { default as BenchScaleScene } from "./BenchScaleScene";
