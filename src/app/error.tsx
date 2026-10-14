"use client";

import { useEffect } from "react";
import Link from "next/link";
import { ArrowRight, MessageCircle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/layout/PageHeader";
import { whatsappUrl } from "@/content/company";

/**
 * Error inesperado al mostrar una página (por ejemplo, se cortó la conexión a mitad de la carga).
 * El header y el footer siguen en pantalla: el visitante puede reintentar o seguir por otro camino.
 */
export default function PageError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("[página]", error);
  }, [error]);

  return (
    <main>
      <PageHeader
        trail={[{ label: "Error", href: "/" }]}
        eyebrow="Algo salió mal"
        title="No pudimos mostrar esta página"
        description="Puede ser un corte momentáneo de la conexión. Inténtelo de nuevo; si continúa, escríbanos y le ayudamos."
        actions={
          <>
            <Button variant="light" onClick={reset}>
              <RotateCcw /> Reintentar
            </Button>
            <Button asChild variant="glass">
              <Link href="/">
                Ir al inicio <ArrowRight />
              </Link>
            </Button>
            <Button asChild variant="glass">
              <a href={whatsappUrl("Hola, tuve un problema al usar el sitio web de Métrica.")} target="_blank" rel="noopener noreferrer">
                <MessageCircle /> WhatsApp
              </a>
            </Button>
          </>
        }
      />
    </main>
  );
}
