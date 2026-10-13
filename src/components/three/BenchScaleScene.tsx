"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  CameraControls,
  CameraControlsImpl,
  Environment,
  Lightformer,
  PerformanceMonitor,
  RoundedBox,
} from "@react-three/drei";
import * as THREE from "three";
import {
  BASE,
  BASE_TOP,
  BENCH_PHASES,
  CELL_TOP,
  EXPLODED as EXPLODED_OFFSETS,
  PAN_TOP,
  PAN_Y,
  PART_LABELS,
  PRODUCT,
  PRODUCT_WEIGHT,
  SUPPORT_Y,
  benchStateAt,
  displayText,
  phaseAt,
  phaseStart,
} from "./benchScaleModel";
import { PANEL_H, PANEL_W, drawPanel } from "./benchPanel";
import { ADAPTIVE_DPR, scaleView, useResponsiveFraming, type Shift, type View } from "./useResponsiveFraming";
import { ScreenAnchors } from "./ScreenAnchors";
import type { Store } from "@/lib/store";

const EXPLODED = {
  pan: new THREE.Vector3(...EXPLODED_OFFSETS.pan),
  support: new THREE.Vector3(...EXPLODED_OFFSETS.support),
};

const LABEL_POINTS = PART_LABELS.map((p) => p.position);

const CAMERA: Record<"close" | "wide", View> = {
  close: { position: [3.6, 3.0, 5.6], target: [0, 0.95, 0] },
  wide: { position: [1.6, 6.6, 10.8], target: [0, 1.15, 0] },
};

const COLORS = {
  background: "#121211",
  plastic: "#f3f5f8",
  panel: "#1f44a3",
  support: "#9aa6b2",
  aluminium: "#c9d0d8",
  cheese: "#f0cb68",
  water: "#9fd6ff",
};

const DROPS = 42;

export type BenchSceneState = {
  phase: number;
  text: string;
  stable: boolean;
  verified: boolean;
  before: number | null;
  after: number | null;
};

export type BenchSceneProps = {
  playing: boolean;
  /** Saltar a un paso: cambia `id` para repetir el mismo paso */
  seek: { phase: number; id: number };
  resetView: number;
  active: boolean;
  /** Desplazamiento de la imagen para dejar espacio al texto superpuesto */
  shift: Shift;
  /** Estado para el panel (solo se publica cuando cambia) */
  states: Store<BenchSceneState>;
  /** Etiquetas de las piezas (DOM) que la escena posiciona en pantalla */
  labelElements: RefObject<(HTMLElement | null)[]>;
};

/* ─── Panel frontal con display ─────────────────────────────────────────── */

function FrontPanel({ stateRef }: { stateRef: React.RefObject<{ text: string; stable: boolean; zero: boolean; on: boolean }> }) {
  const material = useRef<THREE.MeshStandardMaterial>(null);
  const canvases = useRef<{
    color: CanvasRenderingContext2D;
    glow: CanvasRenderingContext2D;
    map: THREE.CanvasTexture;
    emissive: THREE.CanvasTexture;
    signature: string;
    lastDraw: number;
  } | null>(null);

  // Los canvas y texturas se crean en el cliente y se asignan al material por ref
  useEffect(() => {
    const make = () => {
      const canvas = document.createElement("canvas");
      canvas.width = PANEL_W;
      canvas.height = PANEL_H;
      return canvas;
    };
    const colorCanvas = make();
    const glowCanvas = make();
    const map = new THREE.CanvasTexture(colorCanvas);
    const emissive = new THREE.CanvasTexture(glowCanvas);
    map.colorSpace = THREE.SRGBColorSpace;
    emissive.colorSpace = THREE.SRGBColorSpace;
    map.anisotropy = 4;

    canvases.current = {
      color: colorCanvas.getContext("2d")!,
      glow: glowCanvas.getContext("2d")!,
      map,
      emissive,
      signature: "",
      lastDraw: 0,
    };
    if (material.current) {
      material.current.map = map;
      material.current.emissiveMap = emissive;
      material.current.needsUpdate = true;
    }
    return () => {
      map.dispose();
      emissive.dispose();
      canvases.current = null;
    };
  }, []);

  // Redibuja solo cuando cambia lo que muestra el display, como máximo ~12 veces por segundo
  // (cada redibujo sube dos texturas a la GPU).
  // Ojo: no usar el reloj de R3F, se reinicia a 0 cada vez que la escena se pausa y reanuda,
  // y el display quedaba congelado hasta que el reloj alcanzaba su valor anterior.
  useFrame(() => {
    const c = canvases.current;
    const s = stateRef.current;
    if (!c || !s) return;
    const signature = `${s.text}|${s.stable}|${s.zero}|${s.on}`;
    if (signature === c.signature) return;
    const now = performance.now() / 1000;
    if (now - c.lastDraw < 0.08 && c.signature !== "") return;
    c.lastDraw = now;
    c.signature = signature;
    drawPanel(c.color, c.glow, s);
    c.map.needsUpdate = true;
    c.emissive.needsUpdate = true;
  });

  return (
    // Adelantado respecto de la base: por la inclinación, el borde superior quedaba dentro de la carcasa
    <group position={[0, 0.44, BASE.d / 2 + 0.09]} rotation-x={-0.28}>
      <RoundedBox args={[3.0, 0.6, 0.06]} radius={0.025} smoothness={3}>
        <meshStandardMaterial color={COLORS.panel} roughness={0.35} metalness={0.1} />
      </RoundedBox>
      <mesh position={[0, 0, 0.031]}>
        <planeGeometry args={[2.88, 0.54]} />
        <meshStandardMaterial ref={material} roughness={0.3} metalness={0.05} emissive="#ffffff" emissiveIntensity={1.4} />
      </mesh>
    </group>
  );
}

/* ─── Sombras suaves precalculadas ──────────────────────────────────────── */

// Una sola textura de degradado radial para todas las sombras.
// A diferencia de ContactShadows, no vuelve a renderizar la escena en cada cuadro.
let blobTexture: THREE.CanvasTexture | null = null;
function getBlobTexture() {
  if (blobTexture) return blobTexture;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 128;
  const ctx = canvas.getContext("2d")!;
  const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, "rgba(0,0,0,0.9)");
  g.addColorStop(0.55, "rgba(0,0,0,0.45)");
  g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 128, 128);
  blobTexture = new THREE.CanvasTexture(canvas);
  return blobTexture;
}

function BlobShadow({
  size,
  opacity,
  meshRef,
}: {
  size: [number, number];
  opacity: number;
  meshRef?: RefObject<THREE.Mesh | null>;
}) {
  const material = useRef<THREE.MeshBasicMaterial>(null);

  useEffect(() => {
    const mat = material.current;
    if (!mat) return;
    mat.map = getBlobTexture();
    mat.opacity = opacity;
    mat.needsUpdate = true;
  }, [opacity]);

  return (
    <mesh ref={meshRef} rotation-x={-Math.PI / 2} position={[0, 0.003, 0]} renderOrder={-1}>
      <planeGeometry args={size} />
      <meshBasicMaterial ref={material} color="#000000" transparent opacity={0} depthWrite={false} />
    </mesh>
  );
}

/* ─── Agua de limpieza ──────────────────────────────────────────────────── */

/** Pseudoaleatorio determinista (el render debe ser puro) */
const hash = (i: number, k: number) => {
  const v = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453;
  return v - Math.floor(v);
};

// Cada gota cae sobre una de las tres piezas: plato, base o soporte
const createDrops = () =>
  Array.from({ length: DROPS }, (_, i) => ({
    zone: i % 3,
    x: (hash(i, 1) - 0.5) * 2.4,
    z: (hash(i, 2) - 0.5) * 1.8,
    y: 2 + hash(i, 3) * 3,
    speed: 4 + hash(i, 4) * 2,
  }));

function Water({ intensityRef, explodeRef }: { intensityRef: React.RefObject<number>; explodeRef: React.RefObject<number> }) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const sim = useRef({
    drops: createDrops(),
    matrix: new THREE.Matrix4(),
    scale: new THREE.Vector3(),
    position: new THREE.Vector3(),
    quaternion: new THREE.Quaternion(),
  });

  useFrame((_, dt) => {
    const m = mesh.current;
    if (!m) return;
    const { drops, matrix, scale, position, quaternion } = sim.current;
    const intensity = intensityRef.current ?? 0;
    const e = explodeRef.current ?? 0;
    drops.forEach((d, i) => {
      const zoneX = d.zone === 0 ? EXPLODED.pan.x * e : d.zone === 2 ? EXPLODED.support.x * e : 0;
      const floor =
        d.zone === 0 ? PAN_TOP + EXPLODED.pan.y * e : d.zone === 2 ? SUPPORT_Y + 0.03 + EXPLODED.support.y * e : CELL_TOP;
      d.y -= d.speed * dt;
      if (d.y < floor) d.y = floor + 2 + Math.random() * 2.5;
      position.set(zoneX + d.x, d.y, d.z);
      const s = intensity * (d.y - floor < 0.15 ? 1.6 : 1);
      scale.set(s, s * 1.8, s);
      matrix.compose(position, quaternion, scale);
      m.setMatrixAt(i, matrix);
    });
    m.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, DROPS]} frustumCulled={false}>
      <sphereGeometry args={[0.035, 8, 8]} />
      <meshStandardMaterial color={COLORS.water} transparent opacity={0.75} roughness={0.1} metalness={0.2} />
    </instancedMesh>
  );
}

/* ─── Mundo ─────────────────────────────────────────────────────────────── */

function World({ playing, seek, resetView, shift, states, labelElements }: Omit<BenchSceneProps, "active">) {
  const controls = useRef<CameraControls>(null);
  const pan = useRef<THREE.Group>(null);
  const support = useRef<THREE.Group>(null);
  const product = useRef<THREE.Group>(null);
  const gauge = useRef<THREE.MeshStandardMaterial>(null);
  const panShadow = useRef<THREE.Mesh>(null);
  const supportShadow = useRef<THREE.Mesh>(null);

  const time = useRef(0);
  const playingRef = useRef(playing);
  const displayed = useRef(0);
  const explode = useRef(0);
  const water = useRef(0);
  const panel = useRef({ text: "0.000", stable: false, zero: true, on: true });
  const wide = useRef(false);
  const record = useRef<{ before: number | null; after: number | null }>({ before: null, after: null });
  useEffect(() => {
    playingRef.current = playing;
  }, [playing]);

  // En pausa desde el inicio: mostrar el producto ya pesado
  useEffect(() => {
    if (!playingRef.current) time.current = BENCH_PHASES[0].duration * 0.7;
  }, []);

  useEffect(() => {
    if (seek.id > 0) time.current = phaseStart(seek.phase) + 0.001;
  }, [seek]);

  useEffect(() => {
    const c = controls.current;
    if (!c) return;
    c.mouseButtons.wheel = CameraControlsImpl.ACTION.NONE;
    c.mouseButtons.middle = CameraControlsImpl.ACTION.NONE;
    c.touches.two = CameraControlsImpl.ACTION.TOUCH_DOLLY_TRUCK;
    c.touches.three = CameraControlsImpl.ACTION.NONE;
  }, []);

  const { distance } = useResponsiveFraming(controls, shift);

  // Encuadre inicial y al cambiar el tamaño del visor
  useEffect(() => {
    controls.current?.setLookAt(...scaleView(wide.current ? CAMERA.wide : CAMERA.close, distance), false);
  }, [distance]);

  useEffect(() => {
    if (resetView === 0) return;
    controls.current?.setLookAt(...scaleView(wide.current ? CAMERA.wide : CAMERA.close, distance), true);
  }, [resetView, distance]);

  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 0.05);
    if (playingRef.current) time.current += dt;

    const { index, p } = phaseAt(time.current);
    const s = benchStateAt(index, p);
    explode.current = s.explode;
    water.current = s.water;

    // Piezas
    const e = s.explode;
    pan.current?.position.set(EXPLODED.pan.x * e, PAN_Y + EXPLODED.pan.y * e, EXPLODED.pan.z * e);
    if (pan.current) pan.current.rotation.z = 0.1 * e;
    support.current?.position.set(EXPLODED.support.x * e, SUPPORT_Y + EXPLODED.support.y * e, 0);
    // Las sombras de las piezas separadas las siguen sobre la mesa (armada, coinciden con la de la base)
    if (panShadow.current) {
      panShadow.current.position.set(EXPLODED.pan.x * e, 0.004, EXPLODED.pan.z * e);
      panShadow.current.visible = e > 0.02;
    }
    if (supportShadow.current) {
      supportShadow.current.position.set(EXPLODED.support.x * e, 0.005, 0);
      supportShadow.current.visible = e > 0.02;
    }
    if (product.current) {
      product.current.position.set(0, PAN_TOP + PRODUCT.height / 2 + s.product.lift, 0);
      product.current.scale.setScalar(Math.max(0.0001, s.product.scale));
      product.current.visible = s.product.scale > 0.01;
    }

    // La cámara se abre para mostrar las piezas separadas
    const wantWide = e > 0.5;
    if (wantWide !== wide.current) {
      wide.current = wantWide;
      controls.current?.setLookAt(...scaleView(wantWide ? CAMERA.wide : CAMERA.close, distance), true);
    }

    // Lectura
    const on = s.power === "on";
    const load = on && s.product.onPan && e < 0.01 ? PRODUCT_WEIGHT : 0;
    if (!on) displayed.current = 0;
    else displayed.current = THREE.MathUtils.damp(displayed.current, load, 7, dt);
    if (Math.abs(displayed.current - load) < 0.0005) displayed.current = load;
    const stable = on && Math.abs(displayed.current - load) < 0.001;
    const text = displayText(s.power, displayed.current);
    panel.current = { text, stable, zero: on && load === 0 && stable, on: s.power !== "off" };

    if (gauge.current) {
      const target = e < 0.01 ? 0.2 + (displayed.current / PRODUCT_WEIGHT) * 2.6 : 0.6;
      gauge.current.emissiveIntensity = THREE.MathUtils.damp(gauge.current.emissiveIntensity, target, 8, dt);
    }

    // Verificación: misma lectura antes de limpiar y después de armar.
    // El resultado queda visible durante el "Pesar" siguiente y se reinicia al desmontar.
    if (index === 1) record.current.after = null;
    if (index === 0 && stable && load > 0) record.current.before = displayed.current;
    const verified = index === 3 && p > 0.82 && stable && load > 0;
    if (verified) record.current.after = displayed.current;

    // Al panel: solo cuando algo cambia, y solo a los componentes suscritos
    // Se compara con lo que tiene el store (y no con lo último enviado): si el store se
    // reemplaza (p. ej. al recargar en caliente), el panel se resincroniza en el siguiente cuadro
    const current = states.get();
    if (
      current.phase !== index ||
      current.text !== text ||
      current.stable !== stable ||
      current.verified !== verified ||
      current.before !== record.current.before ||
      current.after !== record.current.after
    ) {
      states.set({ phase: index, text, stable, verified, ...record.current });
    }
  });

  return (
    <>
      <color attach="background" args={[COLORS.background]} />
      <hemisphereLight args={["#d4e5ff", "#0a2342", 0.9]} />
      <directionalLight position={[4, 8, 5]} intensity={2.2} />
      <Environment resolution={256} frames={1}>
        <Lightformer intensity={2.2} position={[0, 6, 0]} rotation-x={Math.PI / 2} scale={[12, 6, 1]} />
        <Lightformer intensity={1.4} position={[-6, 2, 5]} scale={[6, 2, 1]} color="#fff8e6" />
        <Lightformer intensity={0.45} position={[6, 2, -5]} scale={[6, 2, 1]} color="#f9e300" />
      </Environment>

      {/* Mesa */}
      <mesh rotation-x={-Math.PI / 2} position={[0, -0.001, 0]}>
        <circleGeometry args={[40, 64]} />
        <meshStandardMaterial color="#0c2546" roughness={0.9} />
      </mesh>
      {/* Sombras: la base fija y las piezas que se separan */}
      <BlobShadow size={[4.6, 3.8]} opacity={0.75} />
      <BlobShadow size={[4.2, 3.4]} opacity={0.45} meshRef={panShadow} />
      <BlobShadow size={[3.0, 2.6]} opacity={0.4} meshRef={supportShadow} />

      {/* Base */}
      <RoundedBox args={[BASE.w, BASE.h, BASE.d]} radius={0.1} smoothness={4} position={[0, BASE.bottom + BASE.h / 2, 0]}>
        <meshStandardMaterial color={COLORS.plastic} roughness={0.42} />
      </RoundedBox>
      <mesh rotation-x={-Math.PI / 2} position={[0, BASE_TOP + 0.002, -0.05]}>
        <planeGeometry args={[2.7, 2.0]} />
        <meshStandardMaterial color="#e1e6ec" roughness={0.5} />
      </mesh>
      {[-1, 1].flatMap((sx) =>
        [-1, 1].map((sz) => (
          <mesh key={`${sx}${sz}`} position={[sx * 1.35, 0.04, sz * 1.05]}>
            <cylinderGeometry args={[0.13, 0.15, 0.08, 16]} />
            <meshStandardMaterial color="#2a3036" roughness={0.8} />
          </mesh>
        ))
      )}
      <FrontPanel stateRef={panel} />

      {/* Celda de carga (punto único) */}
      <mesh position={[0, (BASE_TOP + CELL_TOP) / 2, 0]}>
        <boxGeometry args={[1.3, CELL_TOP - BASE_TOP, 0.36]} />
        <meshStandardMaterial color={COLORS.aluminium} metalness={0.9} roughness={0.28} />
      </mesh>
      <mesh position={[0, CELL_TOP + 0.003, 0]}>
        <boxGeometry args={[0.36, 0.006, 0.2]} />
        <meshStandardMaterial ref={gauge} color="#1b1b1a" emissive="#f9e300" emissiveIntensity={0.2} />
      </mesh>

      {/* Soporte del plato */}
      <group ref={support} position={[0, SUPPORT_Y, 0]}>
        <mesh>
          <boxGeometry args={[2.3, 0.05, 0.14]} />
          <meshStandardMaterial color={COLORS.support} metalness={0.6} roughness={0.35} />
        </mesh>
        <mesh>
          <boxGeometry args={[0.14, 0.05, 1.9]} />
          <meshStandardMaterial color={COLORS.support} metalness={0.6} roughness={0.35} />
        </mesh>
        <mesh position={[0, -0.02, 0]}>
          <cylinderGeometry args={[0.14, 0.14, 0.07, 20]} />
          <meshStandardMaterial color={COLORS.support} metalness={0.6} roughness={0.35} />
        </mesh>
      </group>

      {/* Plato */}
      <group ref={pan} position={[0, PAN_Y, 0]}>
        <RoundedBox args={[3.05, PAN_TOP - 1.02, 2.45]} radius={0.03} smoothness={3}>
          <meshStandardMaterial color="#f7f8fa" roughness={0.28} metalness={0.05} />
        </RoundedBox>
      </group>

      {/* Producto */}
      <group ref={product} position={[0, PAN_TOP + PRODUCT.height / 2, 0]}>
        <mesh>
          <cylinderGeometry args={[PRODUCT.radius, PRODUCT.radius, PRODUCT.height, 40]} />
          <meshStandardMaterial color={COLORS.cheese} roughness={0.6} />
        </mesh>
        <mesh position={[0, PRODUCT.height / 2 + 0.001, 0]} rotation-x={-Math.PI / 2}>
          <circleGeometry args={[PRODUCT.radius - 0.04, 40]} />
          <meshStandardMaterial color="#f6db8e" roughness={0.6} />
        </mesh>
      </group>

      <Water intensityRef={water} explodeRef={explode} />

      {/* Etiquetas de las piezas: elementos DOM posicionados desde aquí, visibles con la balanza desmontada */}
      <ScreenAnchors points={LABEL_POINTS} elements={labelElements} isVisible={() => explode.current > 0.7} />

      <CameraControls
        ref={controls}
        makeDefault
        minDistance={3}
        maxDistance={16 * distance}
        maxPolarAngle={Math.PI / 2.1}
        smoothTime={0.7}
      />
    </>
  );
}

export default function BenchScaleScene({ active, ...props }: BenchSceneProps) {
  const [dpr, setDpr] = useState(ADAPTIVE_DPR.initial);

  return (
    <Canvas
      dpr={[1, dpr]}
      // Fuera de pantalla: "demand" renderiza solo al montar (compila shaders por adelantado) y luego se detiene
      frameloop={active ? "always" : "demand"}
      camera={{ position: [...CAMERA.close.position], fov: 35, near: 0.1, far: 80 }}
      gl={{ antialias: true, powerPreference: "high-performance", stencil: false }}
      aria-label="Modelo 3D interactivo de la balanza de mesa BPA121"
      fallback={
        <div className="flex h-full items-center justify-center p-8 text-center text-sm text-white/70">
          Su navegador no admite gráficos 3D (WebGL).
        </div>
      }
    >
      <PerformanceMonitor
        flipflops={3}
        onChange={({ factor }) => setDpr(ADAPTIVE_DPR.fromFactor(factor))}
        onFallback={() => setDpr(ADAPTIVE_DPR.min)}
      />
      <World {...props} />
    </Canvas>
  );
}
