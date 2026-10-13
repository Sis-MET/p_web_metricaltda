import type { ReactNode } from "react";
import Image from "next/image";
import { ArrowRight, Box } from "lucide-react";
import { Eyebrow } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/animations/Reveal";
import { Spotlight } from "@/components/animations/Spotlight";
import { SectionLink } from "@/components/navigation/SectionLink";
import type { Consulta, SectionId } from "@/lib/navigation";
import { cn } from "@/lib/utils";

type Product = {
  name: string;
  tag: string;
  description: string;
  image: string;
  imageClassName: string;
  /** Demo 3D en el home, o sección de contacto con la consulta preseleccionada */
  link: { section: SectionId; label: string; consulta?: Consulta };
  demo?: boolean;
};

const PRODUCTS: Product[] = [
  {
    name: "Balanzas de piso",
    tag: "Plataformas",
    description: "Plataformas robustas para pesar cargas pesadas en almacenes, plantas y líneas de producción.",
    image: "/images/sections/balanza-piso.png",
    imageClassName: "p-8 sm:p-10",
    link: { section: "contacto", label: "Solicitar cotización", consulta: "cotizacion" },
  },
  {
    name: "Balanzas de mesa",
    tag: "Compactas",
    description:
      "Equipos compactos y precisos para el pesaje diario en mostrador, producción y control de calidad.",
    image: "/images/sections/balanza-mesa.png",
    imageClassName: "p-10 sm:p-12",
    link: { section: "demo-mesa", label: "Ver demo 3D" },
    demo: true,
  },
  {
    name: "Básculas de camiones",
    tag: "Alto tonelaje",
    description:
      "Sistemas de pesaje de alto tonelaje con tecnología Powercell PDX. Control preciso de carga y logística para la industria más exigente.",
    image: "/images/sections/bascula-camion.png",
    imageClassName: "p-5 sm:p-6",
    link: { section: "demo-camion", label: "Ver demo 3D" },
    demo: true,
  },
];

function Card({ product, children }: { product: Product; children: ReactNode }) {
  return (
    <SectionLink
      section={product.link.section}
      consulta={product.link.consulta}
      className="group flex h-full flex-col overflow-hidden rounded-3xl border border-neutral-200/80 bg-white transition-[box-shadow,border-color] duration-300 ease-out hover:border-neutral-300 hover:shadow-[0_24px_48px_-24px_rgba(0,0,0,0.25)]"
    >
      {children}
    </SectionLink>
  );
}

export function ProductCatalog() {
  return (
    <section id="catalogo" className="bg-neutral-50 py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="max-w-2xl">
          <Eyebrow>Catálogo</Eyebrow>
          <h1 className="mt-4 font-heading text-4xl font-extrabold leading-[1.1] tracking-tight text-ink-950 sm:text-5xl">
            Productos METTLER TOLEDO
          </h1>
          <p className="mt-5 text-base leading-relaxed text-neutral-600 sm:text-lg">
            Tecnología METTLER TOLEDO de vanguardia adaptada a los procesos más exigentes. Precisión, robustez y
            soporte técnico garantizado en cada equipo.
          </p>
        </Reveal>

        <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {PRODUCTS.map((product, i) => (
            <li key={product.name} className={cn(i === 2 && "sm:col-span-2 lg:col-span-1")}>
              <Reveal delay={i * 0.06} className="h-full">
                <Spotlight className="h-full rounded-3xl transition-transform duration-300 ease-out hover:-translate-y-1">
                  <Card product={product}>
                    <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-b from-neutral-100 to-white sm:aspect-[16/10] lg:aspect-[4/3]">
                      <div aria-hidden className="absolute inset-x-8 bottom-6 h-10 rounded-[50%] bg-ink-950/10 blur-xl" />
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        sizes="(min-width: 1024px) 400px, (min-width: 640px) 50vw, 100vw"
                        className={cn(
                          "object-contain transition-transform duration-500 ease-out group-hover:scale-[1.04]",
                          product.imageClassName
                        )}
                      />
                      <span className="absolute left-4 top-4 rounded-full border border-neutral-200/80 bg-white/90 px-3 py-1 text-xs font-semibold text-ink-800 backdrop-blur">
                        {product.tag}
                      </span>
                      {product.demo && (
                        <span className="absolute right-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-ink-800 px-3 py-1 text-xs font-semibold text-white">
                          <Box className="size-3.5" aria-hidden />
                          Demo 3D
                        </span>
                      )}
                    </div>
                    <div className="flex flex-1 flex-col p-6">
                      <h2 className="font-heading text-xl font-bold text-ink-950">{product.name}</h2>
                      <p className="mt-2 text-sm leading-relaxed text-neutral-600">{product.description}</p>
                      <span className="mt-auto inline-flex items-center gap-1.5 pt-5 text-sm font-semibold text-ink-800">
                        {product.link.label}
                        <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-1" />
                      </span>
                    </div>
                  </Card>
                </Spotlight>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
