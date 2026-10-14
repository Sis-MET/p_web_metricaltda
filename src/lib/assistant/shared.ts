/** Límites y contrato del asesor virtual, compartidos por el chat (navegador) y su API. */

export const ASSISTANT_API = "/api/asesor";

/** Mensajes por conversación (preguntas + respuestas): después, el chat deriva a un asesor */
export const MAX_MESSAGES = 40;

/** Caracteres por mensaje del cliente */
export const MAX_MESSAGE_LENGTH = 1500;

/**
 * Lo que responde la API cuando no puede atender (cuerpo de la respuesta o error del stream):
 * - `limite`: se agotó la cuota del visitante o la diaria del sitio
 * - `no-disponible`: la IA no está configurada o falló
 * - `invalido`: la conversación enviada no es válida
 */
export type AssistantFailure = "limite" | "no-disponible" | "invalido";
