import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { ACCREDITATION } from "@/content/company";
import { cn } from "@/lib/utils";

const SEAL_SIZES = {
  sm: { box: "gap-4 px-4 py-2.5", logo: "h-9", sizes: "120px" },
  lg: { box: "gap-6 px-5 py-4 sm:gap-8 sm:px-7 sm:py-5", logo: "h-12 sm:h-16", sizes: "(min-width: 640px) 210px, 160px" },
} as const;

/**
 * Sello de acreditación del laboratorio (solo aplica a calibración).
 * Regla de uso: el logo de acreditado va sobre fondo blanco, con el logo de Métrica a su derecha,
 * ambos del mismo tamaño.
 */
export function AccreditationSeal({ size = "sm", className }: { size?: keyof typeof SEAL_SIZES; className?: string }) {
  const s = SEAL_SIZES[size];
  return (
    <div className={cn("inline-flex shrink-0 items-center rounded-md bg-white ring-1 ring-neutral-200", s.box, className)}>
      <Image
        src="/images/logo/ibmetro-acreditado.png"
        alt={`Acreditado por IBMETRO: laboratorio de calibración ${ACCREDITATION.code}`}
        width={900}
        height={285}
        sizes={s.sizes}
        className={cn("w-auto", s.logo)}
      />
      <Image src="/images/logo/metrica.png" alt="Métrica Ltda." width={800} height={251} sizes={s.sizes} className={cn("w-auto", s.logo)} />
    </div>
  );
}

/** Sello grande con los datos de la acreditación y el enlace para verificarla en IBMETRO */
export function Accreditation({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <AccreditationSeal size="lg" className="self-start" />
      <div className="font-mono text-xs leading-relaxed text-neutral-500">
        <p>
          <span className="font-semibold text-ink-900">Acreditación {ACCREDITATION.code}</span> · {ACCREDITATION.standard}
        </p>
        <p>{ACCREDITATION.scope}</p>
        <a
          href={ACCREDITATION.verifyUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-0.5 inline-flex items-center gap-1 font-semibold text-ink-700 underline-offset-4 transition-colors hover:text-ink-900 hover:underline"
        >
          Verificar alcance en IBMETRO <ArrowUpRight className="size-3" aria-hidden />
        </a>
      </div>
    </div>
  );
}
