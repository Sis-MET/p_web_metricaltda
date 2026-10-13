import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/animations/Reveal";
import { CategoryCard } from "@/components/products/CategoryCard";
import { CATEGORIES } from "@/content/categories";

/** Las líneas de producto, cada una hacia su página. */
export function ProductLines() {
  return (
    <section id="productos" className="bg-neutral-50 py-20 sm:py-24">
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

        <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {CATEGORIES.map((category, i) => (
            <li key={category.slug} className={i === 2 ? "sm:col-span-2 lg:col-span-1" : undefined}>
              <Reveal delay={i * 0.06} className="h-full">
                <CategoryCard category={category} />
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
