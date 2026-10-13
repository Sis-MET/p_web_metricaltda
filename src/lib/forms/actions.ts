"use server";

import { randomInt } from "node:crypto";
import { productTitle } from "@/content/catalog";
import { PRODUCTS } from "@/content/products";
import { FORMS, isFormId } from "./definitions";
import { deliver } from "./delivery";
import type { QuoteItem } from "@/lib/quote";
import { HONEYPOT, parseSubmission, type FieldDef, type FormDef, type FormState, type FormValue } from "./schema";

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

/** Valor de un campo tal como lo leerá el equipo de Métrica */
function display(field: FieldDef, value: FormValue): string {
  switch (field.type) {
    case "file":
      return (value as File[]).map((file) => file.name).join(", ");
    case "checkbox":
      return (value as string[]).join(", ");
    case "quote":
      return (value as QuoteItem[])
        .map(({ slug, qty }) => {
          const product = PRODUCTS.find((p) => p.slug === slug);
          return product ? `${qty} × ${productTitle(product)}` : null;
        })
        .filter(Boolean)
        .join("\n");
    default:
      return value as string;
  }
}

export async function submitForm(formId: string, _previous: FormState, data: FormData): Promise<FormState> {
  if (!isFormId(formId)) return { status: "error" };
  const form: FormDef = FORMS[formId];

  // Un bot llenó el campo oculto: se le responde como si nada para no darle pistas
  if (data.get(HONEYPOT)) return { status: "success", reference: createReference(form.prefix) };

  const result = parseSubmission(form, data);
  if (!result.ok) return { status: "invalid", errors: result.errors };

  const { values } = result;
  const reference = createReference(form.prefix);

  try {
    await deliver({
      subject: `${form.subject} · ${reference}`,
      inbox: form.inbox,
      reference,
      replyTo: values.email as string,
      fields: form.fields
        .map((field) => ({ label: field.label, value: display(field, values[field.name]) }))
        .filter((field) => field.value),
      attachments: form.fields.flatMap((field) => (field.type === "file" ? (values[field.name] as File[]) : [])),
    });
  } catch (error) {
    console.error(`[formulario] ${reference} no se pudo entregar`, error);
    return { status: "error" };
  }

  return { status: "success", reference };
}
