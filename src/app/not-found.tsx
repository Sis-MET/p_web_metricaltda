import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/layout/PageHeader";
import { NAV } from "@/lib/routes";

export default function NotFound() {
  return (
    <main>
      <PageHeader
        trail={[{ label: "Página no encontrada", href: "/404" }]}
        eyebrow="Error 404"
        title="No encontramos esta página"
        description="Puede que la dirección haya cambiado con el nuevo sitio. Estas secciones pueden ayudarle:"
        actions={
          <>
            {NAV.slice(1).map((item) => (
              <Button key={item.href} asChild variant="glass">
                <Link href={item.href}>{item.label}</Link>
              </Button>
            ))}
            <Button asChild variant="light">
              <Link href="/">
                Ir al inicio <ArrowRight />
              </Link>
            </Button>
          </>
        }
      />
    </main>
  );
}
