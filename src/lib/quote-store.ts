import { MAX_ITEMS, MAX_QTY, type QuoteItem } from "./quote";
import { createStore, useStore, type Store } from "./store";

/**
 * Lista de cotización: el cliente agrega varios equipos y pide una sola cotización.
 * Vive en el navegador (localStorage) y se sincroniza entre pestañas; sin precios ni cuenta.
 */

const STORAGE_KEY = "metrica:cotizacion";
const EMPTY: QuoteItem[] = [];

const isItem = (value: unknown): value is QuoteItem =>
  typeof value === "object" &&
  value !== null &&
  typeof (value as QuoteItem).slug === "string" &&
  Number.isInteger((value as QuoteItem).qty) &&
  (value as QuoteItem).qty >= 1 &&
  (value as QuoteItem).qty <= MAX_QTY;

function read(): QuoteItem[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
    return Array.isArray(parsed) ? parsed.filter(isItem).slice(0, MAX_ITEMS) : EMPTY;
  } catch {
    // Almacenamiento bloqueado o dato corrupto: se empieza con la lista vacía
    return EMPTY;
  }
}

const items = createStore<QuoteItem[]>(EMPTY);
let loaded = false;

/** Lee la lista guardada la primera vez que se necesita (nunca en el servidor) */
function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  items.set(read());
  window.addEventListener("storage", (event) => {
    if (event.key === STORAGE_KEY) items.set(read());
  });
}

// get es puro (React lo llama al renderizar); la lectura del navegador ocurre al suscribirse
const quoteStore: Store<QuoteItem[]> = {
  get: items.get,
  set: (next) => {
    items.set(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Sin almacenamiento la lista funciona igual durante la visita
    }
  },
  subscribe: (listener) => {
    load();
    return items.subscribe(listener);
  },
};

const clampQty = (qty: number) => Math.min(MAX_QTY, Math.max(1, Math.round(qty) || 1));

const update = (fn: (current: QuoteItem[]) => QuoteItem[]) => {
  load();
  quoteStore.set(fn(quoteStore.get()));
};

export const quote = {
  add: (slug: string) =>
    update((current) =>
      current.some((item) => item.slug === slug) || current.length >= MAX_ITEMS ? current : [...current, { slug, qty: 1 }]
    ),
  remove: (slug: string) => update((current) => current.filter((item) => item.slug !== slug)),
  setQty: (slug: string, qty: number) =>
    update((current) => current.map((item) => (item.slug === slug ? { ...item, qty: clampQty(qty) } : item))),
  clear: () => quoteStore.set(EMPTY),
};

export const useQuoteItems = () => useStore(quoteStore, EMPTY);
