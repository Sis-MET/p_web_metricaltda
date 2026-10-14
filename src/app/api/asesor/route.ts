import { google, type GoogleLanguageModelOptions } from "@ai-sdk/google";
import {
  APICallError,
  convertToModelMessages,
  createUIMessageStreamResponse,
  isStepCount,
  safeValidateUIMessages,
  streamText,
  toUIMessageStream,
} from "ai";
import { assistantInstructions } from "@/lib/assistant/instructions";
import { takeQuota, visitorOf } from "@/lib/assistant/limits";
import { MAX_MESSAGE_LENGTH, MAX_MESSAGES, type AssistantFailure } from "@/lib/assistant/shared";
import { assistantTools, type AssistantMessage } from "@/lib/assistant/tools";

/**
 * API del asesor virtual: recibe la conversación desde el chat del sitio (el servidor no guarda
 * nada) y responde en streaming. La clave de Gemini nunca sale del servidor.
 */

const MODEL = process.env.ASSISTANT_MODEL || "gemini-3.5-flash-lite";

// Una conversación completa pesa unos pocos KB; más que esto no viene del chat del sitio
const MAX_BODY_BYTES = 200_000;

const fail = (status: number, reason: AssistantFailure) => new Response(reason, { status });

/** Solo responde al propio sitio: el navegador siempre envía Origin en un POST con fetch */
function fromSite(request: Request) {
  const origin = request.headers.get("origin");
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  return origin !== null && host !== null && URL.parse(origin)?.host === host;
}

/** El cliente solo escribe texto, y la conversación termina en su pregunta */
function withinLimits(messages: AssistantMessage[]) {
  const last = messages.at(-1);
  return (
    messages.length <= MAX_MESSAGES &&
    last?.role === "user" &&
    messages.every(
      (message) =>
        message.role !== "user" ||
        message.parts.every((part) => part.type === "text" && part.text.length <= MAX_MESSAGE_LENGTH)
    )
  );
}

/** Cuota agotada en Gemini (429), aunque venga envuelta en el error de reintentos */
function isQuotaError(error: unknown): boolean {
  if (APICallError.isInstance(error)) return error.statusCode === 429;
  return typeof error === "object" && error !== null && "lastError" in error && isQuotaError(error.lastError);
}

export async function POST(request: Request) {
  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) return fail(503, "no-disponible");
  if (!fromSite(request)) return fail(403, "invalido");
  if (Number(request.headers.get("content-length")) > MAX_BODY_BYTES) return fail(413, "invalido");

  const body: unknown = await request.json().catch(() => null);
  const { messages, page } = (body && typeof body === "object" ? body : {}) as { messages?: unknown; page?: unknown };
  const validated = await safeValidateUIMessages<AssistantMessage>({ messages, tools: assistantTools });
  if (!validated.success || !withinLimits(validated.data)) return fail(400, "invalido");

  if (!takeQuota(visitorOf(request))) return fail(429, "limite");

  const result = streamText({
    model: google(MODEL),
    instructions: assistantInstructions(page),
    messages: await convertToModelMessages(validated.data, { tools: assistantTools }),
    tools: assistantTools,
    // Las herramientas solo muestran tarjetas: si el modelo ya escribió su respuesta junto con ellas,
    // no hace falta otra vuelta (cada vuelta es una consulta más a la cuota)
    stopWhen: [isStepCount(3), ({ steps }) => Boolean(steps.at(-1)?.text.trim())],
    maxOutputTokens: 1500,
    // Un 429 de cuota no se resuelve reintentando: solo gasta más cuota
    maxRetries: 1,
    providerOptions: {
      google: { thinkingConfig: { thinkingLevel: "low" } } satisfies GoogleLanguageModelOptions,
    },
    abortSignal: request.signal,
  });

  return createUIMessageStreamResponse({
    stream: toUIMessageStream({
      stream: result.stream,
      // El razonamiento interno del modelo no se muestra al cliente
      sendReasoning: false,
      onError: (error) => {
        console.error("[asesor]", error);
        return (isQuotaError(error) ? "limite" : "no-disponible") satisfies AssistantFailure;
      },
    }),
  });
}
