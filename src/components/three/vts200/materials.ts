import { useMemo } from "react";
import * as THREE from "three";

// Entorno azul METTLER (mt-900 / mt-800) con la obra en tonos de tierra y hormigón;
// amarillo Métrica solo en datos, replanteo y señales. Sin mapa de entorno (su filtro congelaba
// la página al montar la escena): los metales llevan poca metalicidad para no verse negros.
export const COLORS = {
  background: "#001f44",
  ground: "#002a5a",
  gridLine: "#0d4280",
  natural: new THREE.Color("#7a7448"),
  cleared: new THREE.Color("#b09772"),
  signal: "#e3b300",
  water: "#5cb8ff",
};

const STRATA = [
  { to: 0.3, color: "#5b4631" },
  { to: 0.9, color: "#8a5f3f" },
  { to: 1.4, color: "#a19580" },
];
const STRATA_DEPTH = 1.4;

function canvasTexture(width: number, height: number, draw: (ctx: CanvasRenderingContext2D) => void) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  draw(canvas.getContext("2d")!);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.anisotropy = 4;
  return texture;
}

/** Tierra: granos claros y oscuros sobre blanco (el color lo pone el material) */
function soilTexture() {
  const texture = canvasTexture(128, 128, (ctx) => {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, 128, 128);
    const rand = (i: number) => ((Math.sin(i * 12.9898) * 43758.5453) % 1 + 1) % 1;
    for (let i = 0; i < 1400; i++) {
      const shade = rand(i * 3) > 0.5 ? 255 : 150;
      ctx.fillStyle = `rgba(${shade},${shade},${shade},${0.18 + rand(i * 7) * 0.25})`;
      ctx.fillRect(rand(i) * 128, rand(i * 5) * 128, 1 + rand(i * 11) * 2.5, 1 + rand(i * 13) * 2.5);
    }
  });
  // Las coordenadas de textura del suelo están en metros: baldosas de 3 m
  texture.repeat.set(1 / 3, 1 / 3);
  return texture;
}

/** Talud de la excavación: estratos del suelo, de la superficie (arriba) al fondo */
function strataTexture() {
  return canvasTexture(64, 280, (ctx) => {
    let top = 0;
    for (const layer of STRATA) {
      const bottom = (layer.to / STRATA_DEPTH) * 280;
      ctx.fillStyle = layer.color;
      ctx.fillRect(0, top, 64, bottom - top);
      top = bottom;
    }
    // Granos sueltos para que no parezca pintura plana
    for (let i = 0; i < 900; i++) {
      ctx.fillStyle = `rgba(${i % 2 ? "255,255,255" : "0,0,0"},${0.05 + (i % 7) * 0.012})`;
      ctx.fillRect((i * 37) % 64, (i * 53) % 280, 2, 2);
    }
  });
}

/** Chapa antideslizante de la plataforma (RAL 7038) */
function treadTexture() {
  const texture = canvasTexture(64, 64, (ctx) => {
    ctx.fillStyle = "#b5b8b1";
    ctx.fillRect(0, 0, 64, 64);
    ctx.fillStyle = "#9da098";
    for (const [x, y, angle] of [
      [16, 16, 0.6],
      [48, 48, 0.6],
      [48, 16, -0.6],
      [16, 48, -0.6],
    ]) {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.fillRect(-11, -2.5, 22, 5);
      ctx.restore();
    }
  });
  // Baldosas de unos 30 cm en un módulo de 6 × 3,4 m (las caras de una caja van de 0 a 1)
  texture.repeat.set(20, 11);
  return texture;
}

/** Retícula de plano técnico del suelo que rodea la obra (celdas de 2 m) */
function gridTexture() {
  const texture = canvasTexture(128, 128, (ctx) => {
    ctx.fillStyle = COLORS.ground;
    ctx.fillRect(0, 0, 128, 128);
    ctx.fillStyle = COLORS.gridLine;
    ctx.fillRect(0, 0, 128, 2);
    ctx.fillRect(0, 0, 2, 128);
  });
  // Las coordenadas de textura del suelo están en metros
  texture.repeat.set(0.5, 0.5);
  return texture;
}

/** Mira topográfica: franjas rojas y blancas */
function rodTexture() {
  return canvasTexture(8, 64, (ctx) => {
    for (let i = 0; i < 8; i++) {
      ctx.fillStyle = i % 2 ? "#f4f4f2" : "#c8352b";
      ctx.fillRect(0, i * 8, 8, 8);
    }
  });
}

export function useMaterials() {
  return useMemo(() => {
    const standard = (color: THREE.ColorRepresentation, options: THREE.MeshStandardMaterialParameters = {}) =>
      new THREE.MeshStandardMaterial({ color, roughness: 0.9, ...options });

    const soil = soilTexture();
    return {
      ground: standard("#ffffff", { map: gridTexture(), roughness: 1 }),
      terrain: standard(COLORS.natural.clone(), { map: soil, roughness: 1 }),
      // Área de trabajo: del terreno natural al limpio y compactado
      site: standard(COLORS.natural.clone(), { map: soil, roughness: 1 }),
      dig: standard("#a19580", { roughness: 1 }),
      strata: standard("#ffffff", { map: strataTexture(), roughness: 1 }),
      // Transparente para mostrar el empuje del suelo sobre los muros
      fill: standard("#a08b6b", { roughness: 1, transparent: true }),
      pile: standard("#7d5b3d", { roughness: 1 }),
      grass: standard("#5d7638"),
      rock: standard("#8a847a"),
      wood: standard("#c49a62", { roughness: 0.8 }),
      formwork: standard("#a86f38", { roughness: 0.75 }),
      rebar: standard("#a4552e", { metalness: 0.2, roughness: 0.6 }),
      // Hormigón de la cimentación: transparente en la vista de armadura
      footing: standard("#aeb1b3", { transparent: true }),
      concrete: standard("#b7babb"),
      asphalt: standard("#45505e", { roughness: 0.95 }),
      pvc: standard("#eceef0", { roughness: 0.4 }),
      grate: standard("#2b2d30", { metalness: 0.3, roughness: 0.5 }),
      instrument: standard("#f2c200", { roughness: 0.45 }),
      tripod: standard("#d6d6d2", { metalness: 0.3, roughness: 0.4 }),
      rod: standard("#ffffff", { map: rodTexture(), roughness: 0.6 }),
      signal: standard(COLORS.signal, { emissive: COLORS.signal, emissiveIntensity: 0.4, roughness: 0.5 }),
      steel: standard("#d6d8da", { metalness: 0.4, roughness: 0.3 }),
      plate: standard("#5b6878", { metalness: 0.3, roughness: 0.45 }),
      deckTop: standard("#ffffff", { map: treadTexture(), metalness: 0.1, roughness: 0.6 }),
      deckSide: standard("#8e918b", { metalness: 0.15, roughness: 0.6 }),
      edge: standard("#6f7378", { metalness: 0.35, roughness: 0.4 }),
      cable: standard("#2d2f33", { roughness: 0.7 }),
      boothWall: standard("#eef0f2", { roughness: 0.6 }),
      boothRoof: standard("#4a5563", { roughness: 0.7 }),
      glass: standard("#a9cbea", { transparent: true, opacity: 0.35, roughness: 0.1, depthWrite: false }),
      dark: standard("#1e1f21", { roughness: 0.6 }),
      screen: standard("#141414", { emissive: COLORS.signal, emissiveIntensity: 0.9 }),
      // Camión
      cab: standard("#f6f6f4", { metalness: 0.1, roughness: 0.35 }),
      cargo: standard("#eeede9", { metalness: 0.05, roughness: 0.5 }),
      brand: standard("#f9e300", { metalness: 0.1, roughness: 0.45 }),
      chassis: standard("#1e1f21", { metalness: 0.2, roughness: 0.6 }),
      tire: standard("#151515"),
      hub: standard("#aeb8c3", { metalness: 0.4, roughness: 0.3 }),
      window: standard("#1c1d1f", { metalness: 0.3, roughness: 0.1 }),
      light: standard("#ffffff", { emissive: "#dfeeff", emissiveIntensity: 1.6 }),
    };
  }, []);
}

export type Materials = ReturnType<typeof useMaterials>;

/** Lleva la opacidad de un material hacia `opacity` (vistas de armadura y de empuje del suelo) */
export function fadeTo(material: THREE.Material, opacity: number, dt: number) {
  material.opacity = THREE.MathUtils.damp(material.opacity, opacity, 6, dt);
  material.depthWrite = material.opacity > 0.95;
}
