import { cn } from "@/lib/utils";

/** Retícula de plano técnico; la máscara (por className) define dónde se desvanece. */
export function GridPattern({ tone = "dark", size = 64, className }: { tone?: "dark" | "light"; size?: number; className?: string }) {
  const line = tone === "dark" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)";
  return (
    <div
      aria-hidden
      className={cn("pointer-events-none absolute inset-0 -z-10", className)}
      style={{
        backgroundImage: `linear-gradient(to right, ${line} 1px, transparent 1px), linear-gradient(to bottom, ${line} 1px, transparent 1px)`,
        backgroundSize: `${size}px ${size}px`,
      }}
    />
  );
}

/** Brillo azul METTLER, sutil, que da profundidad a los fondos azules */
export function Glow({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute -z-10 size-[44rem] rounded-full bg-[radial-gradient(circle,rgba(74,127,189,0.32),transparent_62%)]",
        className
      )}
    />
  );
}
