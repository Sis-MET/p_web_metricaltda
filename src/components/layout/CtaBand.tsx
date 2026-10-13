import Link from "next/link";
import { ArrowRight, MessageCircle, Phone } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/animations/Reveal";
import { GridPattern } from "@/components/ui/Backdrop";
import { SALES_PHONE, whatsappUrl } from "@/content/company";
import { QUOTE_HREF } from "@/lib/routes";

type CtaBandProps = {
  title?: string;
  description?: string;
  /** Acción principal; por defecto, la lista de cotización */
  primary?: { label: string; href: string };
  whatsappMessage?: string;
};

/** Cierre de página: un único llamado a la acción con los canales directos. */
export function CtaBand({
  title = "¿Necesita asesoría para elegir su equipo?",
  description = "Cuéntenos qué necesita pesar y le recomendamos la solución adecuada, con instalación, calibración y soporte.",
  primary = { label: "Solicitar cotización", href: QUOTE_HREF },
  whatsappMessage = "Hola, quisiera recibir asesoría de Métrica.",
}: CtaBandProps) {
  return (
    <section className="relative isolate overflow-hidden bg-bone-100 py-16 text-ink-950 sm:py-20">
      <GridPattern tone="light" className="[mask-image:radial-gradient(ellipse_at_bottom_left,black,transparent_65%)]" />

      <Reveal className="mx-auto flex max-w-7xl flex-col gap-8 px-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div className="max-w-2xl">
          <h2 className="font-heading text-3xl font-extrabold leading-[1.1] tracking-tight sm:text-4xl">{title}</h2>
          <p className="mt-4 text-base leading-relaxed text-neutral-600 sm:text-lg">{description}</p>
        </div>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center lg:flex-col lg:items-end">
          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link href={primary.href}>
                {primary.label} <ArrowRight />
              </Link>
            </Button>
            <Button asChild size="lg" variant="frost">
              <a href={whatsappUrl(whatsappMessage)} target="_blank" rel="noopener noreferrer">
                <MessageCircle /> WhatsApp
              </a>
            </Button>
          </div>
          <a
            href={`tel:${SALES_PHONE.number}`}
            className="inline-flex items-center gap-2 text-sm text-neutral-600 transition-colors hover:text-ink-950"
          >
            <Phone className="size-4" aria-hidden />
            {SALES_PHONE.label}: {SALES_PHONE.display}
          </a>
        </div>
      </Reveal>
    </section>
  );
}
