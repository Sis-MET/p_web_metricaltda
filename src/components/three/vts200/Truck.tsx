"use client";

import { useRef, type RefObject } from "react";
import { useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import type { Materials } from "./materials";
import { TRUCK, TRUCK_SPAN, type Axle } from "./model";

export const WHEEL_RADIUS = 0.52;

function Wheels({ axle, spinRef, materials }: { axle: Axle; spinRef: RefObject<number>; materials: Materials }) {
  const wheels = useRef<(THREE.Group | null)[]>([]);
  const width = axle.dual ? 0.62 : 0.34;

  useFrame(() => {
    for (const wheel of wheels.current) if (wheel) wheel.rotation.z = -spinRef.current / WHEEL_RADIUS;
  });

  return (
    <>
      {[-1, 1].map((side, i) => (
        <group
          key={side}
          position={[axle.offset, WHEEL_RADIUS, side * (1.25 - width / 2 + 0.05)]}
          ref={(el) => {
            wheels.current[i] = el;
          }}
        >
          <mesh material={materials.tire} rotation-x={Math.PI / 2} castShadow>
            <cylinderGeometry args={[WHEEL_RADIUS, WHEEL_RADIUS, width, 28]} />
          </mesh>
          <mesh material={materials.hub} rotation-x={Math.PI / 2} position={[0, 0, side * (width / 2 + 0.002)]}>
            <cylinderGeometry args={[0.26, 0.26, 0.02, 20]} />
          </mesh>
        </group>
      ))}
    </>
  );
}

/** Tractocamión con semirremolque; el origen es el eje delantero a nivel del piso */
export function Truck({
  truckRef,
  spinRef,
  materials,
}: {
  truckRef: RefObject<THREE.Group | null>;
  spinRef: RefObject<number>;
  materials: Materials;
}) {
  const cargoStart = -2.4;
  const cargoEnd = -TRUCK_SPAN - 1.6;
  const cargoLength = cargoStart - cargoEnd;
  const cargoBottom = 1.35;
  const cargoHeight = 2.65;
  const rearPair = TRUCK.slice(-2);

  return (
    <group ref={truckRef} visible={false}>
      {/* Chasis del tractor */}
      <mesh material={materials.chassis} position={[-2.25, 0.92, 0]} castShadow>
        <boxGeometry args={[6.9, 0.24, 1.1]} />
      </mesh>

      {/* Cabina */}
      <RoundedBox args={[2.45, 2.45, 2.45]} radius={0.14} smoothness={3} position={[0.18, 2.2, 0]} material={materials.cab} castShadow />
      <mesh material={materials.window} position={[1.41, 2.72, 0]}>
        <boxGeometry args={[0.04, 0.95, 2.1]} />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} material={materials.window} position={[0.6, 2.75, s * 1.226]}>
          <boxGeometry args={[0.9, 0.7, 0.02]} />
        </mesh>
      ))}
      <mesh material={materials.brand} position={[0.18, 1.45, 0]}>
        <boxGeometry args={[2.47, 0.22, 2.47]} />
      </mesh>
      <mesh material={materials.chassis} position={[1.46, 1.15, 0]} castShadow>
        <boxGeometry args={[0.16, 0.36, 2.35]} />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} material={materials.light} position={[1.55, 1.18, s * 0.9]}>
          <boxGeometry args={[0.02, 0.12, 0.32]} />
        </mesh>
      ))}

      {/* Quinta rueda y semirremolque */}
      <mesh material={materials.chassis} position={[-4.2, 1.18, 0]}>
        <cylinderGeometry args={[0.5, 0.5, 0.08, 20]} />
      </mesh>
      <RoundedBox
        args={[cargoLength, cargoHeight, 2.5]}
        radius={0.06}
        smoothness={2}
        position={[(cargoStart + cargoEnd) / 2, cargoBottom + cargoHeight / 2, 0]}
        material={materials.cargo}
        castShadow
      />
      <mesh material={materials.brand} position={[(cargoStart + cargoEnd) / 2, cargoBottom + 0.35, 0]}>
        <boxGeometry args={[cargoLength + 0.01, 0.16, 2.52]} />
      </mesh>
      <mesh material={materials.chassis} position={[(rearPair[0].offset + rearPair[1].offset) / 2, cargoBottom - 0.15, 0]}>
        <boxGeometry args={[3.2, 0.3, 1.1]} />
      </mesh>

      {TRUCK.map((axle) => (
        <Wheels key={axle.offset} axle={axle} spinRef={spinRef} materials={materials} />
      ))}
    </group>
  );
}
