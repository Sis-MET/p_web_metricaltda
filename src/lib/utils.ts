import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type Falsy = false | null | undefined | "" | 0;

/** Quita los valores vacíos de una lista armada con condiciones (`cond && valor`) */
export const compact = <T,>(values: (T | Falsy)[]) => values.filter((value): value is T => Boolean(value));
