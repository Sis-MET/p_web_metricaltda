"use client";

import { useRef, type RefObject } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { Vec3 } from "./useResponsiveFraming";

/**
 * Ancla elementos DOM (botones, etiquetas) a puntos de la escena.
 * Reemplaza a <Html> de drei: sin raíces de React extra, solo un transform por elemento y cuadro.
 * Los elementos deben estar en una capa `absolute inset-0` del mismo tamaño que el canvas.
 */
export function ScreenAnchors({
  points,
  elements,
  isVisible = () => true,
}: {
  points: Vec3[];
  elements: RefObject<(HTMLElement | null)[]>;
  isVisible?: () => boolean;
}) {
  const vector = useRef(new THREE.Vector3());

  useFrame(({ camera, size }) => {
    const els = elements.current;
    if (!els) return;
    const visible = isVisible();
    points.forEach((p, i) => {
      const el = els[i];
      if (!el) return;
      const v = vector.current.set(p[0], p[1], p[2]).project(camera);
      const shown = visible && v.z < 1;
      el.style.opacity = shown ? "1" : "0";
      el.style.visibility = shown ? "visible" : "hidden";
      el.style.transform = `translate3d(${((v.x + 1) / 2) * size.width}px, ${((1 - v.y) / 2) * size.height}px, 0) translate(-50%, -50%)`;
    });
  });

  return null;
}
