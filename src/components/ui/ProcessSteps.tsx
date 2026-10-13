import { Reveal } from "@/components/animations/Reveal";
import { cn } from "@/lib/utils";

/** Pasos numerados de un proceso (cómo se solicita un servicio, qué pasa con un reclamo…). */
export function ProcessSteps({ steps, className }: { steps: { title: string; text: string }[]; className?: string }) {
  return (
    <ol className={cn("grid gap-px overflow-hidden rounded-3xl border border-neutral-200 bg-neutral-200 sm:grid-cols-2 lg:grid-cols-4", className)}>
      {steps.map((step, i) => (
        <li key={step.title} className="bg-white p-6">
          <Reveal delay={i * 0.05}>
            <span className="flex size-8 items-center justify-center rounded-full bg-ink-900 font-mono text-xs font-semibold text-white">
              {i + 1}
            </span>
            <h3 className="mt-4 font-heading text-base font-bold text-ink-950">{step.title}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-neutral-600">{step.text}</p>
          </Reveal>
        </li>
      ))}
    </ol>
  );
}
