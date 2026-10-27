// Punto de entrada único para las escenas 3D: ambos demos importan desde aquí
// para que three.js y drei se descarguen una sola vez (un solo chunk compartido).
export { default as Vts200Scene } from "./vts200/Vts200Scene";
export { default as BenchScaleScene } from "./BenchScaleScene";
