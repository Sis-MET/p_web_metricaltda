import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Tone = "light" | "dark";

export function Eyebrow({
  children,
  tone = "light",
  className,
}: {
  children: ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <p
      className={cn(
        "inline-flex items-center gap-3 font-heading text-xs font-bold uppercase tracking-[0.18em]",
        tone === "dark" ? "text-ink-300" : "text-ink-500",
        className
      )}
    >
      {/* Hilo de marca: una barrita amarilla Métrica, nada más */}
      <span aria-hidden className="h-0.5 w-8 rounded-full bg-sun-400" />
      {children}
    </p>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  tone = "light",
  align = "left",
  className,
}: {
  eyebrow: string;
  title: ReactNode;
  description?: ReactNode;
  tone?: Tone;
  align?: "left" | "center";
  className?: string;
}) {
  return (
    <div className={cn(align === "center" && "mx-auto text-center", className)}>
      <Eyebrow tone={tone}>{eyebrow}</Eyebrow>
      <h2
        className={cn(
          "mt-4 font-heading text-3xl font-extrabold leading-[1.1] tracking-tight sm:text-4xl lg:text-5xl",
          tone === "dark" ? "text-white" : "text-ink-950"
        )}
      >
        {title}
      </h2>
      {description && (
        <p
          className={cn(
            "mt-5 text-base leading-relaxed sm:text-lg",
            tone === "dark" ? "text-white/75" : "text-neutral-600",
            align === "center" && "mx-auto max-w-2xl"
          )}
        >
          {description}
        </p>
      )}
    </div>
  );
}
