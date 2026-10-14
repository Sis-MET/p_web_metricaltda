"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { EASE_OUT } from "@/lib/motion";
import { LAUNCHER_ID, PANEL_ID, assistantPanel, useAssistantEngagement, useAssistantOpen } from "@/lib/assistant/panel";
import { cn } from "@/lib/utils";
import { AssistantAvatar, TypingDots } from "./AssistantAvatar";
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
  const engagement = useAssistantEngagement();
  const invitation = invitationFor(usePathname());
  const canInvite = engagement === "nuevo" && invitation !== undefined;

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

  const showInvitation = inviting && !open && invitation !== undefined;
  const pending = engagement === "invitado" && !showInvitation;
  const label = open ? "Cerrar el Asistente de Métrica" : pending ? "Abrir el Asistente de Métrica (1 mensaje)" : "Abrir el Asistente de Métrica";

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
          {showInvitation && (
            <Invitation
              content={invitation}
              onReply={ask}
              onOpen={assistantPanel.open}
              onClose={() => {
                setInviting(false);
                assistantPanel.dismissInvitation();
              }}
            />
          )}
        </AnimatePresence>

        <button
          id={LAUNCHER_ID}
          type="button"
          onClick={assistantPanel.toggle}
          onPointerEnter={loadPanel}
          onFocus={loadPanel}
          aria-label={label}
          title={label}
          aria-expanded={open}
          aria-controls={mounted ? PANEL_ID : undefined}
          className="group relative flex items-center rounded-full bg-mt-800 text-white shadow-[0_18px_40px_-14px_rgba(0,20,46,0.8)] ring-1 ring-white/15 transition-[translate,box-shadow] duration-300 ease-out-expo hover:-translate-y-0.5 hover:shadow-[0_22px_44px_-14px_rgba(0,20,46,0.9)]"
        >
          {/* Ondas mientras el visitante aún no conoce el asesor */}
          {engagement === "nuevo" && !open && (
            <span aria-hidden className="pointer-events-none absolute inset-y-0 right-0 aspect-square">
              <span className="absolute inset-0 rounded-full bg-mt-500 motion-safe:animate-assistant-sonar" />
              <span className="absolute inset-0 rounded-full bg-mt-500 [animation-delay:1.4s] motion-safe:animate-assistant-sonar" />
            </span>
          )}

          {/* La etiqueta se despliega al pasar el mouse o con el teclado */}
          <span
            aria-hidden
            className="grid grid-cols-[0fr] transition-[grid-template-columns] duration-500 ease-out-expo group-hover:grid-cols-[1fr] group-focus-visible:grid-cols-[1fr]"
          >
            <span className="overflow-hidden">
              <span className="block whitespace-nowrap pl-5 pr-1 text-sm font-semibold">{open ? "Cerrar" : "Asistente de Métrica"}</span>
            </span>
          </span>

          <span className="relative size-14 sm:size-[3.75rem]">
            <AnimatePresence initial={false} mode="popLayout">
              {open ? (
                <motion.span
                  key="cerrar"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.35, ease: EASE_OUT }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <X className="size-6" aria-hidden />
                </motion.span>
              ) : (
                <motion.span
                  key="asesor"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.35, ease: EASE_OUT }}
                  className="absolute inset-0"
                >
                  <AssistantAvatar className="size-full ring-0" />
                </motion.span>
              )}
            </AnimatePresence>

            {!open &&
              (pending ? (
                <span
                  aria-hidden
                  className="absolute -right-0.5 -top-0.5 flex size-5 items-center justify-center rounded-full bg-red-500 text-[11px] font-bold ring-2 ring-white"
                >
                  1
                </span>
              ) : (
                <span aria-hidden className="absolute bottom-0.5 right-0.5 size-3.5 rounded-full bg-emerald-400 ring-2 ring-mt-800" />
              ))}
          </span>
        </button>
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

/** Burbuja del asesor: primero "escribe", luego invita y ofrece respuestas de un toque */
function Invitation({ content, onReply, onOpen, onClose }: InvitationProps) {
  const [typing, setTyping] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setTyping(false), 1300);
    return () => clearTimeout(timer);
  }, []);

  return (
    <motion.div
      role="status"
      initial={{ opacity: 0, y: 14, scale: 0.94 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.97 }}
      transition={{ type: "spring", stiffness: 380, damping: 28 }}
      style={{ transformOrigin: "bottom right" }}
      className="relative w-[min(20rem,calc(100vw-2rem))] rounded-2xl border border-neutral-200 bg-white p-4 text-ink-900 shadow-[0_24px_60px_-24px_rgba(0,20,46,0.45)]"
    >
      <div className="flex items-center gap-2.5">
        <AssistantAvatar className="size-9" thinking={typing} />
        <div className="min-w-0 flex-1">
          <p className="font-heading text-sm font-bold leading-tight text-ink-950">Asistente de Métrica</p>
          <p className="flex items-center gap-1.5 text-xs text-neutral-500">
            <span aria-hidden className="size-1.5 rounded-full bg-emerald-500" />
            {typing ? "Escribiendo…" : "En línea"}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar la invitación"
          className="flex size-8 items-center justify-center rounded-full text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-ink-900"
        >
          <X className="size-4" aria-hidden />
        </button>
      </div>

      {typing ? (
        <TypingDots className="mt-3" />
      ) : (
        <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: EASE_OUT }}>
          <button type="button" onClick={onOpen} className="mt-3 block text-left text-[15px] leading-snug text-ink-800">
            {content.text}
          </button>
          <div className="mt-3 flex flex-wrap gap-2">
            {content.replies.map((reply, i) => (
              <motion.button
                key={reply.label}
                type="button"
                onClick={() => onReply(reply.message)}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + i * 0.08, duration: 0.35, ease: EASE_OUT }}
                className="rounded-full border border-mt-200 bg-mt-50 px-3.5 py-1.5 text-sm font-medium text-mt-800 transition-colors hover:border-mt-400 hover:bg-mt-100"
              >
                {reply.label}
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Punta que apunta al botón */}
      <span aria-hidden className="absolute -bottom-1.5 right-6 size-3 rotate-45 border-b border-r border-neutral-200 bg-white" />
    </motion.div>
  );
}
