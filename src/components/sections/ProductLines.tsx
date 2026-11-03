import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/animations/Reveal";
import { CategoryGrid } from "@/components/products/CategoryGrid";
import { getCatalog } from "@/lib/catalog";

/** Las líneas de producto, cada una hacia su página. */
export async function ProductLines() {
  const catalog = await getCatalog();
  return (
    <section id="productos" className="bg-bone-100 py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <Reveal className="max-w-2xl">
            <SectionHeading
              eyebrow="Productos"
              title="Tecnología METTLER TOLEDO para cada proceso"
              description="Desde una báscula de mostrador hasta una báscula de camiones: equipos con respaldo local de instalación, calibración y soporte."
            />
          </Reveal>
          <Reveal delay={0.06}>
            <Button asChild variant="outline">
              <Link href="/productos">
                Ver catálogo completo <ArrowRight />
              </Link>
            </Button>
          </Reveal>
        </div>

        <div className="mt-12">
          <CategoryGrid catalog={catalog} />
        </div>
      </div>
    </section>
  );
}
