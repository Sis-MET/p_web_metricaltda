"use client";

import { useEffect, useRef, ReactNode } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface AnimatedContentProps {
  children: ReactNode;
  distance?: number;
  direction?: "vertical" | "horizontal";
  reverse?: boolean;
  duration?: number;
  ease?: string;
  initialOpacity?: number;
  animateOpacity?: boolean;
  scale?: number;
  threshold?: number;
  delay?: number;
  className?: string;
}

export default function AnimatedContent({
  children,
  distance = 100,
  direction = "vertical",
  reverse = false,
  duration = 0.8,
  ease = "power3.out",
  initialOpacity = 0,
  animateOpacity = true,
  scale = 1,
  threshold = 0.1,
  delay = 0,
  className,
}: AnimatedContentProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const axis = direction === "vertical" ? "y" : "x";
    const offset = reverse ? -distance : distance;

    const fromVars: gsap.TweenVars = {
      [axis]: offset,
      scale: scale !== 1 ? scale : undefined,
      opacity: animateOpacity ? initialOpacity : undefined,
    };

    const toVars: gsap.TweenVars = {
      [axis]: 0,
      scale: 1,
      opacity: animateOpacity ? 1 : undefined,
      duration,
      ease,
      delay,
      scrollTrigger: {
        trigger: el,
        start: `top ${Math.round((1 - threshold) * 100)}%`,
        toggleActions: "play none none none",
      },
    };

    gsap.fromTo(el, fromVars, toVars);

    return () => {
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, [distance, direction, reverse, duration, ease, initialOpacity, animateOpacity, scale, threshold, delay]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
