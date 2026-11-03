"use client";

import { useActionState, useRef, useState, useTransition, type FormEvent } from "react";
import { Plus } from "lucide-react";
import { controlCls } from "@/components/forms/styles";
import { Notice } from "@/components/panel/Field";
import { DeleteButton, MoveButtons } from "@/components/panel/RowButtons";
import type { ActionState } from "@/lib/panel/types";

type Line = { id: number; name: string };

/** Nombre de una línea: se guarda al salir del campo o con Enter */
function LineName({ line, rename }: { line: Line; rename: (id: number, name: string) => Promise<ActionState> }) {
  const [value, setValue] = useState(line.name);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const commit = () => {
    if (value.trim() === line.name) return;
    start(async () => {
      const result = await rename(line.id, value);
      setError(result.error ?? null);
    });
  };

  return (
    <div className="flex-1">
      <input
        value={value}
        onChange={(event) => setValue(event.target.value)}
        onBlur={commit}
        onKeyDown={(event) => event.key === "Enter" && (event.preventDefault(), commit())}
        aria-label={`Nombre de la línea ${line.name}`}
        disabled={pending}
        className={controlCls(Boolean(error))}
      />
      {error && <p className="mt-1 text-xs font-medium text-red-600">{error}</p>}
    </div>
  );
}

/** Líneas de una categoría: el filtro "Tipo de equipo" de su página */
export function LinesEditor({
  lines,
  add,
  rename,
  remove,
  move,
}: {
  lines: Line[];
  add: (state: ActionState, form: FormData) => Promise<ActionState>;
  rename: (id: number, name: string) => Promise<ActionState>;
  remove: (id: number) => Promise<ActionState>;
  move: (id: number, direction: "up" | "down") => Promise<void>;
}) {
  const [state, action] = useActionState(add, {} as ActionState);
  const [pending, start] = useTransition();
  const input = useRef<HTMLInputElement>(null);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    start(async () => {
      action(data);
      if (input.current) input.current.value = "";
    });
  };

  return (
    <div className="flex flex-col gap-3">
      {lines.length === 0 && <p className="text-sm text-neutral-500">Sin líneas: sus productos se muestran todos juntos.</p>}
      {lines.map((line, i) => (
        <div key={line.id} className="flex items-start gap-2">
          <LineName line={line} rename={rename} />
          <MoveButtons move={(direction) => move(line.id, direction)} first={i === 0} last={i === lines.length - 1} label={line.name} />
          <DeleteButton
            compact
            remove={() => remove(line.id)}
            label={`Quitar la línea ${line.name}`}
            confirmText={`¿Quitar la línea “${line.name}”? Sus productos quedan sin línea (no se eliminan).`}
          />
        </div>
      ))}
      <form onSubmit={submit} method="post" className="flex gap-2">
        <input ref={input} name="name" placeholder="Nueva línea, por ejemplo: Plataformas de pesaje" className={controlCls()} aria-label="Nueva línea" />
        <button
          type="submit"
          disabled={pending}
          className="inline-flex h-11 shrink-0 items-center gap-1.5 rounded-full border border-neutral-300 px-4 text-sm font-semibold text-ink-900 hover:border-ink-800 disabled:opacity-60"
        >
          <Plus className="size-4" aria-hidden />
          Agregar
        </button>
      </form>
      {state.error && <Notice tone="error">{state.error}</Notice>}
    </div>
  );
}
