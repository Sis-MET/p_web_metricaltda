"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import CountUp from "react-countup";
import { ArrowRight, Phone } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const weightRef = useRef<HTMLDivElement>(null);
  const scaleRef = useRef<HTMLDivElement>(null);
  const displayRef = useRef<HTMLDivElement>(null);
  const indicatorRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: 0.5 });

      // Initial state
      gsap.set(weightRef.current, { y: -200, opacity: 0 });
      gsap.set(scaleRef.current, { scaleY: 1 });
      gsap.set(displayRef.current, { opacity: 0.5 });
      gsap.set(indicatorRef.current, { opacity: 0.2, boxShadow: "none" });

      // Animation sequence
      tl.to(weightRef.current, {
        y: 0,
        opacity: 1,
        duration: 1.2,
        ease: "bounce.out",
      })
        .to(
          scaleRef.current,
          {
            scaleY: 0.8,
            duration: 0.1,
            yoyo: true,
            repeat: 1,
            ease: "power2.inOut",
          },
          "-=0.4"
        )
        .to(indicatorRef.current, {
          opacity: 1,
          boxShadow: "0 0 15px #10b981",
          duration: 0.2,
        })
        .to(displayRef.current, {
          opacity: 1,
          color: "#0f172a", 
          duration: 0.3
        });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative min-h-[90vh] flex items-center pt-20 overflow-hidden bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900"
    >
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] dark:bg-[url('/grid-dark.svg')] opacity-20" />
      
      <div className="container mx-auto px-4 grid lg:grid-cols-2 gap-12 items-center relative z-10">
        
        {/* Text Content */}
        <div className="space-y-8 text-center lg:text-left">
          <h1 className="text-5xl lg:text-7xl font-bold tracking-tight text-slate-900 dark:text-white">
            Precisión que <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">
              Impulsa tu Industria
            </span>
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
            Expertos en soluciones de pesaje industrial y servicios de calibración certificada. 
            Garantizamos la exactitud que su negocio necesita.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
            <Button size="lg" className="rounded-full text-base group">
              Ver Productos <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button size="lg" variant="outline" className="rounded-full text-base">
              Contactar Ahora <Phone className="ml-2 w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Animation Demo */}
        <div className="relative h-[400px] flex items-center justify-center perspective-1000">
          
          {/* Glass Card Container */}
          <div className="relative w-80 h-96 glass dark:glass-dark rounded-3xl p-8 flex flex-col items-center justify-end shadow-2xl border-t border-white/50">
            
            {/* Hanging Weight Drop Zone */}
            <div className="absolute top-10 left-1/2 -translate-x-1/2 w-40 h-60 flex items-end justify-center pb-2">
               {/* Weight Object */}
               <div
                ref={weightRef}
                className="w-24 h-28 bg-gradient-to-br from-slate-700 to-slate-900 rounded-t-lg rounded-b-3xl shadow-xl flex items-center justify-center text-white font-mono text-xs border-t border-slate-600 z-20"
              >
                <div className="absolute top-0 w-8 h-4 bg-slate-500 rounded-t-full -mt-4 border border-slate-600" />
                500g
              </div>
            </div>

            {/* Scale Base */}
            <div ref={scaleRef} className="w-full relative z-10 origin-bottom">
              {/* Pan */}
              <div className="w-48 h-4 bg-slate-300 dark:bg-slate-600 rounded-full mx-auto mb-1 shadow-md" />
              <div className="w-6 h-8 bg-slate-400 dark:bg-slate-700 mx-auto" />
              
              {/* Main Body */}
              <div className="w-full h-32 bg-slate-100 dark:bg-slate-800 rounded-2xl shadow-inner border border-slate-200 dark:border-slate-700 p-4 flex flex-col items-center justify-center gap-4">
                
                {/* Digital Display */}
                <div className="relative w-full h-16 bg-slate-300 dark:bg-slate-900 rounded border-2 border-slate-400 dark:border-slate-700 flex items-center justify-end px-4 overflow-hidden">
                  <div ref={displayRef} className="font-mono text-3xl font-bold text-slate-400/50 dark:text-slate-600/50 transition-colors">
                     <CountUp end={500.00} decimals={2} duration={2} suffix=" g" preserveValue={true} />
                  </div>
                  <span className="absolute top-1 left-2 text-[10px] text-slate-500 font-bold tracking-widest">METRICA</span>
                </div>

                {/* Status Indicators */}
                <div className="flex gap-4 w-full justify-center">
                   <div ref={indicatorRef} className="w-3 h-3 rounded-full bg-green-500 opacity-20 transition-all duration-300" />
                   <div className="w-3 h-3 rounded-full bg-red-400 opacity-20" />
                </div>

              </div>
            </div>
            
            {/* Platform Shadow */}
            <div className="absolute bottom-4 w-60 h-4 bg-black/20 blur-xl rounded-full z-0" />
          </div>
        </div>

      </div>
    </section>
  );
}
