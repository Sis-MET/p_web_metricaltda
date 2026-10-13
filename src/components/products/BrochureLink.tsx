import { statSync } from "node:fs";
import { join } from "node:path";
import { ArrowUpRight, FileDown } from "lucide-react";
import type { Brochure } from "@/content/catalog";
import { cn } from "@/lib/utils";

const megabytes = new Intl.NumberFormat("es-BO", { maximumFractionDigits: 1 });

/**
 * "PDF · 0,4 MB · en inglés". El tamaño se lee del archivo en /public al generar la página;
 * si falta el PDF, el build falla en lugar de publicar un enlace roto.
 */
function describe({ href, language }: Brochure) {
  const { size } = statSync(join(process.cwd(), "public", href));
  return ["PDF", `${megabytes.format(size / 1024 / 1024)} MB`, language === "en" && "en inglés"].filter(Boolean).join(" · ");
}

/**
 * Ficha técnica del fabricante. Componente de servidor: `inline` junto a las acciones de compra,
 * `card` al pie de las especificaciones.
 */
export function BrochureLink({ brochure, model, variant }: { brochure: Brochure; model: string; variant: "inline" | "card" }) {
  const details = describe(brochure);
  const linkProps = { href: brochure.href, target: "_blank", rel: "noopener", type: "application/pdf" } as const;

  if (variant === "inline") {
    return (
      <a
        {...linkProps}
        className="inline-flex items-center gap-2 text-sm font-semibold text-ink-800 underline-offset-4 hover:underline"
      >
        <FileDown className="size-4" aria-hidden />
        Ficha técnica <span className="font-normal text-neutral-500">({details})</span>
      </a>
    );
  }

  return (
    <a
      {...linkProps}
      className={cn(
        "group flex items-center gap-4 rounded-2xl border border-neutral-200 bg-white p-4 transition-[border-color,box-shadow] duration-300 ease-out-expo",
        "hover:border-neutral-300 hover:shadow-[0_16px_32px_-20px_rgba(0,0,0,0.25)]"
      )}
    >
      <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-mt-800 text-white">
        <FileDown className="size-5" aria-hidden />
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-semibold text-ink-950">Ficha técnica {model} · METTLER TOLEDO</span>
        <span className="block text-xs text-neutral-500">Especificaciones completas, dimensiones y opciones · {details}</span>
      </span>
      <ArrowUpRight
        className="ml-auto size-4 shrink-0 text-ink-600 transition-transform duration-300 ease-out-expo group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
        aria-hidden
      />
    </a>
  );
}
