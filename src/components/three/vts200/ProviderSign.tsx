"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/** Letrero (m): panel sobre un mástil, alto para que los camiones pasen por debajo */
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
 * Letrero "Balanza provista por" con el logo de Métrica. Se ubica siempre detrás de la báscula
 * (en el origen) mirando a la cámara: se lee desde cualquier ángulo y nunca tapa la báscula. Si
 * quedaría sobre el camino, se corre al costado. `distance`: desde el centro de la báscula (m).
 */
export function ProviderSign({ distance }: { distance: number }) {
  const group = useRef<THREE.Group>(null);
  const placed = useRef(false);
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

  useFrame(({ camera }, dt) => {
    const g = group.current;
    if (!g) return;
    const { x: cx, z: cz } = camera.position;
    const length = Math.hypot(cx, cz) || 1;
    // Al lado opuesto de la cámara, fuera de la franja del camino
    const x = (-cx / length) * distance;
    let z = (-cz / length) * distance;
    if (Math.abs(z) < ROAD) z = z > 0 ? ROAD : -ROAD;
    // Se desliza (no salta) cuando la cámara cruza el eje del camino
    const k = placed.current ? 1 - Math.exp(-6 * dt) : 1;
    placed.current = true;
    g.position.set(g.position.x + (x - g.position.x) * k, 0, g.position.z + (z - g.position.z) * k);
    g.rotation.y = Math.atan2(cx - g.position.x, cz - g.position.z);
  });

  return (
    <group ref={group}>
      <mesh material={frame} position={[0, middle / 2, -SIGN.depth / 2 - SIGN.pole]}>
        <cylinderGeometry args={[SIGN.pole, SIGN.pole * 1.2, middle, 16]} />
      </mesh>
      <mesh material={frame} position={[0, middle, 0]}>
        <boxGeometry args={[SIGN.width + SIGN.frame * 2, SIGN.height + SIGN.frame * 2, SIGN.depth]} />
      </mesh>
      <mesh position={[0, middle, SIGN.depth / 2 + 0.005]}>
        <planeGeometry args={[SIGN.width, SIGN.height]} />
        <meshBasicMaterial map={face ?? blank} toneMapped={false} />
      </mesh>
    </group>
  );
}
