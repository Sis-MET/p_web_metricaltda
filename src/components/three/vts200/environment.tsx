"use client";

import { useEffect, useMemo } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";

/** Degradado vertical del entorno: [posición de arriba (0) abajo (1), color] */
export type GradientStops = readonly (readonly [number, THREE.ColorRepresentation])[];

/**
 * Reflejos de la escena a partir de un degradado (cielo → suelo) filtrado en un PMREM pequeño:
 * los metales reflejan su entorno sin descargar ninguna imagen. `stops` debe ser una constante.
 */
export function GradientEnvironment({ stops }: { stops: GradientStops }) {
  const gl = useThree((state) => state.gl);
  const target = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 128;
    canvas.height = 64;
    const ctx = canvas.getContext("2d")!;
    const gradient = ctx.createLinearGradient(0, 0, 0, 64);
    for (const [offset, color] of stops) {
      gradient.addColorStop(offset, `#${new THREE.Color(color).getHexString(THREE.SRGBColorSpace)}`);
    }
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 128, 64);
    const texture = new THREE.CanvasTexture(canvas);
    texture.mapping = THREE.EquirectangularReflectionMapping;
    texture.colorSpace = THREE.SRGBColorSpace;
    const pmrem = new THREE.PMREMGenerator(gl);
    const result = pmrem.fromEquirectangular(texture);
    pmrem.dispose();
    texture.dispose();
    return result;
  }, [gl, stops]);
  useEffect(() => () => target.dispose(), [target]);

  return <primitive object={target.texture} attach="environment" />;
}
