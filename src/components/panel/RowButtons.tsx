"use client";

import { useState, useTransition } from "react";
import { ArrowDown, ArrowUp, Trash2 } from "lucide-react";
import type { ActionState } from "@/lib/panel/types";
import { cn } from "@/lib/utils";

const iconBtn =
  "flex size-9 items-center justify-center rounded-lg text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-ink-950 disabled:pointer-events-none disabled:opacity-30";

/** Subir o bajar una fila de una lista ordenada (categorías, productos, líneas) */
export function MoveButtons({
  move,
  first,
  last,
  label,
}: {
  move: (direction: "up" | "down") => Promise<void>;
  first: boolean;
  last: boolean;
  label: string;
}) {
  const [pending, start] = useTransition();
  return (
    <div className="flex items-center">
      <button type="button" className={iconBtn} disabled={first || pending} onClick={() => start(() => move("up"))} aria-label={`Subir ${label}`}>
        <ArrowUp className="size-4" />
      </button>
      <button type="button" className={iconBtn} disabled={last || pending} onClick={() => start(() => move("down"))} aria-label={`Bajar ${label}`}>
        <ArrowDown className="size-4" />
      </button>
    </div>
  );
}

/** Eliminar con confirmación; si la acción no puede (por ejemplo, la categoría tiene productos), lo explica */
export function DeleteButton({
  remove,
  confirmText,
  label = "Eliminar",
  compact = false,
}: {
  remove: () => Promise<ActionState | void>;
  confirmText: string;
  label?: string;
  /** Solo el ícono (filas de una lista) */
  compact?: boolean;
}) {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const run = () => {
    if (!window.confirm(confirmText)) return;
    setError(null);
    start(async () => {
      const result = await remove();
      if (result?.error) setError(result.error);
    });
  };

  return (
    <span className="inline-flex flex-col items-end gap-1">
      {compact ? (
        <button type="button" onClick={run} disabled={pending} className={cn(iconBtn, "hover:text-red-600")} aria-label={label}>
          <Trash2 className="size-4" />
        </button>
      ) : (
        <button
          type="button"
          onClick={run}
          disabled={pending}
          className="inline-flex h-9 items-center gap-2 rounded-full border border-red-200 bg-white px-4 text-sm font-semibold text-red-700 hover:border-red-400 hover:bg-red-50 disabled:opacity-60"
        >
          <Trash2 className="size-4" aria-hidden />
          {pending ? "Eliminando…" : label}
        </button>
      )}
      {error && (
        <span role="alert" className="max-w-xs text-right text-xs font-medium text-red-600">
          {error}
        </span>
      )}
    </span>
  );
}
