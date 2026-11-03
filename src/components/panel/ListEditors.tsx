"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, Plus, X } from "lucide-react";
import { controlCls } from "@/components/forms/styles";
import { cn } from "@/lib/utils";

/*
 * Listas que el formulario envía como JSON en un campo oculto: características (textos) y
 * especificaciones o destacados (pares). Cada fila se puede mover, quitar o agregar.
 */

type Row<T> = { id: number; value: T };

function useRows<T>(initial: T[], blank: T) {
  const [rows, setRows] = useState<Row<T>[]>(() => initial.map((value, id) => ({ id, value })));
  return {
    rows,
    update: (id: number, value: T) => setRows((list) => list.map((row) => (row.id === id ? { ...row, value } : row))),
    remove: (id: number) => setRows((list) => list.filter((row) => row.id !== id)),
    add: () => setRows((list) => [...list, { id: Math.max(-1, ...list.map((row) => row.id)) + 1, value: blank }]),
    move: (index: number, offset: -1 | 1) =>
      setRows((list) => {
        const next = [...list];
        const [row] = next.splice(index, 1);
        next.splice(index + offset, 0, row);
        return next;
      }),
  };
}

function RowActions({ index, count, onMove, onRemove }: { index: number; count: number; onMove: (offset: -1 | 1) => void; onRemove: () => void }) {
  const btn = "flex size-9 items-center justify-center rounded-lg text-neutral-500 hover:bg-neutral-100 hover:text-ink-950 disabled:opacity-30";
  return (
    <div className="flex shrink-0 items-center">
      <button type="button" className={btn} disabled={index === 0} onClick={() => onMove(-1)} aria-label="Subir">
        <ArrowUp className="size-4" />
      </button>
      <button type="button" className={btn} disabled={index === count - 1} onClick={() => onMove(1)} aria-label="Bajar">
        <ArrowDown className="size-4" />
      </button>
      <button type="button" className={cn(btn, "hover:text-red-600")} onClick={onRemove} aria-label="Quitar">
        <X className="size-4" />
      </button>
    </div>
  );
}

function AddButton({ label, onClick, disabled }: { label: string; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex items-center gap-1.5 self-start rounded-full border border-dashed border-neutral-300 px-4 py-2 text-sm font-semibold text-ink-800 hover:border-ink-800 disabled:opacity-50"
    >
      <Plus className="size-4" aria-hidden />
      {label}
    </button>
  );
}

/** Lista de textos (características) */
export function TextListEditor({
  name,
  initial,
  addLabel,
  placeholder,
  max = 20,
}: {
  name: string;
  initial: string[];
  addLabel: string;
  placeholder?: string;
  max?: number;
}) {
  const { rows, update, remove, add, move } = useRows(initial, "");
  return (
    <div className="flex flex-col gap-2">
      <input type="hidden" name={name} value={JSON.stringify(rows.map((row) => row.value.trim()).filter(Boolean))} />
      {rows.map((row, index) => (
        <div key={row.id} className="flex items-center gap-2">
          <input
            value={row.value}
            onChange={(event) => update(row.id, event.target.value)}
            placeholder={placeholder}
            maxLength={300}
            className={controlCls()}
            aria-label={`${addLabel.replace(/^Agregar /, "")} ${index + 1}`}
          />
          <RowActions index={index} count={rows.length} onMove={(offset) => move(index, offset)} onRemove={() => remove(row.id)} />
        </div>
      ))}
      <AddButton label={addLabel} onClick={add} disabled={rows.length >= max} />
    </div>
  );
}

/** Pares (especificaciones: dato y valor; destacados: título y texto) */
export function PairListEditor<K1 extends string, K2 extends string>({
  name,
  initial,
  keys,
  labels,
  placeholders,
  addLabel,
  multiline = false,
  max = 40,
}: {
  name: string;
  initial: Record<K1 | K2, string>[];
  keys: [K1, K2];
  labels: [string, string];
  placeholders?: [string, string];
  addLabel: string;
  /** El segundo campo admite varias líneas (texto de un destacado) */
  multiline?: boolean;
  max?: number;
}) {
  const [first, second] = keys;
  const blank = { [first]: "", [second]: "" } as Record<K1 | K2, string>;
  const { rows, update, remove, add, move } = useRows(initial, blank);
  const filled = rows
    .map((row) => ({ [first]: row.value[first].trim(), [second]: row.value[second].trim() }))
    .filter((pair) => pair[first] || pair[second]);

  return (
    <div className="flex flex-col gap-2">
      <input type="hidden" name={name} value={JSON.stringify(filled)} />
      {rows.map((row, index) => (
        <div key={row.id} className="flex items-start gap-2">
          <div className={cn("grid flex-1 gap-2", multiline ? "grid-cols-1" : "sm:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]")}>
            <input
              value={row.value[first]}
              onChange={(event) => update(row.id, { ...row.value, [first]: event.target.value })}
              placeholder={placeholders?.[0]}
              maxLength={120}
              aria-label={`${labels[0]} ${index + 1}`}
              className={controlCls()}
            />
            {multiline ? (
              <textarea
                value={row.value[second]}
                onChange={(event) => update(row.id, { ...row.value, [second]: event.target.value })}
                placeholder={placeholders?.[1]}
                maxLength={300}
                rows={2}
                aria-label={`${labels[1]} ${index + 1}`}
                className={cn(controlCls(), "h-auto resize-y py-2.5")}
              />
            ) : (
              <input
                value={row.value[second]}
                onChange={(event) => update(row.id, { ...row.value, [second]: event.target.value })}
                placeholder={placeholders?.[1]}
                maxLength={300}
                aria-label={`${labels[1]} ${index + 1}`}
                className={controlCls()}
              />
            )}
          </div>
          <RowActions index={index} count={rows.length} onMove={(offset) => move(index, offset)} onRemove={() => remove(row.id)} />
        </div>
      ))}
      <AddButton label={addLabel} onClick={add} disabled={rows.length >= max} />
    </div>
  );
}
