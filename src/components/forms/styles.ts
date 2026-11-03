import { cn } from "@/lib/utils";

/** Campo de texto, lista o área de texto: los formularios del sitio y los del panel */
export const controlCls = (invalid?: boolean) =>
  cn(
    "block h-11 w-full rounded-xl border bg-white px-3.5 text-[15px] text-ink-950 shadow-[0_1px_2px_rgba(0,0,0,0.04)] outline-none transition-[border-color,box-shadow] duration-150 placeholder:text-neutral-400",
    "focus:border-ink-500 focus:ring-4 focus:ring-ink-500/15 disabled:opacity-60",
    invalid ? "border-red-400 focus:border-red-500 focus:ring-red-500/15" : "border-neutral-200 hover:border-neutral-300"
  );
