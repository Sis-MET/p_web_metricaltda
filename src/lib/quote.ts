/** Modelo de la lista de cotización, compartido por el navegador y el servidor. */

export type QuoteItem = { slug: string; qty: number };

export const MAX_QTY = 999;
/** Productos distintos por solicitud */
export const MAX_ITEMS = 50;
