"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Phone, ChevronRight, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";

// Slide Data
const SLIDES = [
  {
    id: "industrial",
    title: (
      <>
        Precisión en <br />
        <span className="text-[#f9e300]">
          Balanzas Industriales
        </span>
      </>
    ),
    description:
      "Robustez, Confiabilidad, Precisión y Ergonomía: Las balanzas METTLER TOLEDO están diseñadas para enfrentar los procesos de pesaje más exigentes en entornos industriales desafiantes. Garantizamos la máxima precisión y confiabilidad en cada medición, sin comprometer la facilidad de uso y ergonomía para los operadores.",
    image: "/images/hero/balanzas_industriales.svg",
    ctaPrimary: "Ver Catálogo",
    ctaSecondary: "Cotizar",
  },
  {
    id: "trucks",
    title: (
      <>
        Control Total con <br />
        <span className="text-[#f9e300]">
          Básculas de Camiones
        </span>
      </>
    ),
    description:
      "La tecnología avanzada, durabilidad y exactitud de las básculas de camiones Powercell PDX de Mettler Toledo permiten controlar grandes volúmenes transportados por los camiones con la más alta precisión.",
    image: "/images/hero/basculas_camion.svg",
    ctaPrimary: "Ver Modelos",
    ctaSecondary: "Asesoría",
  },
  {
    id: "calibration",
    title: (
      <>
        Confianza en su <br />
        <span className="text-[#f9e300]">
          Laboratorio de Calibración
        </span>
      </>
    ),
    description:
      "Garantice la precisión y confiabilidad de sus balanzas y pesas con nuestro servicio de calibración, consulte sobre nuestros alcances.",
    image: "/images/hero/calibracion.svg",
    ctaPrimary: "Nuestros Servicios",
    ctaSecondary: "Agendar",
  },
  {
    id: "support",
    title: (
      <>
        Respaldo con <br />
        <span className="text-[#f9e300]">
          Soporte Técnico
        </span>
      </>
    ),
    description:
      "Servicio para balanzas industriales y básculas de camiones. Profesionalismo, experiencia y compromiso para asegurar la precisión y fiabilidad de tus equipos.",
    image: "/images/hero/soporte_tecnico.svg",
    ctaPrimary: "Soporte",
    ctaSecondary: "Contacto",
  },
];

export function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto-play
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
  };

  const slide = SLIDES[currentSlide];

  return (
    <section className="relative h-screen w-full flex items-center justify-center overflow-hidden bg-slate-900">
      {/* Background Images with Transitions */}
      <AnimatePresence mode="popLayout">
        <motion.div
          key={slide.id}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1, ease: "easeInOut" }}
          className="absolute inset-0 z-0"
        >
          <Image
            src={slide.image}
            alt={slide.id}
            fill
            className="object-cover object-center opacity-60"
            priority
          />
          {/* Dark Overlay Gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/70 to-slate-950/30" />
        </motion.div>
      </AnimatePresence>

      {/* Content Container */}
      <div className="container mx-auto px-4 relative z-10 flex flex-col justify-center h-full">
        <div className="max-w-3xl space-y-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={slide.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="space-y-6"
            >
              <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white leading-tight">
                {slide.title}
              </h1>
              <p className="text-xl md:text-2xl text-slate-200 leading-relaxed max-w-2xl">
                {slide.description}
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button size="lg" className="rounded-full text-base px-8 py-6 bg-[#f9e300] text-slate-900 font-bold hover:bg-[#f9e300]/90 hover:scale-105 transition-all duration-300 shadow-[0_0_20px_rgba(249,227,0,0.3)]">
                  {slide.ctaPrimary} <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="rounded-full text-base px-8 py-6 border-white/20 bg-white/5 text-white hover:bg-white/10 hover:border-white/40 backdrop-blur-sm transform-gpu"
                >
                  {slide.ctaSecondary} <Phone className="ml-2 w-5 h-5" />
                </Button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="absolute bottom-10 right-10 flex gap-4 z-20">
        <button
          onClick={prevSlide}
          className="p-3 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 backdrop-blur-md transition-all group"
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-6 h-6 text-white group-hover:-translate-x-0.5 transition-transform" />
        </button>
        <button
          onClick={nextSlide}
          className="p-3 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 backdrop-blur-md transition-all group"
          aria-label="Next slide"
        >
          <ChevronRight className="w-6 h-6 text-white group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* Slide Indicators */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-3 z-20">
        {SLIDES.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`h-1.5 rounded-full transition-all duration-500 ${
              index === currentSlide
                ? "bg-[#f9e300] w-12 shadow-[0_0_10px_rgba(249,227,0,0.5)]"
                : "bg-white/30 w-6 hover:bg-white/50"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
