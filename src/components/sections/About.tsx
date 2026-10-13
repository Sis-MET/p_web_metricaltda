import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { GridPattern, SunGlow } from "@/components/ui/Backdrop";
import { Reveal } from "@/components/animations/Reveal";
import { CountUp } from "@/components/animations/CountUp";
import { BRANDS, COMPANY, INDUSTRIES, STATS } from "@/content/company";

export function IndustryChips() {
  return (
    <ul className="flex flex-wrap gap-2.5" aria-label="Sectores que atendemos">
      {INDUSTRIES.map(({ icon: Icon, label }) => (
        <li
          key={label}
          className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-4 py-2 text-sm font-medium text-white/90"
        >
          <Icon className="size-4 text-sun-400/90" aria-hidden />
          {label}
        </li>
      ))}
    </ul>
  );
}

export function Stats() {
  return (
    <dl className="grid grid-cols-3 divide-x divide-white/10 rounded-3xl border border-white/10 bg-white/[0.05] py-7">
      {STATS.map((stat) => (
        <div key={stat.label} className="flex flex-col-reverse gap-2 px-4 text-center sm:px-6">
          <dt className="text-[11px] font-medium uppercase leading-snug tracking-wider text-white/55">{stat.label}</dt>
          <dd className="font-heading text-3xl font-extrabold text-white sm:text-4xl">
            <CountUp value={stat.value} from={stat.from} prefix={stat.prefix} />
          </dd>
        </div>
      ))}
    </dl>
  );
}

export function MettlerToledoCard() {
  return (
    <a
      href={BRANDS.exclusive.href}
      target="_blank"
      rel="noopener noreferrer"
      className="group block rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.09] to-white/[0.02] p-7 transition-colors duration-300 hover:border-white/25 sm:p-8"
    >
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/60">Representantes exclusivos en Bolivia de</p>
      <Image
        src="/images/logo/mettler-toledo-white.png"
        alt="METTLER TOLEDO"
        width={800}
        height={93}
        sizes="(min-width: 1024px) 400px, 80vw"
        className="mt-6 h-auto w-full max-w-sm"
      />
      <span className="mt-7 inline-flex items-center gap-1.5 text-sm font-semibold text-ink-200 transition-colors group-hover:text-sun-400">
        Visitar sitio oficial
        <ArrowUpRight className="size-4 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
      </span>
    </a>
  );
}

/** Presentación de la empresa en el inicio; la historia completa está en /nosotros. */
export function About() {
  return (
    <section id="nosotros" data-header-theme="dark" className="relative isolate overflow-hidden bg-ink-950 py-20 text-white sm:py-28">
      <GridPattern className="[mask-image:radial-gradient(ellipse_at_top_right,black,transparent_65%)]" />
      <SunGlow className="-right-48 -top-48" />

      <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-12 lg:gap-16 lg:px-8">
        <div className="lg:col-span-7">
          <Reveal>
            <SectionHeading tone="dark" eyebrow="¿Quiénes somos?" title={`Expertos en sistemas de pesaje desde ${COMPANY.founded}`} />
          </Reveal>

          <Reveal delay={0.06}>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-white/75 sm:text-lg">
              Comenzamos en {COMPANY.founded} con el mantenimiento, la reparación y la calibración de balanzas. Hoy
              asesoramos, dimensionamos, proveemos e instalamos equipos de pesaje, con servicios de calibración y soporte
              técnico para los sectores de alimentos y bebidas, química, farmacéutica y minería.
            </p>
          </Reveal>

          <Reveal delay={0.12} className="mt-8">
            <IndustryChips />
          </Reveal>

          <Reveal delay={0.18} className="mt-10 flex flex-wrap gap-3">
            <Button asChild size="lg" variant="brand">
              <Link href="/servicios">
                Conozca nuestros servicios <ArrowRight />
              </Link>
            </Button>
            <Button asChild size="lg" variant="glass">
              <Link href="/nosotros">Nuestra historia</Link>
            </Button>
          </Reveal>
        </div>

        <div className="flex flex-col gap-5 lg:col-span-5 lg:pt-4">
          <Reveal delay={0.08}>
            <Stats />
          </Reveal>
          <Reveal delay={0.14}>
            <MettlerToledoCard />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
