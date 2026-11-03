import { cn } from "@/lib/utils";

/** Para comparar sin mayúsculas ni tildes ("Potosí" = "potosi") */
export const normalize = (text: string) => text.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();

/** Campo de texto, lista o área de texto: los formularios del sitio y los del panel */
export const controlCls = (invalid?: boolean) =>
  cn(
    "block h-11 w-full rounded-xl border bg-white px-3.5 text-[15px] text-ink-950 shadow-[0_1px_2px_rgba(0,0,0,0.04)] outline-none transition-[border-color,box-shadow] duration-150 placeholder:text-neutral-400",
    "focus:border-ink-500 focus:ring-4 focus:ring-ink-500/15 disabled:opacity-60",
    invalid ? "border-red-400 focus:border-red-500 focus:ring-red-500/15" : "border-neutral-200 hover:border-neutral-300"
  );

/** Lista desplegable (opciones o sugerencias), debajo o encima del campo */
export const listboxCls = (upward = false) =>
  cn(
    "absolute inset-x-0 z-30 max-h-64 overflow-y-auto overscroll-contain rounded-xl border border-neutral-200 bg-white p-1.5 shadow-[0_24px_48px_-20px_rgba(0,0,0,0.35)]",
    upward ? "bottom-full mb-1.5" : "top-full mt-1.5"
  );

/** Una opción de la lista: `active` es la que marca el teclado o el mouse */
export const optionCls = (active: boolean, selected = false) =>
  cn(
    "flex cursor-pointer items-center justify-between gap-3 rounded-lg px-3 py-2 text-[15px] transition-colors",
    active ? "bg-mt-50 text-ink-950" : "text-ink-800",
    selected && "font-semibold"
  );
