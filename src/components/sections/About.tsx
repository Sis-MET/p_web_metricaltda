import Image from "next/image";
import { ArrowRight, ArrowUpRight, FlaskConical, Pickaxe, Pill, Wheat } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { SectionLink } from "@/components/navigation/SectionLink";
import { Reveal } from "@/components/animations/Reveal";
import { CountUp } from "@/components/animations/CountUp";

const FOUNDED = 2007;

const STATS = [
  { value: FOUNDED, from: 1990, prefix: "", label: "Año de fundación" },
  { value: new Date().getFullYear() - FOUNDED, from: 0, prefix: "+", label: "Años de experiencia" },
  { value: 500, from: 0, prefix: "+", label: "Clientes atendidos" },
];

const INDUSTRIES = [
  { icon: Wheat, label: "Alimentos y Bebidas" },
  { icon: FlaskConical, label: "Química" },
  { icon: Pill, label: "Farmacéutica" },
  { icon: Pickaxe, label: "Minería" },
];

export function About() {
  return (
    <section
      id="nosotros"
      data-header-theme="dark"
      className="relative isolate overflow-hidden bg-navy-800 py-20 text-white sm:py-28"
    >
      {/* Decoración: retícula tenue y brillos de marca */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_at_top_right,black,transparent_65%)]"
      />
      <div
        aria-hidden
        className="absolute -right-48 -top-48 -z-10 size-[40rem] rounded-full bg-[radial-gradient(circle,rgba(127,176,224,0.22),transparent_65%)]"
      />

      <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-12 lg:gap-16 lg:px-8">
        <div className="lg:col-span-7">
          <Reveal>
            <SectionHeading
              tone="dark"
              eyebrow="¿Quiénes somos?"
              title={`Expertos en sistemas de pesaje desde ${FOUNDED}`}
            />
          </Reveal>

          <Reveal delay={0.06}>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-white/75 sm:text-lg">
              Fundamos METRICA Ltda. en 2007, comenzando con servicios de mantenimiento, reparación y
              calibración de balanzas. Ahora, nos especializamos en la venta de balanzas,
              instrumentación de pesaje, y ofrecemos servicios tanto de calibración como de soporte
              técnico para los sectores industriales de Alimentos y Bebidas, Química, Farmacéutica y
              Minería.
            </p>
          </Reveal>

          <Reveal delay={0.12}>
            <ul className="mt-8 flex flex-wrap gap-2.5" aria-label="Sectores que atendemos">
              {INDUSTRIES.map(({ icon: Icon, label }) => (
                <li
                  key={label}
                  className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-4 py-2 text-sm font-medium text-white/90"
                >
                  <Icon className="size-4 text-navy-300" aria-hidden />
                  {label}
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal delay={0.18}>
            <Button asChild size="lg" variant="brand" className="mt-10">
              <SectionLink section="servicios">
                Conozca nuestros servicios <ArrowRight />
              </SectionLink>
            </Button>
          </Reveal>
        </div>

        <div className="flex flex-col gap-5 lg:col-span-5 lg:pt-4">
          <Reveal delay={0.08}>
            <dl className="grid grid-cols-3 divide-x divide-white/10 rounded-3xl border border-white/10 bg-white/[0.05] py-7">
              {STATS.map((stat) => (
                <div key={stat.label} className="flex flex-col-reverse gap-2 px-4 text-center sm:px-6">
                  <dt className="text-[11px] font-medium uppercase leading-snug tracking-wider text-white/55">
                    {stat.label}
                  </dt>
                  <dd className="font-heading text-3xl font-extrabold text-white sm:text-4xl">
                    <CountUp value={stat.value} from={stat.from} prefix={stat.prefix} />
                  </dd>
                </div>
              ))}
            </dl>
          </Reveal>

          <Reveal delay={0.14}>
            <a
              href="https://www.mt.com/es/es/home.html"
              target="_blank"
              rel="noopener noreferrer"
              className="group block rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.09] to-white/[0.02] p-7 transition-colors duration-300 hover:border-white/25 sm:p-8"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/60">
                Representantes exclusivos en Bolivia de
              </p>
              <Image
                src="/images/logo/mettler-toledo-white.png"
                alt="Mettler Toledo"
                width={800}
                height={93}
                sizes="(min-width: 1024px) 400px, 80vw"
                className="mt-6 h-auto w-full max-w-sm"
              />
              <span className="mt-7 inline-flex items-center gap-1.5 text-sm font-semibold text-navy-200 transition-colors group-hover:text-white">
                Visitar sitio oficial
                <ArrowUpRight className="size-4 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </span>
            </a>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
