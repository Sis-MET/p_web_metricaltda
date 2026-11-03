"use client";

import { useEffect, useMemo, useState } from "react";
import * as THREE from "three";
import type { Vec3 } from "../useResponsiveFraming";

/** Letrero (m): panel sobre dos postes, alto para que se vea por encima de la báscula y el camión */
const SIGN = { width: 12, height: 4.8, depth: 0.3, clearance: 4.6, frame: 0.12, pole: 0.2 };
/** Franja del camino de los camiones (|z|): el mástil nunca queda sobre ella */
const ROAD = 3.6;
const TEXTURE_WIDTH = 2048;
const TEXT = "BALANZA PROVISTA POR";
const LOGO = "/images/logo/metrica.png";

const loadImage = (src: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });

/** Cara del letrero: el texto con la fuente de títulos del sitio y el logo de Métrica debajo */
function drawFace(logo: HTMLImageElement | null) {
  const canvas = document.createElement("canvas");
  canvas.width = TEXTURE_WIDTH;
  canvas.height = Math.round((TEXTURE_WIDTH * SIGN.height) / SIGN.width);
  const ctx = canvas.getContext("2d")!;
  const { width: w, height: h } = canvas;

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, w, h);
  // Filete azul METTLER a un margen del borde
  ctx.strokeStyle = "#002a5a";
  ctx.lineWidth = h * 0.018;
  ctx.strokeRect(h * 0.05, h * 0.05, w - h * 0.1, h * 0.9);

  const family = getComputedStyle(document.documentElement).getPropertyValue("--font-manrope") || "sans-serif";
  ctx.fillStyle = "#002a5a";
  ctx.font = `800 ${Math.round(h * 0.15)}px ${family}, sans-serif`;
  ctx.letterSpacing = `${Math.round(h * 0.012)}px`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(TEXT, w / 2, h * 0.25);

  if (logo) {
    const lw = w * 0.6;
    const lh = (lw * logo.height) / logo.width;
    ctx.drawImage(logo, (w - lw) / 2, h * 0.39, lw, lh);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  return texture;
}

/**
 * Letrero "Balanza provista por" con el logo de Métrica, de dos caras sobre dos postes. Está fijo
 * detrás de la báscula (en el origen), del lado opuesto a la vista general (`facing`) y mirándola,
 * fuera del camino de los camiones. `distance`: desde el centro de la báscula (m).
 */
export function ProviderSign({ distance, facing }: { distance: number; facing: Vec3 }) {
  // Hasta que cargan el logo y la fuente, la cara va en blanco (mismo shader: no recompila)
  const blank = useMemo(() => drawFace(null), []);
  const [face, setFace] = useState<THREE.Texture | null>(null);

  useEffect(() => {
    let texture: THREE.Texture | null = null;
    let cancelled = false;
    Promise.all([loadImage(LOGO), document.fonts.ready])
      .then(([logo]) => {
        if (cancelled) return;
        texture = drawFace(logo);
        setFace(texture);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
      texture?.dispose();
    };
  }, []);

  const frame = useMemo(() => new THREE.MeshStandardMaterial({ color: "#3b4148", metalness: 0.5, roughness: 0.5 }), []);
  /** Altura del centro del panel: hasta ahí llega el mástil */
  const middle = SIGN.clearance + SIGN.height / 2;

  // Al lado opuesto de la vista general, fuera de la franja del camino
  const [fx, , fz] = facing;
  const length = Math.hypot(fx, fz) || 1;
  const x = (-fx / length) * distance;
  let z = (-fz / length) * distance;
  if (Math.abs(z) < ROAD) z = z > 0 ? ROAD : -ROAD;

  return (
    <group position={[x, 0, z]} rotation-y={Math.atan2(fx - x, fz - z)}>
      {[-1, 1].map((side) => (
        <mesh key={`poste${side}`} material={frame} position={[side * SIGN.width * 0.3, SIGN.clearance / 2, 0]}>
          <cylinderGeometry args={[SIGN.pole, SIGN.pole * 1.2, SIGN.clearance, 16]} />
        </mesh>
      ))}
      <mesh material={frame} position={[0, middle, 0]}>
        <boxGeometry args={[SIGN.width + SIGN.frame * 2, SIGN.height + SIGN.frame * 2, SIGN.depth]} />
      </mesh>
      {/* Una cara de cada lado: se lee también al rodear la escena */}
      {[1, -1].map((side) => (
        <mesh key={`cara${side}`} position={[0, middle, side * (SIGN.depth / 2 + 0.005)]} rotation-y={side < 0 ? Math.PI : 0}>
          <planeGeometry args={[SIGN.width, SIGN.height]} />
          <meshBasicMaterial map={face ?? blank} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}
