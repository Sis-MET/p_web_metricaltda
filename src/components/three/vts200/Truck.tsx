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

/** Volqueta: tractocamión con semirremolque volcador cargado de mineral; el origen es el eje delantero a nivel del piso */
export function Truck({
  truckRef,
  spinRef,
  materials,
}: {
  truckRef: RefObject<THREE.Group | null>;
  spinRef: RefObject<number>;
  materials: Materials;
}) {
  // Tolva: de la quinta rueda a pasar el último eje
  const tubFront = -2.2;
  const tubBack = -TRUCK_SPAN - 1.4;
  const tubLength = tubFront - tubBack;
  const tubX = (tubFront + tubBack) / 2;
  const tubFloor = 1.45;
  const tubHeight = 1.55;
  const rearPair = TRUCK.slice(-2);

  return (
    <group ref={truckRef} visible={false}>
      {/* Chasis del tractor */}
      <mesh material={materials.chassis} position={[-2.25, 0.92, 0]} castShadow>
        <boxGeometry args={[6.9, 0.24, 1.1]} />
      </mesh>

      {/* Cabina con parasol, espejos y parachoques */}
      <RoundedBox args={[2.45, 2.45, 2.45]} radius={0.14} smoothness={3} position={[0.18, 2.2, 0]} material={materials.cab} castShadow />
      <mesh material={materials.window} position={[1.41, 2.72, 0]}>
        <boxGeometry args={[0.04, 0.95, 2.1]} />
      </mesh>
      <mesh material={materials.chassis} position={[1.48, 3.28, 0]}>
        <boxGeometry args={[0.2, 0.08, 2.3]} />
      </mesh>
      {[-1, 1].map((s) => (
        <group key={s}>
          <mesh material={materials.window} position={[0.6, 2.75, s * 1.226]}>
            <boxGeometry args={[0.9, 0.7, 0.02]} />
          </mesh>
          <mesh material={materials.chassis} position={[1.35, 2.6, s * 1.42]}>
            <boxGeometry args={[0.06, 0.5, 0.18]} />
          </mesh>
        </group>
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
      {/* Escape vertical detrás de la cabina */}
      <mesh material={materials.hub} position={[-1.2, 2.9, 1.0]}>
        <cylinderGeometry args={[0.07, 0.07, 1.6, 10]} />
      </mesh>

      {/* Quinta rueda y bastidor del semirremolque */}
      <mesh material={materials.chassis} position={[-4.2, 1.18, 0]}>
        <cylinderGeometry args={[0.5, 0.5, 0.08, 20]} />
      </mesh>
      <mesh material={materials.chassis} position={[tubX, tubFloor - 0.2, 0]} castShadow>
        <boxGeometry args={[tubLength, 0.28, 1.1]} />
      </mesh>
      <mesh material={materials.chassis} position={[(rearPair[0].offset + rearPair[1].offset) / 2, tubFloor - 0.45, 0]}>
        <boxGeometry args={[3.2, 0.3, 1.1]} />
      </mesh>

      {/* Tolva abierta: piso, costados, frente alto y compuerta trasera */}
      <mesh material={materials.tub} position={[tubX, tubFloor, 0]} castShadow>
        <boxGeometry args={[tubLength, 0.12, 2.5]} />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} material={materials.tub} position={[tubX, tubFloor + tubHeight / 2, s * 1.21]} castShadow>
          <boxGeometry args={[tubLength, tubHeight, 0.08]} />
        </mesh>
      ))}
      <mesh material={materials.tub} position={[tubFront - 0.04, tubFloor + tubHeight / 2 + 0.15, 0]} castShadow>
        <boxGeometry args={[0.08, tubHeight + 0.3, 2.5]} />
      </mesh>
      <mesh material={materials.tub} position={[tubBack + 0.05, tubFloor + tubHeight / 2, 0]} castShadow>
        <boxGeometry args={[0.1, tubHeight, 2.5]} />
      </mesh>
      {/* Refuerzos verticales de los costados y franja amarilla */}
      {[-1, 1].map((s) =>
        Array.from({ length: 6 }, (_, i) => (
          <mesh key={`${s}${i}`} material={materials.chassis} position={[tubBack + 0.6 + (i * (tubLength - 1.2)) / 5, tubFloor + tubHeight / 2, s * 1.26]}>
            <boxGeometry args={[0.08, tubHeight, 0.04]} />
          </mesh>
        ))
      )}
      <mesh material={materials.brand} position={[tubX, tubFloor + 0.25, 0]}>
        <boxGeometry args={[tubLength + 0.01, 0.14, 2.55]} />
      </mesh>
      {/* Carga de mineral: un cerro alargado que sobresale de la tolva */}
      <mesh material={materials.oreDark} position={[tubX, tubFloor + tubHeight - 0.25, 0]} scale={[tubLength / 2 - 0.15, 0.75, 1.17]} castShadow>
        <sphereGeometry args={[1, 28, 10, 0, Math.PI * 2, 0, Math.PI / 2]} />
      </mesh>

      {TRUCK.map((axle) => (
        <Wheels key={axle.offset} axle={axle} spinRef={spinRef} materials={materials} />
      ))}
    </group>
  );
}
