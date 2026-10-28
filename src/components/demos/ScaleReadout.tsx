"use client";

import type { RefObject } from "react";
import { FOCUS_CELL, TRUCK, type Cell, type TruckReading } from "@/components/three/vts200/model";
import { VTS200 } from "@/content/truckScaleProject";
import { useStore, type Store } from "@/lib/store";
import { cn } from "@/lib/utils";
import { HmiPanel, StatusLed } from "./DemoShell";

// Lo que muestran los demos de la báscula camionera mientras un camión la cruza

const kg = new Intl.NumberFormat("es-BO", { maximumFractionDigits: 0 });
const tonnes = new Intl.NumberFormat("es-BO", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const toDivision = (value: number) => Math.round(value / VTS200.division) * VTS200.division;

/** Indicador de la caseta: peso bruto en divisiones de la báscula y su estado */
export function ScaleIndicator({
  readings,
  capacity,
  className,
}: {
  readings: Store<TruckReading>;
  capacity: number;
  className?: string;
}) {
  const r = useStore(readings);
  const status = r.stable ? (
    <StatusLed tone="ok" label="Estable" />
  ) : r.total > 0 ? (
    <StatusLed tone="busy" label="En movimiento" />
  ) : (
    <StatusLed tone="off" label="Sin carga" />
  );

  return (
    <HmiPanel title="Indicador · Caseta" status={status} className={cn("w-full sm:w-80", className)}>
      <div className="flex items-center justify-between gap-3 px-4 py-2 sm:block sm:py-3" aria-live="polite" aria-atomic="true">
        <p className="text-[10px] uppercase tracking-[0.14em] text-white/45">Peso bruto</p>
        <p className="text-right text-2xl font-semibold tabular-nums tracking-tight text-white sm:mt-1 sm:text-3xl">
          {kg.format(toDivision(r.displayed))}
          <span className="ml-1.5 text-sm font-medium text-white/45">kg</span>
        </p>
        <div className="mt-2 hidden items-center justify-between gap-2 text-[10px] uppercase tracking-wider text-white/50 sm:flex">
          <span className={cn(r.total === 0 && "text-sun-400")}>→0←</span>
          <span>
            Ejes {r.axlesOnDeck}/{TRUCK.length}
          </span>
          <span>
            Máx {kg.format(capacity)} · d {VTS200.division}
          </span>
        </div>
      </div>
    </HmiPanel>
  );
}

/** Lectura de cada celda sobre el modelo: la escena las posiciona y muestra en cada cuadro */
export function CellTags({
  cells,
  readings,
  elements,
}: {
  cells: Cell[];
  readings: Store<TruckReading>;
  elements: RefObject<(HTMLElement | null)[]>;
}) {
  const r = useStore(readings);
  return cells.map((cell, i) => (
    <span
      key={cell.id}
      ref={(el) => {
        elements.current[i] = el;
      }}
      style={{ opacity: 0, visibility: "hidden" }}
      className={cn(
        "absolute left-0 top-0 select-none whitespace-nowrap rounded bg-mt-950/90 px-1.5 py-0.5 font-mono text-[10px] font-semibold tabular-nums ring-1 transition-[opacity,visibility] duration-300",
        i === FOCUS_CELL ? "text-sun-200 ring-sun-400/60" : "text-white/85 ring-white/15"
      )}
    >
      {cell.id} · {tonnes.format((r.cells[i] ?? 0) / 1000)} t
    </span>
  ));
}
