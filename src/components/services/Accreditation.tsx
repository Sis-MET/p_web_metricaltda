import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { ACCREDITATION } from "@/content/company";
import { cn } from "@/lib/utils";

/**
 * Sello de acreditación del laboratorio (solo aplica a calibración).
 * Regla de uso: el logo de acreditado va sobre fondo blanco, con el logo de Métrica a su derecha,
 * ambos del mismo tamaño.
 */
export function AccreditationSeal({ className }: { className?: string }) {
  return (
    <div className={cn("inline-flex shrink-0 items-center gap-4 rounded-md bg-white px-4 py-2.5 ring-1 ring-neutral-200", className)}>
      <Image
        src="/images/logo/ibmetro-acreditado.png"
        alt={`Acreditado por IBMETRO: laboratorio de calibración ${ACCREDITATION.code}`}
        width={900}
        height={285}
        sizes="120px"
        className="h-9 w-auto"
      />
      <Image src="/images/logo/metrica.png" alt="Métrica Ltda." width={800} height={251} sizes="120px" className="h-9 w-auto" />
    </div>
  );
}

export function Accreditation({ tone = "light" }: { tone?: "light" | "dark" }) {
  const dark = tone === "dark";
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-5">
      <AccreditationSeal className="self-start" />
      <div className={cn("font-mono text-[11px] leading-relaxed", dark ? "text-white/60" : "text-neutral-500")}>
        <p>
          Acreditación {ACCREDITATION.code} · {ACCREDITATION.standard}
        </p>
        <p>{ACCREDITATION.scope}</p>
        <a
          href={ACCREDITATION.verifyUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            "mt-0.5 inline-flex items-center gap-1 font-semibold underline-offset-4 transition-colors hover:underline",
            dark ? "text-white/85 hover:text-white" : "text-ink-700 hover:text-ink-900"
          )}
        >
          Verificar alcance en IBMETRO <ArrowUpRight className="size-3" aria-hidden />
        </a>
      </div>
    </div>
  );
}
