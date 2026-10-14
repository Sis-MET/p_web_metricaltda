"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Sparkles, X } from "lucide-react";
import { LAUNCHER_ID, PANEL_ID, assistantPanel, useAssistantOpen } from "@/lib/assistant/panel";
import { cn } from "@/lib/utils";

const loadPanel = () => import("./AssistantPanel");

// El chat y el SDK de IA se descargan recién cuando el visitante muestra interés
const AssistantPanel = dynamic(() => loadPanel().then((module) => module.AssistantPanel), { ssr: false });

/** Botón flotante del asesor virtual, en todas las páginas. */
export function AssistantLauncher() {
  const open = useAssistantOpen();
  // Una vez abierto, el chat queda montado: cerrar no borra la conversación
  const [mounted, setMounted] = useState(open);
  if (open && !mounted) setMounted(true);

  return (
    <>
      {mounted && <AssistantPanel open={open} />}
      <button
        id={LAUNCHER_ID}
        type="button"
        onClick={assistantPanel.toggle}
        onPointerEnter={loadPanel}
        onFocus={loadPanel}
        aria-expanded={open}
        aria-controls={mounted ? PANEL_ID : undefined}
        className={cn(
          "fixed bottom-4 right-4 z-40 inline-flex h-12 items-center gap-2 rounded-full bg-mt-800 pl-4 pr-5 font-body text-sm font-semibold text-white ring-1 ring-white/15",
          "shadow-[0_18px_40px_-14px_rgba(0,20,46,0.75)] transition-[background-color,translate,box-shadow] duration-300 ease-out-expo hover:-translate-y-0.5 hover:bg-mt-700 sm:bottom-6 sm:right-6",
          // En el celular el chat ocupa la pantalla y tiene su propio botón de cierre
          open && "max-sm:hidden"
        )}
      >
        {open ? <X className="size-[1.125rem]" aria-hidden /> : <Sparkles className="size-[1.125rem]" aria-hidden />}
        {open ? "Cerrar" : "Asesor virtual"}
      </button>
    </>
  );
}
