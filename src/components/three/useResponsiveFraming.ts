import { useEffect, type RefObject } from "react";
import { useThree } from "@react-three/fiber";
import type { CameraControls } from "@react-three/drei";
import type * as THREE from "three";

export type Vec3 = [number, number, number];
export type View = { position: Vec3; target: Vec3 };
/** Desplazamiento de la imagen en fracción del visor (x > 0 mueve el modelo a la derecha) */
export type Shift = { x: number; y: number };

// Las vistas de cámara están pensadas para un visor apaisado de esta proporción
const BASE_ASPECT = 1.45;

/**
 * Resolución adaptable para escenas a pantalla completa: el PerformanceMonitor de drei
 * entrega un factor 0..1 según los fps; se traduce a 0.75×–1.5× de densidad de píxeles.
 */
export const ADAPTIVE_DPR = {
  min: 0.75,
  initial: 1.1,
  fromFactor: (factor: number) => Math.round((0.75 + 0.75 * factor) * 100) / 100,
};

/**
 * Encuadre adaptable:
 * - en visores angostos (celular) aleja la cámara y abre un poco el ángulo para que el modelo quepa;
 * - desplaza la imagen para dejar espacio al texto superpuesto, sin mover la órbita.
 */
export function useResponsiveFraming(controls: RefObject<CameraControls | null>, shift: Shift) {
  const size = useThree((s) => s.size);
  const get = useThree((s) => s.get);
  const fit = Math.max(1, BASE_ASPECT / (size.width / Math.max(1, size.height)));
  const distance = Math.sqrt(fit);

  useEffect(() => {
    const camera = get().camera as THREE.PerspectiveCamera;
    camera.setViewOffset(size.width, size.height, -shift.x * size.width, -shift.y * size.height, size.width, size.height);
    controls.current?.zoomTo(1 / Math.sqrt(fit), false);
  }, [size.width, size.height, shift.x, shift.y, fit, get, controls]);

  return { distance };
}

/** Argumentos de setLookAt para una vista, alejando la cámara según `distance` */
export function scaleView(view: View, distance: number): [number, number, number, number, number, number] {
  const [px, py, pz] = view.position;
  const [tx, ty, tz] = view.target;
  return [tx + (px - tx) * distance, ty + (py - ty) * distance, tz + (pz - tz) * distance, tx, ty, tz];
}
