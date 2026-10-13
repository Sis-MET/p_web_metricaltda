"use client";

import Link from "next/link";
import { Check, ClipboardList, Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { quote, useQuoteItems } from "@/lib/quote-store";
import { QUOTE_HREF } from "@/lib/routes";
import { cn } from "@/lib/utils";

type AddToQuoteButtonProps = {
  slug: string;
  model: string;
  /** `icon`: botón redondo para tarjetas; `full`: botón principal de la ficha */
  variant?: "icon" | "full";
  /** Fondo sobre el que va el botón `full` */
  tone?: "light" | "dark";
  /** Enlace "Ver lista" junto al botón `full` */
  listLink?: boolean;
  className?: string;
};

const BUTTON_VARIANT = {
  light: { idle: "primary", added: "outline" },
  dark: { idle: "light", added: "glass" },
} as const;

/** Agrega o quita un equipo de la lista de cotización. */
export function AddToQuoteButton({
  slug,
  model,
  variant = "full",
  tone = "light",
  listLink = true,
  className,
}: AddToQuoteButtonProps) {
  const items = useQuoteItems();
  const inList = items.some((item) => item.slug === slug);
  const toggle = () => (inList ? quote.remove(slug) : quote.add(slug));

  if (variant === "icon") {
    const label = inList ? `Quitar ${model} de la cotización` : `Agregar ${model} a la cotización`;
    return (
      <button
        type="button"
        onClick={toggle}
        aria-pressed={inList}
        aria-label={label}
        title={label}
        className={cn(
          "flex size-10 items-center justify-center rounded-full border transition-colors duration-200 [&_svg]:size-4",
          inList
            ? "border-ink-900 bg-ink-900 text-white hover:bg-ink-700"
            : "border-neutral-200 bg-white text-ink-900 hover:border-ink-900",
          className
        )}
      >
        {inList ? <Check aria-hidden /> : <Plus aria-hidden />}
      </button>
    );
  }

  return (
    <div className={cn("flex flex-wrap items-center gap-x-4 gap-y-2", className)}>
      <Button size="lg" variant={BUTTON_VARIANT[tone][inList ? "added" : "idle"]} onClick={toggle} aria-pressed={inList}>
        {inList ? (
          <>
            <Check /> En su lista de cotización
          </>
        ) : (
          <>
            <Plus /> Agregar a la cotización
          </>
        )}
      </Button>
      {listLink && items.length > 0 && (
        <Link
          href={QUOTE_HREF}
          className={cn(
            "inline-flex items-center gap-2 text-sm font-semibold underline-offset-4 hover:underline",
            tone === "dark" ? "text-white/85" : "text-ink-800"
          )}
        >
          <ClipboardList className="size-4" aria-hidden />
          Ver lista ({items.length})
        </Link>
      )}
    </div>
  );
}
