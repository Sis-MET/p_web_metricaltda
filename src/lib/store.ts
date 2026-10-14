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

/* ─── Almacenamiento del navegador ──────────────────────────────────────── */

export type StorageKind = "local" | "session";

const storageOf = (kind: StorageKind) => (kind === "local" ? localStorage : sessionStorage);

/** JSON guardado en el navegador; `null` si no hay, si el almacenamiento está bloqueado o el dato está corrupto */
export function readStored(kind: StorageKind, key: string): unknown {
  try {
    const raw = storageOf(kind).getItem(key);
    return raw === null ? null : JSON.parse(raw);
  } catch {
    return null;
  }
}

/** `null` borra la clave */
export function writeStored(kind: StorageKind, key: string, value: unknown) {
  try {
    if (value === null) storageOf(kind).removeItem(key);
    else storageOf(kind).setItem(key, JSON.stringify(value));
  } catch {
    // Sin almacenamiento el dato vive igual durante la visita
  }
}

export type StoredStore<T> = Store<T> & { update: (fn: (current: T) => T) => void };

/**
 * Store guardado en localStorage o sessionStorage. Lo guardado se lee la primera vez que alguien
 * se suscribe o escribe (nunca en el servidor ni al renderizar: `get` es puro) y, en localStorage,
 * se sincroniza entre pestañas. `parse` valida lo leído: el navegador no es una fuente confiable.
 */
export function createStoredStore<T>(kind: StorageKind, key: string, initial: T, parse: (raw: unknown) => T): StoredStore<T> {
  const store = createStore(initial);
  let loaded = false;

  const read = () => {
    const raw = readStored(kind, key);
    return raw === null ? initial : parse(raw);
  };

  const load = () => {
    if (loaded || typeof window === "undefined") return;
    loaded = true;
    store.set(read());
    window.addEventListener("storage", (event) => {
      if (event.key === key && event.storageArea === storageOf(kind)) store.set(read());
    });
  };

  const set = (next: T) => {
    load();
    store.set(next);
    writeStored(kind, key, next);
  };

  return {
    get: store.get,
    set,
    update: (fn) => {
      load();
      set(fn(store.get()));
    },
    subscribe: (listener) => {
      load();
      return store.subscribe(listener);
    },
  };
}
