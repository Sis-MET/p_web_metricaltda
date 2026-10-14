"use client";

import type { ButtonHTMLAttributes, ComponentProps, ReactNode } from "react";
import { MessageSquareText, X } from "lucide-react";
import { Glow, GridPattern } from "@/components/ui/Backdrop";
import { ShimmerText } from "@/components/ui/ShimmerText";
import { PANEL_ID, assistantPanel, useAssistantOpen } from "@/lib/assistant/panel";
import { cn } from "@/lib/utils";

/**
 * Marco del chat del Asistente de Métrica: el panel y su encabezado. Es liviano a propósito (no
 * trae el SDK de IA): mientras el chat se descarga, el mismo marco avisa que se está cargando.
 */

type PanelFrameProps = Omit<ComponentProps<"section">, "id" | "role"> & {
  open: boolean;
  subtitle: ReactNode;
  /** Botones del encabezado, antes del de cerrar */
  actions?: ReactNode;
};

export function PanelFrame({ open, subtitle, actions, className, children, ...props }: PanelFrameProps) {
  return (
    <section
      id={PANEL_ID}
      role="dialog"
      aria-label="Asistente de Métrica"
      inert={!open}
      onKeyDown={(event) => event.key === "Escape" && assistantPanel.close()}
      className={cn(
        "fixed inset-0 z-[60] flex origin-bottom flex-col overflow-hidden bg-white transition-[opacity,translate,scale,visibility] duration-400 ease-out-expo",
        // En el escritorio crece desde el botón flotante
        "sm:inset-auto sm:bottom-[5.5rem] sm:right-6 sm:h-[min(42rem,calc(100svh-12rem))] sm:w-[26rem] sm:origin-bottom-right sm:rounded-[1.75rem] sm:border sm:border-neutral-200 sm:shadow-[0_40px_80px_-32px_rgba(0,20,46,0.5)]",
        open ? "visible translate-y-0 scale-100 opacity-100" : "invisible translate-y-4 scale-95 opacity-0",
        className
      )}
      {...props}
    >
      <header className="relative isolate flex items-center gap-3 overflow-hidden bg-mt-800 px-4 py-4 text-white">
        <GridPattern size={22} className="[mask-image:linear-gradient(to_bottom,black,transparent)]" />
        <Glow className="-right-80 -top-96" />
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/15">
          <MessageSquareText className="size-5" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="font-heading text-base font-bold leading-tight">Asistente de Métrica</h2>
          <p className="mt-0.5 text-xs text-white/70">{subtitle}</p>
        </div>
        {actions}
        <HeaderButton label="Cerrar el asistente" onClick={assistantPanel.close}>
          <X />
        </HeaderButton>
      </header>
      {children}
    </section>
  );
}

type HeaderButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & { label: string };

export const HeaderButton = ({ label, className, ...props }: HeaderButtonProps) => (
  <button
    type="button"
    aria-label={label}
    title={label}
    className={cn(
      "flex size-9 items-center justify-center rounded-full text-white/80 transition-colors hover:bg-white/10 hover:text-white [&_svg]:size-[1.125rem]",
      className
    )}
    {...props}
  />
);

/** Mientras se descarga el chat: el marco abierto y el aviso, para que el clic tenga respuesta inmediata */
export function PanelLoading() {
  const open = useAssistantOpen();
  return (
    <PanelFrame open={open} subtitle="Asesoría en pesaje, calibración y soporte" aria-busy>
      <div role="status" className="flex flex-1 items-center justify-center px-6 text-center text-sm font-semibold">
        <ShimmerText>Cargando el Asistente de Métrica…</ShimmerText>
      </div>
    </PanelFrame>
  );
}
