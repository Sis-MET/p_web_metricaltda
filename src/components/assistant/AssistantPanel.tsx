"use client";

import {
  useEffect,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type FormEvent,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
} from "react";
import { Chat, useChat } from "@ai-sdk/react";
import { APICallError, DefaultChatTransport } from "ai";
import { ArrowUp, MessageCircle, RotateCcw, Square, X } from "lucide-react";
import { Glow, GridPattern } from "@/components/ui/Backdrop";
import { Button } from "@/components/ui/Button";
import { whatsappUrl } from "@/content/company";
import { PANEL_ID, assistantPanel } from "@/lib/assistant/panel";
import { ASSISTANT_API, MAX_MESSAGE_LENGTH, MAX_MESSAGES, type AssistantFailure } from "@/lib/assistant/shared";
import type { AssistantMessage } from "@/lib/assistant/tools";
import { readStored, writeStored } from "@/lib/store";
import { cn } from "@/lib/utils";
import { AssistantAvatar, OnlineDot, TypingDots } from "./AssistantAvatar";
import { HandoffCard, ProductSuggestions, RichText } from "./parts";
import { STARTERS } from "./prompts";

const STORAGE_KEY = "metrica:asesor";

const GREETING =
  "¡Hola! Soy el Asistente de Métrica. Cuénteme a qué se dedica su empresa y qué necesita pesar: le recomiendo el equipo adecuado. También le oriento sobre calibración y soporte técnico.";

const FAILURES: Record<AssistantFailure, string> = {
  limite: "El asistente alcanzó su límite de consultas por ahora. Un asesor le atiende por WhatsApp.",
  "no-disponible": "El asistente no está disponible en este momento. Inténtelo de nuevo o escríbanos por WhatsApp.",
  invalido: "No pudimos continuar esta conversación. Inicie una nueva o escríbanos por WhatsApp.",
};

const failureOf = (error: Error): AssistantFailure => {
  const reason = APICallError.isInstance(error) ? error.responseBody : error.message;
  return reason === "limite" || reason === "invalido" ? reason : "no-disponible";
};

// Una conversación por visita: sigue al navegar entre páginas y al recargar
let chat: Chat<AssistantMessage> | undefined;

function getChat() {
  if (!chat) {
    const saved = readStored("session", STORAGE_KEY);
    chat = new Chat<AssistantMessage>({
      // La página actual le permite entender "esta balanza" en una ficha de producto
      transport: new DefaultChatTransport({ api: ASSISTANT_API, body: () => ({ page: window.location.pathname }) }),
      messages: Array.isArray(saved) ? (saved as AssistantMessage[]) : [],
      onFinish: ({ messages }) => writeStored("session", STORAGE_KEY, messages),
    });
  }
  return chat;
}

/** Envía una pregunta desde fuera del chat (las respuestas rápidas de la invitación) */
export function askAssistant(message: string) {
  const current = getChat();
  const busy = current.status === "submitted" || current.status === "streaming";
  if (busy || current.messages.length >= MAX_MESSAGES - 1) return;
  void current.sendMessage({ text: message });
}

/** La respuesta ya muestra algo: texto o una tarjeta */
const hasContent = (message?: AssistantMessage) =>
  message?.role === "assistant" &&
  message.parts.some((part) => (part.type === "text" && part.text.trim()) || part.type.startsWith("tool-"));

/** En pantallas chicas el chat ocupa toda la pantalla */
const isCompact = () => !window.matchMedia("(min-width: 640px)").matches;

export function AssistantPanel({ open }: { open: boolean }) {
  const { messages, sendMessage, setMessages, status, error, regenerate, stop, clearError } = useChat({ chat: getChat() });
  const [input, setInput] = useState("");
  const scroller = useRef<HTMLDivElement>(null);
  const field = useRef<HTMLTextAreaElement>(null);
  // Se sigue el final de la conversación salvo que el cliente haya subido a leer
  const stickToBottom = useRef(true);

  const busy = status === "submitted" || status === "streaming";
  const waiting = busy && !hasContent(messages.at(-1));
  const full = messages.length >= MAX_MESSAGES - 1;
  const failure = error && failureOf(error);

  useEffect(() => {
    // En celulares no se abre el teclado sin que el cliente toque el campo
    if (open && window.matchMedia("(pointer: fine)").matches) field.current?.focus({ preventScroll: true });
  }, [open]);

  useEffect(() => {
    const element = scroller.current;
    // Sin conversación, la bienvenida se lee desde arriba
    if (element && stickToBottom.current && messages.length > 0) element.scrollTop = element.scrollHeight;
  }, [messages, status, error]);

  const send = (text: string) => {
    const question = text.trim();
    if (!question || busy || full) return;
    stickToBottom.current = true;
    if (error) clearError();
    void sendMessage({ text: question });
    setInput("");
  };

  const reset = () => {
    void stop();
    clearError();
    setMessages([]);
    writeStored("session", STORAGE_KEY, null);
    field.current?.focus({ preventScroll: true });
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    send(input);
  };

  // Enter envía; Shift+Enter agrega una línea
  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      send(input);
    }
  };

  // Al seguir un enlace interno en el celular, el chat se cierra para mostrar la página
  const handleClick = (event: MouseEvent) => {
    if ((event.target as HTMLElement).closest("a[href^='/']") && isCompact()) assistantPanel.close();
  };

  return (
    <section
      id={PANEL_ID}
      role="dialog"
      aria-label="Asistente de Métrica"
      inert={!open}
      onClickCapture={handleClick}
      onKeyDown={(event) => event.key === "Escape" && assistantPanel.close()}
      className={cn(
        "fixed inset-0 z-[60] flex origin-bottom flex-col overflow-hidden bg-white transition-[opacity,translate,scale,visibility] duration-400 ease-out-expo",
        // En el escritorio crece desde el botón flotante
        "sm:inset-auto sm:bottom-[5.5rem] sm:right-6 sm:h-[min(42rem,calc(100svh-12rem))] sm:w-[26rem] sm:origin-bottom-right sm:rounded-[1.75rem] sm:border sm:border-neutral-200 sm:shadow-[0_40px_80px_-32px_rgba(0,20,46,0.5)]",
        open ? "visible translate-y-0 scale-100 opacity-100" : "invisible translate-y-4 scale-95 opacity-0"
      )}
    >
      <header className="relative isolate flex items-center gap-3 overflow-hidden bg-mt-800 px-4 py-4 text-white">
        <GridPattern size={22} className="[mask-image:linear-gradient(to_bottom,black,transparent)]" />
        <Glow className="-right-80 -top-96" />
        <span className="relative">
          <AssistantAvatar className="size-11" thinking={busy} />
          <OnlineDot className="bottom-0 right-0" />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="font-heading text-base font-bold leading-tight">Asistente de Métrica</h2>
          <p className="mt-0.5 text-xs text-white/70">{busy ? "Escribiendo…" : "En línea · le ayuda a elegir su equipo"}</p>
        </div>
        {messages.length > 0 && (
          <HeaderButton label="Nueva conversación" onClick={reset}>
            <RotateCcw />
          </HeaderButton>
        )}
        <HeaderButton label="Cerrar el asesor" onClick={assistantPanel.close}>
          <X />
        </HeaderButton>
      </header>

      <div
        ref={scroller}
        onScroll={({ currentTarget: el }) => {
          stickToBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
        }}
        className="flex-1 space-y-4 overflow-y-auto overscroll-contain px-4 py-5"
      >
        <AssistantRow>
          <RichText text={GREETING} />
        </AssistantRow>

        {messages.length === 0 && (
          <div className="pl-[2.375rem]">
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Puede empezar con</p>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {STARTERS.map(({ icon: Icon, label, message }, i) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => send(message)}
                  style={{ animationDelay: `${150 + i * 70}ms` }}
                  className="group flex flex-col items-start gap-2.5 rounded-2xl border border-neutral-200 bg-white p-3 text-left text-sm font-semibold leading-snug text-ink-900 transition-[border-color,box-shadow,translate] duration-300 ease-out-expo hover:-translate-y-0.5 hover:border-mt-300 hover:shadow-[0_14px_28px_-18px_rgba(0,42,90,0.55)] motion-safe:animate-message-in"
                >
                  <span className="flex size-9 items-center justify-center rounded-xl bg-mt-50 text-mt-700 transition-colors duration-300 group-hover:bg-mt-800 group-hover:text-white">
                    <Icon className="size-[1.125rem]" aria-hidden />
                  </span>
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}

        <div aria-live="polite" className="space-y-4">
          {messages.map((message) => (
            <MessageView key={message.id} message={message} />
          ))}
          {waiting && <Typing />}
        </div>

        {failure && (
          <Notice text={FAILURES[failure]}>
            {failure === "no-disponible" && (
              <Button size="sm" variant="outline" onClick={() => void regenerate()}>
                <RotateCcw /> Reintentar
              </Button>
            )}
          </Notice>
        )}
        {full && !busy && <Notice text="Esta conversación llegó a su límite. Un asesor puede seguir ayudándole, o inicie una nueva." />}
      </div>

      <form onSubmit={handleSubmit} className="border-t border-neutral-200 p-3">
        <div className="flex items-end gap-2 rounded-2xl border border-neutral-200 bg-neutral-50 p-1.5 transition-[border-color,box-shadow] focus-within:border-mt-400 focus-within:ring-4 focus-within:ring-mt-500/15">
          <textarea
            ref={field}
            rows={1}
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={handleKeyDown}
            maxLength={MAX_MESSAGE_LENGTH}
            disabled={full}
            placeholder="Escriba su consulta…"
            aria-label="Su mensaje para el asesor"
            className="field-sizing-content max-h-32 min-h-10 flex-1 resize-none bg-transparent px-2.5 py-2 text-[15px] text-ink-950 outline-none placeholder:text-neutral-400"
          />
          {busy ? (
            <SendButton label="Detener la respuesta" onClick={() => void stop()}>
              <Square className="fill-current" />
            </SendButton>
          ) : (
            <SendButton label="Enviar" type="submit" disabled={!input.trim() || full}>
              <ArrowUp />
            </SendButton>
          )}
        </div>
        <p className="mt-2 px-1 text-[11px] leading-snug text-neutral-500">
          Asistente con IA (Google Gemini): puede equivocarse y un asesor confirma cada propuesta. No comparta datos
          sensibles.
        </p>
      </form>
    </section>
  );
}

function MessageView({ message }: { message: AssistantMessage }) {
  if (message.role === "user") {
    const text = message.parts.map((part) => (part.type === "text" ? part.text : "")).join("");
    return (
      <p className="ml-auto w-fit max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-tr-md bg-mt-800 px-3.5 py-2.5 text-[15px] leading-relaxed text-white motion-safe:animate-message-in">
        {text}
      </p>
    );
  }

  const content = message.parts.map((part, i) => {
    switch (part.type) {
      case "text":
        return part.text.trim() ? <RichText key={i} text={part.text} /> : null;
      case "tool-mostrar_equipos":
        if (part.state === "output-available") return <ProductSuggestions key={i} products={part.output} />;
        return part.state === "output-error" ? null : <Status key={i} label="Buscando equipos en el catálogo…" />;
      case "tool-siguiente_paso":
        return part.state === "output-available" ? <HandoffCard key={i} handoff={part.output} /> : null;
      default:
        return null;
    }
  });

  return content.some(Boolean) ? <AssistantRow>{content}</AssistantRow> : null;
}

/** Mensaje del asesor: su cara a la izquierda y el contenido al lado */
function AssistantRow({ children, thinking }: { children: ReactNode; thinking?: boolean }) {
  return (
    <div className="flex items-start gap-2.5 motion-safe:animate-message-in">
      <AssistantAvatar className="mt-0.5 size-7" thinking={thinking} />
      <div className="min-w-0 flex-1 space-y-3">{children}</div>
    </div>
  );
}

function Status({ label }: { label: string }) {
  return (
    <div role="status" className="flex w-fit items-center gap-2.5 rounded-2xl rounded-tl-md bg-neutral-100 px-3.5 py-2.5">
      <TypingDots />
      <span className="text-xs text-neutral-500">{label}</span>
    </div>
  );
}

const Typing = () => (
  <AssistantRow thinking>
    <Status label="Escribiendo…" />
  </AssistantRow>
);

function Notice({ text, children }: { text: string; children?: ReactNode }) {
  return (
    <div role="alert" className="rounded-2xl border border-amber-200 bg-amber-50 p-3.5 text-sm text-amber-950">
      <p>{text}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {children}
        <Button asChild size="sm" variant="outline">
          <a href={whatsappUrl("Hola, vengo del Asistente de Métrica del sitio web.")} target="_blank" rel="noopener noreferrer">
            <MessageCircle /> WhatsApp
          </a>
        </Button>
      </div>
    </div>
  );
}

type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & { label: string };

const HeaderButton = ({ label, className, ...props }: IconButtonProps) => (
  <button
    type="button"
    aria-label={label}
    title={label}
    className={cn("flex size-9 items-center justify-center rounded-full text-white/80 transition-colors hover:bg-white/10 hover:text-white [&_svg]:size-[1.125rem]", className)}
    {...props}
  />
);

const SendButton = ({ label, className, type = "button", ...props }: IconButtonProps) => (
  <button
    type={type}
    aria-label={label}
    title={label}
    className={cn("flex size-10 shrink-0 items-center justify-center rounded-xl bg-mt-800 text-white transition-colors hover:bg-mt-700 disabled:bg-neutral-300 [&_svg]:size-4", className)}
    {...props}
  />
);
