"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { QUOTE_HREF } from "@/lib/routes";
import { EASE_IN, EASE_OUT } from "@/lib/motion";
import { cn } from "@/lib/utils";

const SLIDE_MS = 6500;

type Slide = {
  id: string;
  label: string;
  title: [string, string];
  description: string;
  image: string;
  primary: { label: string; href: string };
  secondary: { label: string; href: string };
};

const SLIDES: Slide[] = [
  {
    id: "industrial",
    label: "Balanzas industriales",
    title: ["Precisión en", "Balanzas Industriales"],
    description:
      "Robustez, Confiabilidad, Precisión y Ergonomía: Las balanzas METTLER TOLEDO están diseñadas para enfrentar los procesos de pesaje más exigentes en entornos industriales desafiantes. Garantizamos la máxima precisión y confiabilidad en cada medición, sin comprometer la facilidad de uso y ergonomía para los operadores.",
    image: "/images/hero/balanzas-industriales.jpg",
    primary: { label: "Ver catálogo", href: "/productos/balanzas-industriales" },
    secondary: { label: "Cotizar", href: QUOTE_HREF },
  },
  {
    id: "trucks",
    label: "Básculas de camiones",
    title: ["Control Total con", "Básculas de Camiones"],
    description:
      "La tecnología avanzada, durabilidad y exactitud de las básculas de camiones Powercell PDX de Mettler Toledo permiten controlar grandes volúmenes transportados por los camiones con la más alta precisión.",
    image: "/images/hero/basculas-camion.jpg",
    primary: { label: "Ver cómo funciona", href: "#demo-camion" },
    secondary: { label: "Asesoría", href: "/contacto" },
  },
  {
    id: "calibration",
    label: "Laboratorio de calibración",
    title: ["Confianza en su", "Laboratorio de Calibración"],
    description:
      "Garantice la precisión y confiabilidad de sus balanzas y pesas con nuestro servicio de calibración, consulte sobre nuestros alcances.",
    image: "/images/hero/calibracion.jpg",
    primary: { label: "Conocer el laboratorio", href: "/servicios/calibracion" },
    secondary: { label: "Agendar", href: "/servicios/calibracion#solicitar" },
  },
  {
    id: "support",
    label: "Soporte técnico",
    title: ["Respaldo con", "Soporte Técnico"],
    description:
      "Servicio para balanzas industriales y básculas de camiones. Profesionalismo, experiencia y compromiso para asegurar la precisión y fiabilidad de tus equipos.",
    image: "/images/hero/soporte-tecnico.jpg",
    primary: { label: "Ver soporte", href: "/servicios/soporte-tecnico" },
    secondary: { label: "Solicitar soporte", href: "/servicios/soporte-tecnico#solicitar" },
  },
];

/** Barra que se llena durante el slide; al terminar avanza al siguiente. */
function Progress({ paused, onDone }: { paused: boolean; onDone: () => void }) {
  return (
    <span
      aria-hidden
      onAnimationEnd={onDone}
      className="absolute inset-0 origin-left rounded-full bg-sun-400"
      style={{
        animation: `hero-progress ${SLIDE_MS}ms linear forwards`,
        animationPlayState: paused ? "paused" : "running",
      }}
    />
  );
}

export function Hero() {
  const [index, setIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const touchStartX = useRef<number | null>(null);

  const slide = SLIDES[index];
  const paused = isHovering || isHidden;
  const goTo = (next: number) => setIndex((next + SLIDES.length) % SLIDES.length);
  const next = () => goTo(index + 1);
  const prev = () => goTo(index - 1);

  // Pausar cuando la pestaña no está visible
  useEffect(() => {
    const onVisibility = () => setIsHidden(document.hidden);
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  const hoverHandlers = {
    onMouseEnter: () => setIsHovering(true),
    onMouseLeave: () => setIsHovering(false),
  };

  return (
    <section
      id="inicio"
      data-header-theme="dark"
      aria-roledescription="carrusel"
      aria-label="Destacados"
      className="relative isolate overflow-hidden bg-black"
      onTouchStart={(e) => (touchStartX.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touchStartX.current === null) return;
        const dx = e.changedTouches[0].clientX - touchStartX.current;
        if (Math.abs(dx) > 50) (dx < 0 ? next : prev)();
        touchStartX.current = null;
      }}
    >
      {/* Fondos: todos montados, solo cambia la opacidad (sin parpadeos) */}
      <div aria-hidden className="absolute inset-0 -z-10">
        {SLIDES.map((s, i) => (
          <div
            key={s.id}
            className={cn(
              "absolute inset-0 transition-opacity duration-700 ease-out",
              i === index ? "opacity-100" : "opacity-0"
            )}
          >
            <Image
              src={s.image}
              alt=""
              fill
              sizes="100vw"
              preload={i === 0}
              loading="eager"
              className={cn("object-cover", i === index && "animate-hero-zoom")}
            />
          </div>
        ))}
        {/* Degradado negro (antes azul) para leer el texto sobre la foto */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/65 to-black/15" />
        <div className="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-black/85 to-transparent" />
      </div>

      <div className="mx-auto flex min-h-svh max-w-7xl flex-col justify-center px-4 pb-32 pt-28 sm:px-6 lg:px-8 lg:pb-40">
        <div className="min-h-[29rem] max-w-2xl sm:min-h-[26rem]" {...hoverHandlers}>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={slide.id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0, transition: { duration: 0.4, ease: EASE_OUT } }}
              exit={{ opacity: 0, y: -8, transition: { duration: 0.16, ease: EASE_IN } }}
            >
              <p className="flex items-center gap-3 font-heading text-xs font-bold uppercase tracking-[0.18em] text-ink-100">
                <span className="tabular-nums">0{index + 1}</span>
                <span aria-hidden className="h-0.5 w-8 rounded-full bg-sun-400" />
                {slide.label}
              </p>
              <h1 className="mt-5 font-heading text-4xl font-extrabold leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl">
                {slide.title[0]}
                <br />
                <span>{slide.title[1]}</span>
              </h1>
              <p className="mt-6 max-w-xl text-[15px] leading-relaxed text-white/75 sm:text-lg">
                {slide.description}
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button asChild size="lg" variant="light">
                  <Link href={slide.primary.href}>
                    {slide.primary.label} <ArrowRight />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="glass">
                  <Link href={slide.secondary.href}>{slide.secondary.label}</Link>
                </Button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Controles */}
      <div className="absolute inset-x-0 bottom-0" {...hoverHandlers}>
        <div className="mx-auto max-w-7xl px-4 pb-8 sm:px-6 lg:px-8 lg:pb-10">
          {/* Escritorio: pestañas con progreso */}
          <div className="hidden grid-cols-4 gap-6 lg:grid">
            {SLIDES.map((s, i) => {
              const isActive = i === index;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => goTo(i)}
                  aria-current={isActive}
                  aria-label={`Ver: ${s.label}`}
                  className="group py-2 text-left"
                >
                  <span className="relative block h-0.5 overflow-hidden rounded-full bg-white/20">
                    {isActive && <Progress key={index} paused={paused} onDone={next} />}
                  </span>
                  <span
                    className={cn(
                      "mt-3 flex items-center gap-2 text-sm font-medium transition-colors duration-200",
                      isActive ? "text-white" : "text-white/50 group-hover:text-white/80"
                    )}
                  >
                    <span className="tabular-nums text-white/40">0{i + 1}</span>
                    {s.label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Móvil: indicadores y flechas */}
          <div className="flex items-center justify-between lg:hidden">
            <div className="flex items-center gap-2">
              {SLIDES.map((s, i) => {
                const isActive = i === index;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => goTo(i)}
                    aria-current={isActive}
                    aria-label={`Ver: ${s.label}`}
                    className="flex h-8 items-center"
                  >
                    <span
                      className={cn(
                        "relative block h-1 overflow-hidden rounded-full bg-white/25 transition-[width] duration-300",
                        isActive ? "w-10" : "w-5"
                      )}
                    >
                      {isActive && <Progress key={index} paused={paused} onDone={next} />}
                    </span>
                  </button>
                );
              })}
            </div>
            <div className="flex gap-2">
              <Button variant="glass" size="icon" onClick={prev} aria-label="Slide anterior">
                <ChevronLeft />
              </Button>
              <Button variant="glass" size="icon" onClick={next} aria-label="Slide siguiente">
                <ChevronRight />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
