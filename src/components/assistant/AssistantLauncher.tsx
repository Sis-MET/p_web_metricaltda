"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { MessageSquareText, X } from "lucide-react";
import { EASE_OUT } from "@/lib/motion";
import { LAUNCHER_ID, PANEL_ID, assistantPanel, useAssistantOpen, useInvitationPending } from "@/lib/assistant/panel";
import { cn } from "@/lib/utils";
import { invitationFor, type Invitation as InvitationContent } from "./prompts";

const loadPanel = () => import("./AssistantPanel");

// El chat y el SDK de IA se descargan recién cuando el visitante muestra interés
const AssistantPanel = dynamic(() => loadPanel().then((module) => module.AssistantPanel), { ssr: false });

/** La invitación aparece una vez por visita, cuando el visitante ya miró la página */
const INVITE_AFTER_MS = 7000;
const INVITE_FOR_MS = 25000;

/** Abre el chat y envía la pregunta elegida */
const ask = (message: string) => {
  assistantPanel.open();
  void loadPanel().then((module) => module.askAssistant(message));
};

/** Botón flotante del Asistente de Métrica, en todas las páginas, con su invitación. */
export function AssistantLauncher() {
  const open = useAssistantOpen();
  const invitation = invitationFor(usePathname());
  const canInvite = useInvitationPending() && invitation !== undefined;

  // Una vez abierto, el chat queda montado: cerrar no borra la conversación
  const [mounted, setMounted] = useState(open);
  if (open && !mounted) setMounted(true);

  const [inviting, setInviting] = useState(false);

  useEffect(() => {
    if (!canInvite) return;
    const timer = setTimeout(() => {
      setInviting(true);
      assistantPanel.invited();
    }, INVITE_AFTER_MS);
    return () => clearTimeout(timer);
  }, [canInvite]);

  useEffect(() => {
    if (!inviting) return;
    const timer = setTimeout(() => setInviting(false), INVITE_FOR_MS);
    return () => clearTimeout(timer);
  }, [inviting]);

  const label = open ? "Cerrar el Asistente de Métrica" : "Abrir el Asistente de Métrica";

  return (
    <>
      {mounted && <AssistantPanel open={open} />}
      <div
        className={cn(
          "fixed bottom-4 right-4 z-40 flex flex-col items-end gap-3 sm:bottom-6 sm:right-6",
          // En el celular el chat ocupa la pantalla y tiene su propio botón de cierre
          open && "max-sm:hidden"
        )}
      >
        <AnimatePresence>
          {inviting && !open && invitation && (
            <Invitation content={invitation} onReply={ask} onOpen={assistantPanel.open} onClose={() => setInviting(false)} />
          )}
        </AnimatePresence>

        <motion.button
          id={LAUNCHER_ID}
          type="button"
          onClick={assistantPanel.toggle}
          onPointerEnter={loadPanel}
          onFocus={loadPanel}
          aria-label={label}
          title={label}
          aria-expanded={open}
          aria-controls={mounted ? PANEL_ID : undefined}
          // Entra con la página, sin animaciones que distraigan después
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5, ease: EASE_OUT }}
          className="group flex items-center rounded-full bg-mt-800 text-white shadow-[0_16px_36px_-14px_rgba(0,20,46,0.75)] ring-1 ring-white/10 transition-[background-color,box-shadow] duration-300 hover:bg-mt-700 hover:shadow-[0_20px_40px_-14px_rgba(0,20,46,0.85)]"
        >
          {/* La etiqueta se despliega al pasar el mouse o con el teclado */}
          <span
            aria-hidden
            className="grid grid-cols-[0fr] transition-[grid-template-columns] duration-500 ease-out-expo group-hover:grid-cols-[1fr] group-focus-visible:grid-cols-[1fr]"
          >
            <span className="overflow-hidden">
              <span className="block whitespace-nowrap pl-5 pr-1 text-sm font-semibold">{open ? "Cerrar" : "Asistente de Métrica"}</span>
            </span>
          </span>

          <span className="relative size-12 sm:size-[3.25rem]">
            <AnimatePresence initial={false} mode="popLayout">
              <motion.span
                key={open ? "cerrar" : "abrir"}
                initial={{ rotate: open ? -90 : 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: open ? 90 : -90, opacity: 0 }}
                transition={{ duration: 0.3, ease: EASE_OUT }}
                className="absolute inset-0 flex items-center justify-center"
              >
                {open ? <X className="size-5" aria-hidden /> : <MessageSquareText className="size-[1.375rem]" aria-hidden />}
              </motion.span>
            </AnimatePresence>
          </span>
        </motion.button>
      </div>
    </>
  );
}

type InvitationProps = {
  content: InvitationContent;
  onReply: (message: string) => void;
  onOpen: () => void;
  onClose: () => void;
};

/** Invitación del asistente con respuestas sugeridas de un toque */
function Invitation({ content, onReply, onOpen, onClose }: InvitationProps) {
  return (
    <motion.div
      role="status"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 6, transition: { duration: 0.2 } }}
      transition={{ duration: 0.4, ease: EASE_OUT }}
      className="relative w-[min(20rem,calc(100vw-2rem))] rounded-2xl border border-neutral-200 bg-white p-4 text-ink-900 shadow-[0_24px_60px_-24px_rgba(0,20,46,0.45)]"
    >
      <div className="flex items-start gap-3">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-mt-800 text-white">
          <MessageSquareText className="size-4" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-mt-700">Asistente de Métrica</p>
          <button type="button" onClick={onOpen} className="mt-1 block text-left text-sm leading-snug text-ink-800">
            {content.text}
          </button>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar la invitación"
          className="-mr-1 -mt-1 flex size-8 shrink-0 items-center justify-center rounded-full text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-ink-900"
        >
          <X className="size-4" aria-hidden />
        </button>
      </div>

      <div className="mt-3 flex flex-wrap gap-2 pl-11">
        {content.replies.map((reply) => (
          <button
            key={reply.label}
            type="button"
            onClick={() => onReply(reply.message)}
            className="rounded-full border border-mt-200 bg-white px-3.5 py-1.5 text-sm font-medium text-mt-800 transition-colors hover:border-mt-400 hover:bg-mt-50"
          >
            {reply.label}
          </button>
        ))}
      </div>

      {/* Punta que apunta al botón */}
      <span aria-hidden className="absolute -bottom-1.5 right-5 size-3 rotate-45 border-b border-r border-neutral-200 bg-white" />
    </motion.div>
  );
}
