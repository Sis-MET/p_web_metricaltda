"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import AnimatedContent from "@/components/animations/AnimatedContent";

gsap.registerPlugin(ScrollTrigger);

const STATS = [
  { value: "2007", label: "Año de fundación" },
  { value: "+17", label: "Años de experiencia" },
  { value: "+500", label: "Clientes atendidos" },
];

export function About() {
  const sectionRef = useRef<HTMLElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const titleWordsRef = useRef<HTMLSpanElement[]>([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Animate accent line width
      gsap.fromTo(
        lineRef.current,
        { width: 0, opacity: 0 },
        {
          width: "56px",
          opacity: 1,
          duration: 0.7,
          ease: "power3.out",
          scrollTrigger: {
            trigger: lineRef.current,
            start: "top 88%",
          },
        }
      );

      // Stagger title words
      if (titleWordsRef.current.length) {
        gsap.fromTo(
          titleWordsRef.current,
          { y: 40, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.55,
            stagger: 0.1,
            ease: "power3.out",
            delay: 0.15,
            scrollTrigger: {
              trigger: titleWordsRef.current[0],
              start: "top 88%",
            },
          }
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const titleWords = ["¿Quiénes", "Somos?"];

  return (
    <section
      ref={sectionRef}
      id="nosotros"
      style={{ backgroundColor: "#04376e" }}
      className="relative py-24 overflow-hidden"
    >
      {/* Subtle radial yellow glow — top right */}
      <div
        className="absolute -top-32 -right-32 w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(249,227,0,0.12) 0%, transparent 65%)",
        }}
      />
      {/* Subtle radial glow — bottom left */}
      <div
        className="absolute -bottom-32 -left-32 w-[400px] h-[400px] rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 65%)",
        }}
      />

      <div className="container mx-auto px-6 lg:px-16 relative z-10">
        <div className="grid lg:grid-cols-2 gap-0 items-start">

          {/* ── Left column ── */}
          <div className="flex flex-col gap-8 lg:pr-16 lg:border-r lg:border-white/10 py-4">
            {/* Animated accent bar */}
            <div
              ref={lineRef}
              className="h-[3px] rounded-full bg-[#f9e300]"
              style={{ width: 0 }}
            />

            {/* Title — GSAP word stagger */}
            <h2 className="text-3xl lg:text-4xl xl:text-5xl font-extrabold text-white tracking-wide uppercase leading-tight">
              {titleWords.map((word, i) => (
                <span
                  key={i}
                  ref={(el) => {
                    if (el) titleWordsRef.current[i] = el;
                  }}
                  className="inline-block mr-3"
                >
                  {word}
                </span>
              ))}
            </h2>

            {/* Body text */}
            <AnimatedContent
              distance={25}
              direction="vertical"
              duration={0.8}
              ease="power2.out"
              initialOpacity={0}
              animateOpacity
              threshold={0.2}
              delay={0.3}
            >
              <p className="font-body text-white/80 text-base lg:text-lg leading-relaxed">
                Fundamos METRICA Ltda. en 2007, comenzando con servicios de
                mantenimiento, reparación y calibración de balanzas. Ahora, nos
                especializamos en la venta de balanzas, instrumentación de
                pesaje, y ofrecemos servicios tanto de calibración como de
                soporte técnico para los sectores industriales de Alimentos y
                Bebidas, Química, Farmacéutica y Minería.
              </p>
            </AnimatedContent>

            {/* Stats row */}
            <AnimatedContent
              distance={20}
              direction="vertical"
              duration={0.7}
              ease="power2.out"
              initialOpacity={0}
              animateOpacity
              threshold={0.2}
              delay={0.5}
              className="flex flex-wrap gap-8 pt-2"
            >
              {STATS.map((stat, i) => (
                <div key={i} className="flex flex-col gap-1">
                  <span className="font-heading text-[#f9e300] text-2xl font-extrabold leading-none">
                    {stat.value}
                  </span>
                  <span className="font-body text-white/50 text-xs uppercase tracking-widest">
                    {stat.label}
                  </span>
                </div>
              ))}
            </AnimatedContent>

            {/* Ver Más — about the company */}
            <AnimatedContent
              distance={15}
              direction="vertical"
              duration={0.6}
              ease="power2.out"
              initialOpacity={0}
              animateOpacity
              threshold={0.2}
              delay={0.65}
            >
              <a href="/nosotros">
                <Button
                  size="lg"
                  className="font-body rounded-full text-base px-8 py-6 bg-[#f9e300] text-slate-900 font-bold hover:bg-[#f9e300]/90 hover:scale-105 transition-all duration-300 shadow-[0_0_20px_rgba(249,227,0,0.3)]"
                >
                  Ver Más <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </a>
            </AnimatedContent>
          </div>

          {/* ── Right column ── */}
          <div className="flex items-start justify-center lg:pl-16 pt-8 lg:pt-12">
            <AnimatedContent
              distance={60}
              direction="vertical"
              duration={0.9}
              ease="power3.out"
              initialOpacity={0}
              animateOpacity
              threshold={0.2}
              delay={0.2}
              className="flex flex-col items-center gap-6 w-full max-w-[460px]"
            >
              {/* Eyebrow */}
              <p className="font-heading text-white/80 text-xs font-bold tracking-[0.2em] uppercase text-center">
                Representantes Exclusivos en Bolivia de:
              </p>

              {/* Logo — click goes to Mettler Toledo site */}
              <a
                href="https://www.mt.com/es/es/home.html"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Visitar sitio oficial de Mettler Toledo"
                className="block w-full"
              >
                <div
                  className="relative w-full"
                  style={{ aspectRatio: "2129 / 879" }}
                >
                  <Image
                    src="/images/sections/mettler_toledo_white.svg"
                    alt="Mettler Toledo"
                    fill
                    className="object-contain"
                    priority
                  />
                </div>
              </a>
            </AnimatedContent>
          </div>

        </div>
      </div>
    </section>
  );
}
