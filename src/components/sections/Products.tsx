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
    const piso   = pisoRef.current;
    const camion = camionRef.current;
    const tPiso   = textPisoRef.current;
    const tCamion = textCamionRef.current;
    if (!piso || !camion || !tPiso || !tCamion) return;

    if (slide === 1) {
      // Piso + text-piso fade out
      gsap.to(tPiso,  { opacity: 0, y: -20, duration: 0.5, ease: "power2.in" });
      gsap.to(piso,   { opacity: 0, x: "60%", duration: 0.7, ease: "power2.in" });

      // Camion slides in from left
      gsap.fromTo(camion,
        { x: "-110%", opacity: 0 },
        { x: "0%", opacity: 1, duration: 0.9, ease: "power3.out", delay: 0.3 }
      );
      // Text-camion fades in
      gsap.fromTo(tCamion,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.7, ease: "power3.out", delay: 0.5 }
      );
    } else {
      // Camion slides out left, text-camion fades out
      gsap.to(tCamion, { opacity: 0, y: -20, duration: 0.45, ease: "power2.in" });
      gsap.to(camion,  { x: "-110%", opacity: 0, duration: 0.7, ease: "power2.in" });

      // Piso slides back in from right
      gsap.fromTo(piso,
        { x: "60%", opacity: 0 },
        { x: "0%", opacity: 1, duration: 0.9, ease: "power3.out", delay: 0.35 }
      );
      gsap.fromTo(tPiso,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.7, ease: "power3.out", delay: 0.5 }
      );
    }
  }, [slide]);

  /* ── Mouse-tilt on whichever image is active ── */
  useEffect(() => {
    const makeInteractive = (el: HTMLDivElement | null) => {
      if (!el) return () => {};
      const onMove = (e: MouseEvent) => {
        const r  = el.getBoundingClientRect();
        const dx = (e.clientX - (r.left + r.width  / 2)) / (r.width  / 2);
        const dy = (e.clientY - (r.top  + r.height / 2)) / (r.height / 2);
        gsap.to(el, { rotateY: dx * 10, rotateX: -dy * 10, duration: 0.4, ease: "power2.out", transformPerspective: 800 });
      };
      const onLeave = () => gsap.to(el, { rotateY: 0, rotateX: 0, duration: 0.6, ease: "power3.out" });
      el.addEventListener("mousemove", onMove);
      el.addEventListener("mouseleave", onLeave);
      return () => { el.removeEventListener("mousemove", onMove); el.removeEventListener("mouseleave", onLeave); };
    };
    const c1 = makeInteractive(pisoRef.current);
    const c2 = makeInteractive(camionRef.current);
    return () => { c1(); c2(); };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="productos"
      className="relative min-h-[500px] lg:min-h-[540px] bg-slate-50 dark:bg-slate-900 overflow-hidden"
    >
      {/* Background decoratives */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-blue-50/50 dark:bg-blue-900/10 skew-x-12 translate-x-32 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-1/3 h-full bg-cyan-50/50 dark:bg-cyan-900/10 -skew-x-12 -translate-x-32 pointer-events-none" />

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
        className="absolute bottom-[-120px] right-0 lg:right-[4%] w-[20rem] sm:w-[28rem] lg:w-[40rem] cursor-pointer z-20"
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
        className="absolute bottom-[-100px] left-[-4%] lg:left-[-10%] w-[28rem] sm:w-[42rem] lg:w-[68rem] cursor-pointer z-20"
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
