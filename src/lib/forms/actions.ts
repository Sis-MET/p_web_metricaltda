"use server";

import { randomInt } from "node:crypto";
import { FORMS, isFormId } from "./definitions";
import { deliver } from "./delivery";
import { HONEYPOT, parseSubmission, type FormDef, type FormState } from "./schema";

const BOLIVIA_DATE = new Intl.DateTimeFormat("en-CA", {
  timeZone: "America/La_Paz",
  year: "2-digit",
  month: "2-digit",
  day: "2-digit",
});

// Sin 0/O ni 1/I/L: el número se dicta por teléfono sin confusiones
const CODE_ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";

/** Número de referencia: REC-261013-7KQ2 */
function createReference(prefix: string) {
  const date = BOLIVIA_DATE.format(new Date()).replaceAll("-", "");
  const code = Array.from({ length: 4 }, () => CODE_ALPHABET[randomInt(CODE_ALPHABET.length)]).join("");
  return `${prefix}-${date}-${code}`;
}

export async function submitForm(formId: string, _previous: FormState, data: FormData): Promise<FormState> {
  if (!isFormId(formId)) return { status: "error" };
  const form: FormDef = FORMS[formId];

  // Un bot llenó el campo oculto: se le responde como si nada para no darle pistas
  if (data.get(HONEYPOT)) return { status: "success", reference: createReference(form.prefix) };

  const result = parseSubmission(form, data);
  if (!result.ok) return { status: "invalid", errors: result.errors };

  const reference = createReference(form.prefix);

  try {
    await deliver({ form, values: result.values, reference });
  } catch (error) {
    console.error(`[formulario] ${reference} no se pudo entregar`, error);
    return { status: "error" };
  }

  return { status: "success", reference };
}
