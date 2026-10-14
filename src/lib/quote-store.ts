import { MAX_ITEMS, MAX_QTY, type QuoteItem } from "./quote";
import { createStoredStore, useStore } from "./store";

/**
 * Lista de cotización: el cliente agrega varios equipos y pide una sola cotización.
 * Vive en el navegador (localStorage) y se sincroniza entre pestañas; sin precios ni cuenta.
 */

const EMPTY: QuoteItem[] = [];

const isItem = (value: unknown): value is QuoteItem =>
  typeof value === "object" &&
  value !== null &&
  typeof (value as QuoteItem).slug === "string" &&
  Number.isInteger((value as QuoteItem).qty) &&
  (value as QuoteItem).qty >= 1 &&
  (value as QuoteItem).qty <= MAX_QTY;

const items = createStoredStore("local", "metrica:cotizacion", EMPTY, (raw) =>
  Array.isArray(raw) ? raw.filter(isItem).slice(0, MAX_ITEMS) : EMPTY
);

const clampQty = (qty: number) => Math.min(MAX_QTY, Math.max(1, Math.round(qty) || 1));

export const quote = {
  add: (slug: string) =>
    items.update((current) =>
      current.some((item) => item.slug === slug) || current.length >= MAX_ITEMS ? current : [...current, { slug, qty: 1 }]
    ),
  remove: (slug: string) => items.update((current) => current.filter((item) => item.slug !== slug)),
  setQty: (slug: string, qty: number) =>
    items.update((current) => current.map((item) => (item.slug === slug ? { ...item, qty: clampQty(qty) } : item))),
  clear: () => items.set(EMPTY),
};

export const useQuoteItems = () => useStore(items, EMPTY);
