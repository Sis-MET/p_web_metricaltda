"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import RotatingText from "@/components/animations/RotatingText";
import AnimatedContent from "@/components/animations/AnimatedContent";

gsap.registerPlugin(ScrollTrigger);

const ROTATING_WORDS = ["Piso", "Mesa", "Banco", "Precisión"];

// Slide 0 = balanza piso (image right, text left)
// Slide 1 = báscula camión (image left, text right)
const PISO_DURATION = 14000;  // ~4 words × 3.5 s
const CAMION_DURATION = 6000; // stays 6 s

export function Products() {
  const sectionRef = useRef<HTMLElement>(null);
  const [slide, setSlide] = useState<0 | 1>(0);
  const isFirstRender = useRef(true); // skip transition on mount

  // Image refs
  const pisoRef   = useRef<HTMLDivElement>(null);
  const camionRef = useRef<HTMLDivElement>(null);

  // Text panel refs
  const textPisoRef   = useRef<HTMLDivElement>(null);
  const textCamionRef = useRef<HTMLDivElement>(null);

  /* ── Entrance animation (first load) ── */
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        pisoRef.current,
        { y: 80, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 1.1, ease: "power3.out",
          scrollTrigger: { trigger: sectionRef.current, start: "top 75%" },
        }
      );
      gsap.fromTo(
        textPisoRef.current,
        { y: 40, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.9, ease: "power3.out", delay: 0.1,
          scrollTrigger: { trigger: sectionRef.current, start: "top 75%" },
        }
      );
      // Camion starts invisible and off-screen left
      gsap.set(camionRef.current,   { x: "-110%", opacity: 0 });
      gsap.set(textCamionRef.current, { opacity: 0 });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  /* ── Cycle timer ── */
  useEffect(() => {
    let t1: ReturnType<typeof setTimeout>;
    let t2: ReturnType<typeof setTimeout>;

    const startCycle = () => {
      t1 = setTimeout(() => {
        setSlide(1);
        t2 = setTimeout(() => {
          setSlide(0);
          startCycle(); // loop
        }, CAMION_DURATION);
      }, PISO_DURATION);
    };

    startCycle();
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  /* ── GSAP transition when slide changes ── */
  useEffect(() => {
    // Skip on initial mount — entrance animation handles the first state
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const piso    = pisoRef.current;
    const camion  = camionRef.current;
    const tPiso   = textPisoRef.current;
    const tCamion = textCamionRef.current;
    if (!piso || !camion || !tPiso || !tCamion) return;

    // Kill ALL in-flight animations on these elements before starting a new transition
    gsap.killTweensOf([piso, camion, tPiso, tCamion]);

    if (slide === 1) {
      // Hard-reset camion to off-screen left immediately
      gsap.set(camion,  { x: "-110%", opacity: 0 });
      gsap.set(tCamion, { opacity: 0, y: 30 });

      const tl = gsap.timeline();
      // Phase 1 (0 – 0.55s): piso exits
      tl.to(tPiso, { opacity: 0, y: -20, duration: 0.45, ease: "power2.in" }, 0);
      tl.to(piso,  { opacity: 0, x: "60%", duration: 0.55, ease: "power2.in" }, 0);
      // Phase 2 (0.55s+): camion enters
      tl.to(camion,  { x: "0%", opacity: 1, duration: 0.85, ease: "power3.out" }, 0.55);
      tl.to(tCamion, { opacity: 1, y: 0,   duration: 0.7,  ease: "power3.out" }, 0.7);

    } else {
      // Hard-reset piso to off-screen right immediately
      gsap.set(piso,  { x: "60%", opacity: 0 });
      gsap.set(tPiso, { opacity: 0, y: 30 });

      const tl = gsap.timeline();
      // Phase 1 (0 – 0.55s): camion exits
      tl.to(tCamion, { opacity: 0, y: -20,   duration: 0.4,  ease: "power2.in" }, 0);
      tl.to(camion,  { x: "-110%", opacity: 0, duration: 0.55, ease: "power2.in" }, 0);
      // Phase 2 (0.55s+): piso enters
      tl.to(piso,  { x: "0%", opacity: 1, duration: 0.85, ease: "power3.out" }, 0.55);
      tl.to(tPiso, { opacity: 1, y: 0,   duration: 0.7,  ease: "power3.out" }, 0.7);
    }
  }, [slide]);

  // Mouse-tilt removed — hover effect handled via CSS (see className below)

  return (
    <section
      ref={sectionRef}
      id="productos"
      className="relative min-h-[500px] lg:min-h-[540px] bg-slate-50 dark:bg-slate-900 overflow-hidden"
    >

      {/* ── Ghost grid: both text panels share the same container/grid ── */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        <div className="container mx-auto h-full px-6 lg:px-16">
          <div className="h-full grid lg:grid-cols-2 gap-12 items-center">

            {/* SLIDE 0 — left column */}
            <div
              ref={textPisoRef}
              className="flex flex-col gap-8 pointer-events-auto"
            >
              <AnimatedContent distance={30} direction="vertical" duration={0.7} ease="power3.out" initialOpacity={0} animateOpacity threshold={0.2} delay={0.1}>
                <h2 className="font-heading text-4xl lg:text-5xl xl:text-6xl font-extrabold text-slate-900 dark:text-white leading-tight">
                  <span className="inline-flex items-center gap-3 flex-wrap">
                    <span>Balanzas de</span>
                    <RotatingText
                      texts={ROTATING_WORDS}
                      mainClassName="px-3 py-1 bg-[#04376e] text-white overflow-hidden rounded-xl justify-center"
                      staggerFrom="last"
                      initial={{ y: "100%" }}
                      animate={{ y: 0 }}
                      exit={{ y: "-120%" }}
                      staggerDuration={0.025}
                      splitLevelClassName="overflow-hidden pb-0.5"
                      transition={{ type: "spring", damping: 30, stiffness: 400 }}
                      rotationInterval={3500}
                    />
                  </span>
                </h2>
              </AnimatedContent>

              <AnimatedContent distance={20} direction="vertical" duration={0.7} ease="power2.out" initialOpacity={0} animateOpacity threshold={0.2} delay={0.2}>
                <p className="font-body text-slate-600 dark:text-slate-400 text-base lg:text-lg leading-relaxed max-w-md">
                  Tecnología METTLER TOLEDO de vanguardia adaptada a los procesos
                  más exigentes. Precisión, robustez y soporte técnico garantizado
                  en cada equipo.
                </p>
              </AnimatedContent>

              <AnimatedContent distance={15} direction="vertical" duration={0.6} ease="power2.out" initialOpacity={0} animateOpacity threshold={0.2} delay={0.3}>
                <a href="/productos">
                  <Button size="lg" className="font-body rounded-full text-base px-8 py-6 bg-[#f9e300] text-slate-900 font-bold hover:bg-[#f9e300]/90 hover:scale-105 transition-all duration-300 shadow-[0_0_20px_rgba(249,227,0,0.3)]">
                    Ver Catálogo <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </a>
              </AnimatedContent>
            </div>

            {/* SLIDE 1 — right column */}
            <div
              ref={textCamionRef}
              className="flex flex-col gap-6 pointer-events-auto"
              style={{ opacity: 0 }}
            >
              <h2 className="font-heading text-4xl lg:text-5xl xl:text-6xl font-extrabold text-slate-900 dark:text-white leading-tight">
                <span className="inline-flex items-center gap-3 flex-wrap">
                  <span>Básculas de</span>
                  <span className="px-3 py-1 bg-[#04376e] text-white rounded-xl font-extrabold">
                    Camiones
                  </span>
                </span>
              </h2>
              <p className="font-body text-slate-600 dark:text-slate-400 text-base lg:text-lg leading-relaxed max-w-md">
                Sistemas de pesaje de alto tonelaje con tecnología Powercell PDX.
                Control preciso de carga y logística para la industria más exigente.
              </p>
              <a href="/productos/basculas-camiones">
                <Button size="lg" className="font-body rounded-full text-base px-8 py-6 bg-[#f9e300] text-slate-900 font-bold hover:bg-[#f9e300]/90 hover:scale-105 transition-all duration-300 shadow-[0_0_20px_rgba(249,227,0,0.3)]">
                  Ver Detalles <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </a>
            </div>

          </div>
        </div>
      </div>


      {/* ── IMAGE: Balanza de Piso (bottom-right, bleeds down) ── */}
      <div
        ref={pisoRef}
        className="absolute bottom-[-120px] right-0 lg:right-[4%] w-[20rem] sm:w-[28rem] lg:w-[40rem] z-20 transition-transform duration-500 ease-out hover:scale-[1.03]"
        style={{ willChange: "transform" }}
      >
        <Image
          src="/images/sections/balanza_piso_products.svg"
          alt="Balanza de Piso Mettler Toledo"
          width={700}
          height={840}
          className="object-contain drop-shadow-2xl w-full h-auto"
          priority
        />
      </div>

      {/* ── IMAGE: Báscula de Camión (bottom-left, bleeds down, enters from left) ── */}
      <div
        ref={camionRef}
        className="absolute bottom-[-100px] left-[-4%] lg:left-[-10%] w-[28rem] sm:w-[42rem] lg:w-[68rem] z-20 transition-transform duration-500 ease-out hover:scale-[1.02]"
        style={{ willChange: "transform", opacity: 0 }}
      >
        <Image
          src="/images/sections/bas_camion_section.svg"
          alt="Báscula de Camiones Mettler Toledo"
          width={800}
          height={520}
          className="object-contain drop-shadow-2xl w-full h-auto"
        />
      </div>
    </section>
  );
}
