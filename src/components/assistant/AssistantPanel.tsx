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
import { ArrowUp, MessageCircle, RotateCcw, Sparkles, Square, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { whatsappUrl } from "@/content/company";
import { PANEL_ID, assistantPanel } from "@/lib/assistant/panel";
import { ASSISTANT_API, MAX_MESSAGE_LENGTH, MAX_MESSAGES, type AssistantFailure } from "@/lib/assistant/shared";
import type { AssistantMessage } from "@/lib/assistant/tools";
import { readStored, writeStored } from "@/lib/store";
import { cn } from "@/lib/utils";
import { HandoffCard, ProductSuggestions, RichText } from "./parts";

const STORAGE_KEY = "metrica:asesor";

const STARTERS = [
  "Tengo una planta de alimentos y necesito pesar mi producción",
  "Necesito pesar camiones con carga",
  "Quiero calibrar mis balanzas",
  "Mi balanza presenta una falla",
];

const GREETING =
  "¡Hola! Soy el asesor virtual de Métrica. Cuénteme a qué se dedica su empresa y qué necesita pesar, y le recomiendo el equipo adecuado. También puedo orientarle sobre calibración y soporte técnico.";

const FAILURES: Record<AssistantFailure, string> = {
  limite: "El asesor virtual alcanzó su límite de consultas por ahora. Un asesor le atiende por WhatsApp.",
  "no-disponible": "El asesor virtual no está disponible en este momento. Inténtelo de nuevo o escríbanos por WhatsApp.",
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
    if (element && stickToBottom.current) element.scrollTop = element.scrollHeight;
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
      aria-label="Asesor virtual de Métrica"
      inert={!open}
      onClickCapture={handleClick}
      onKeyDown={(event) => event.key === "Escape" && assistantPanel.close()}
      className={cn(
        "fixed inset-0 z-[60] flex flex-col overflow-hidden bg-white transition-[opacity,translate,visibility] duration-300 ease-out-expo",
        "sm:inset-auto sm:bottom-24 sm:right-6 sm:h-[min(42rem,calc(100svh-12rem))] sm:w-[26rem] sm:rounded-[1.75rem] sm:border sm:border-neutral-200 sm:shadow-[0_40px_80px_-32px_rgba(0,20,46,0.5)]",
        open ? "visible translate-y-0 opacity-100" : "invisible translate-y-4 opacity-0"
      )}
    >
      <header className="flex items-center gap-3 bg-mt-800 px-4 py-3.5 text-white">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/15">
          <Sparkles className="size-5" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="font-heading text-[15px] font-bold leading-tight">Asesor virtual</h2>
          <p className="text-xs text-white/65">Le ayudo a elegir su equipo de pesaje</p>
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
        <RichText text={GREETING} />

        {messages.length === 0 && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Puede empezar con</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {STARTERS.map((starter) => (
                <button
                  key={starter}
                  type="button"
                  onClick={() => send(starter)}
                  className="rounded-full border border-neutral-200 bg-white px-3.5 py-2 text-left text-sm text-ink-800 transition-colors hover:border-mt-400 hover:bg-mt-50"
                >
                  {starter}
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
      <p className="ml-auto w-fit max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-br-md bg-mt-800 px-3.5 py-2.5 text-[15px] leading-relaxed text-white">
        {text}
      </p>
    );
  }

  return message.parts.map((part, i) => {
    switch (part.type) {
      case "text":
        return part.text.trim() ? <RichText key={i} text={part.text} /> : null;
      case "tool-mostrar_equipos":
        if (part.state === "output-available") return <ProductSuggestions key={i} products={part.output} />;
        return part.state === "output-error" ? null : <Typing key={i} label="Buscando equipos en el catálogo…" />;
      case "tool-siguiente_paso":
        return part.state === "output-available" ? <HandoffCard key={i} handoff={part.output} /> : null;
      default:
        return null;
    }
  });
}

function Typing({ label = "El asesor está escribiendo…" }: { label?: string }) {
  return (
    <div className="flex w-fit items-center gap-2.5 rounded-2xl rounded-bl-md bg-neutral-100 px-3.5 py-3" role="status">
      <span className="flex gap-1" aria-hidden>
        {[0, 150, 300].map((delay) => (
          <span
            key={delay}
            className="size-1.5 rounded-full bg-neutral-400 motion-safe:animate-bounce"
            style={{ animationDelay: `${delay}ms` }}
          />
        ))}
      </span>
      <span className="text-xs text-neutral-500">{label}</span>
    </div>
  );
}

function Notice({ text, children }: { text: string; children?: ReactNode }) {
  return (
    <div role="alert" className="rounded-2xl border border-amber-200 bg-amber-50 p-3.5 text-sm text-amber-950">
      <p>{text}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {children}
        <Button asChild size="sm" variant="outline">
          <a href={whatsappUrl("Hola, vengo del asesor virtual del sitio web.")} target="_blank" rel="noopener noreferrer">
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
