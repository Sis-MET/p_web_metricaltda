import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Campo del panel: etiqueta, control, ayuda y error. `htmlFor` enlaza la etiqueta con el control. */
export function Field({
  label,
  htmlFor,
  hint,
  error,
  required,
  className,
  children,
}: {
  label: string;
  htmlFor?: string;
  hint?: ReactNode;
  error?: string;
  required?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={htmlFor} className="text-sm font-medium text-ink-950">
        {label}
        {required && (
          <span className="text-neutral-400" aria-hidden>
            {" "}
            *
          </span>
        )}
      </label>
      {children}
      {error ? (
        <p id={htmlFor && `${htmlFor}-error`} className="text-xs font-medium text-red-600">
          {error}
        </p>
      ) : (
        hint && <p className="text-xs leading-relaxed text-neutral-500">{hint}</p>
      )}
    </div>
  );
}

/** Aviso del panel: éxito, error o información */
export function Notice({ tone, children, className }: { tone: "ok" | "error" | "info"; children: ReactNode; className?: string }) {
  return (
    <p
      role={tone === "error" ? "alert" : "status"}
      className={cn(
        "rounded-xl border px-4 py-3 text-sm leading-relaxed",
        tone === "ok" && "border-emerald-200 bg-emerald-50 text-emerald-800",
        tone === "error" && "border-red-200 bg-red-50 text-red-700",
        tone === "info" && "border-neutral-200 bg-white text-neutral-700",
        className
      )}
    >
      {children}
    </p>
  );
}
