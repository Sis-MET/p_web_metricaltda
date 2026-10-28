import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { Store } from "@/lib/store";
import {
  APPROACH_LENGTH,
  TRUCK_SPAN,
  TRUCK_STOP,
  computeReading,
  type Layout,
  type ScaleReading,
  type TruckReading,
} from "./model";

const MAX_SPEED = 5.5; // m/s
const HOLD_SECONDS = 3.5;

type Phase = "approach" | "weigh" | "exit";

/** Lo que la escena decide en cada cuadro */
export type TruckControl = {
  /** El camión está en la escena */
  on: boolean;
  /** Avanza; si no, queda detenido donde está */
  moving: boolean;
  /** Terminó de cruzar: el próximo vuelve a entrar desde el inicio */
  onExit?: () => void;
};

/**
 * Un camión cruza la báscula: entra, se detiene centrado mientras el indicador se estabiliza y
 * sale. Mueve el grupo de `truckRef`, deja la carga real en `reading` (la usan las celdas) y
 * publica lo que muestra el indicador en `readings` (~10 veces por segundo, sin re-renderizar).
 * `parked`: empieza detenido sobre la plataforma.
 */
export function useTruckRun(layout: Layout, readings: Store<TruckReading>, control: () => TruckControl, parked = false) {
  const { half } = layout;
  const startX = -(half + APPROACH_LENGTH + 16);
  const endX = half + APPROACH_LENGTH + 16 + TRUCK_SPAN;

  const truckRef = useRef<THREE.Group>(null);
  /** Distancia recorrida: hace girar las ruedas */
  const spin = useRef(0);
  const sim = useRef({ phase: "approach" as Phase, x: startX, speed: MAX_SPEED, hold: 0 });
  const reading = useRef<ScaleReading>(computeReading(layout, startX));
  const displayed = useRef(0);
  /** 0..1: cuánto cambia la carga (acelera los pulsos de datos de la red) */
  const activity = useRef(0);
  const emitClock = useRef(0);
  const idle = useRef(false);

  // Otro largo de báscula: el recorrido vuelve a empezar
  useEffect(() => {
    sim.current = parked
      ? { phase: "weigh", x: TRUCK_STOP, speed: 0, hold: 0 }
      : { phase: "approach", x: startX, speed: MAX_SPEED, hold: 0 };
    idle.current = false;
  }, [layout, parked, startX]);

  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 0.05);
    const { on, moving, onExit } = control();
    const s = sim.current;
    if (truckRef.current) truckRef.current.visible = on;

    if (!on) {
      activity.current = THREE.MathUtils.damp(activity.current, 0, 3, dt);
      // Sin camión: vuelve a la entrada y el indicador a cero
      if (!idle.current) {
        idle.current = true;
        Object.assign(s, { phase: "approach", x: startX, speed: MAX_SPEED, hold: 0 });
        reading.current = computeReading(layout, startX);
        displayed.current = 0;
        readings.set({ ...reading.current, displayed: 0, stable: false });
      }
      return;
    }
    idle.current = false;

    const prevX = s.x;
    if (moving) {
      if (s.phase === "approach") {
        const remaining = TRUCK_STOP - s.x;
        s.speed = MAX_SPEED * THREE.MathUtils.clamp(remaining / 7, 0.06, 1);
        s.x = Math.min(TRUCK_STOP, s.x + s.speed * dt);
        if (TRUCK_STOP - s.x < 0.005) Object.assign(s, { x: TRUCK_STOP, phase: "weigh", hold: 0, speed: 0 });
      } else if (s.phase === "weigh") {
        s.hold += dt;
        if (s.hold > HOLD_SECONDS) s.phase = "exit";
      } else {
        s.speed = Math.min(MAX_SPEED, s.speed + 2.2 * dt);
        s.x += s.speed * dt;
        if (s.x > endX) {
          Object.assign(s, { phase: "approach", x: startX, speed: MAX_SPEED });
          onExit?.();
        }
      }
    }
    const moved = s.x - prevX;
    spin.current += Math.max(moved, 0);
    truckRef.current?.position.set(s.x, 0, 0);

    // El indicador se estabiliza como en un terminal real
    const r = computeReading(layout, s.x);
    const changed = r.total !== reading.current.total;
    reading.current = r;
    displayed.current = THREE.MathUtils.damp(displayed.current, r.total, 5, dt);
    if (Math.abs(displayed.current - r.total) < 1) displayed.current = r.total;
    activity.current = THREE.MathUtils.damp(activity.current, changed || moved > 0.001 ? 1 : 0, 3, dt);
    const stable = s.phase === "weigh" && r.total > 0 && Math.abs(displayed.current - r.total) < 10;

    emitClock.current += dt;
    if (emitClock.current > 0.1) {
      emitClock.current = 0;
      readings.set({ ...r, displayed: displayed.current, stable });
    }
  });

  return { truckRef, spin, reading, activity };
}
