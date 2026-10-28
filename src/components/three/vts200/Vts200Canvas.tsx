"use client";

import { useState, type ReactNode } from "react";
import { Canvas } from "@react-three/fiber";
import { PerformanceMonitor } from "@react-three/drei";
import { ADAPTIVE_DPR, type Vec3 } from "../useResponsiveFraming";
import { useSceneLoop, type SceneLoopProps } from "../useSceneLoop";

/**
 * Lienzo de las escenas de la VTS200: compila los shaders antes de dibujar, anima solo mientras
 * se ve y ajusta la resolución a los fps; si el equipo no da abasto, además apaga las sombras.
 * `still`: imagen fija para las capturas (resolución 1×, sin ajustes).
 */
export function Vts200Canvas({
  active,
  onReady,
  still = false,
  camera,
  label,
  children,
}: SceneLoopProps & {
  still?: boolean;
  camera: { position: Vec3; fov: number; near: number; far: number };
  label: string;
  /** La escena; `castShadows` pasa a false si el equipo no da abasto */
  children: (castShadows: boolean) => ReactNode;
}) {
  const { frameloop, onCreated } = useSceneLoop({ active, onReady });
  const [dpr, setDpr] = useState(ADAPTIVE_DPR.initial);
  const [shadows, setShadows] = useState(true);

  return (
    <Canvas
      // PCF explícito: con `true` r3f pide PCFSoft y three recompila los shaders al dibujar la primera sombra
      shadows="percentage"
      dpr={still ? 1 : [1, dpr]}
      frameloop={frameloop}
      onCreated={onCreated}
      camera={camera}
      gl={{ antialias: true, powerPreference: "high-performance", stencil: false }}
      aria-label={label}
      fallback={
        <div className="flex h-full items-center justify-center p-8 text-center text-sm text-white/70">
          Su navegador no admite gráficos 3D (WebGL).
        </div>
      }
    >
      {!still && (
        <PerformanceMonitor
          flipflops={3}
          onChange={({ factor }) => setDpr(ADAPTIVE_DPR.fromFactor(factor))}
          onFallback={() => {
            setDpr(ADAPTIVE_DPR.min);
            setShadows(false);
          }}
        />
      )}
      {children(shadows)}
    </Canvas>
  );
}
