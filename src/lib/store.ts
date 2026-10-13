import { useSyncExternalStore } from "react";

/**
 * Store mínimo para estado compartido fuera de React (lecturas de los demos 3D, lista de cotización):
 * solo se re-renderizan los componentes suscritos, no el árbol que los contiene.
 */
export type Store<T> = {
  get: () => T;
  set: (value: T) => void;
  subscribe: (listener: () => void) => () => void;
};

export function createStore<T>(initial: T): Store<T> {
  let value = initial;
  const listeners = new Set<() => void>();
  return {
    get: () => value,
    set: (next) => {
      if (Object.is(next, value)) return;
      value = next;
      listeners.forEach((listener) => listener());
    },
    subscribe: (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}

/** `serverValue`: lo que se renderiza en el servidor y durante la hidratación */
export function useStore<T>(store: Store<T>, serverValue: T = store.get()) {
  return useSyncExternalStore(store.subscribe, store.get, () => serverValue);
}
