import type { FormId } from "./forms/definitions";
import { createStoredStore, useStore } from "./store";

/**
 * Texto precargado en el campo de detalle de un formulario (`summaryField`): el Asistente de Métrica
 * deja aquí el resumen de la conversación y el cliente lo revisa antes de enviar. Dura la visita.
 */

type Drafts = Partial<Record<FormId, string>>;

const EMPTY: Drafts = {};

const drafts = createStoredStore<Drafts>("session", "metrica:borradores", EMPTY, (raw) =>
  typeof raw === "object" && raw !== null
    ? Object.fromEntries(Object.entries(raw).filter(([, text]) => typeof text === "string"))
    : EMPTY
);

export const formDrafts = {
  set: (form: FormId, text: string) => drafts.update((current) => ({ ...current, [form]: text })),
  clear: (form: FormId) =>
    drafts.update((current) => {
      if (!(form in current)) return current;
      const next = { ...current };
      delete next[form];
      return next;
    }),
};

export const useFormDraft = (form: FormId) => useStore(drafts, EMPTY)[form];
