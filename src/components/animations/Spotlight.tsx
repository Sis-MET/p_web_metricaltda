"use client";

import type { PointerEvent, ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Halo de luz que sigue al cursor sobre una tarjeta (sin re-renderizar: solo variables CSS). */
export function Spotlight({ className, children }: { className?: string; children: ReactNode }) {
  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--spot-x", `${e.clientX - rect.left}px`);
    e.currentTarget.style.setProperty("--spot-y", `${e.clientY - rect.top}px`);
  };

  return (
    <div onPointerMove={onPointerMove} className={cn("group/spot relative", className)}>
      {children}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-300 group-hover/spot:opacity-100"
        style={{
          background:
            "radial-gradient(420px circle at var(--spot-x, 50%) var(--spot-y, 50%), rgba(249,227,0,0.14), transparent 45%)",
        }}
      />
    </div>
  );
}
