import { z } from "zod";
import { MAX_ITEMS, MAX_QTY, type QuoteItem } from "@/lib/quote";

/**
 * Formularios declarativos: cada formulario es una lista de campos. De esa lista salen
 * el render (SiteForm), la validación (la misma en el navegador y en el servidor) y el
 * resumen que recibe el equipo de Métrica.
 */

export type Option = { value: string; label: string };

type BaseField = {
  name: string;
  label: string;
  required?: boolean;
  hint?: string;
  /** Ocupa las dos columnas de la grilla */
  full?: boolean;
};

export type FieldDef = BaseField &
  (
    | { type: "text" | "email" | "tel"; autoComplete?: string; placeholder?: string; maxLength?: number }
    | { type: "textarea"; placeholder?: string; rows?: number; maxLength?: number }
    | { type: "select"; options: Option[]; placeholder?: string }
    | { type: "radio" | "checkbox"; options: Option[] }
    | { type: "file"; accept: FileKind[]; maxFiles?: number }
    /** La lista de cotización del navegador, enviada como JSON */
    | { type: "quote" }
  );

export type FormDef = {
  /** Prefijo del número de referencia: COT-261013-4F7K */
  prefix: string;
  /** Buzón del equipo que atiende el formulario */
  inbox: "comercial" | "laboratorio" | "soporte" | "rrhh" | "calidad";
  subject: string;
  submitLabel: string;
  success: { title: string; text: string };
  fields: FieldDef[];
  /** Validación entre campos; devuelve el error y el campo donde mostrarlo */
  check?: (values: FormValues) => { field: string; message: string } | undefined;
  /** Además del correo, la solicitud se registra como prospecto en Bitrix24 */
  crm?: { opportunityTypes: (values: FormValues) => string[] };
  /** Campo de detalle (textarea) que el Asistente de Métrica puede precargar con el resumen de la conversación */
  summaryField?: string;
};

export type FormValue = string | string[] | File[] | QuoteItem[];
export type FormValues = Record<string, FormValue>;
export type FieldErrors = Record<string, string>;

export type FormState =
  | { status: "idle" }
  | { status: "invalid"; errors: FieldErrors }
  | { status: "error" }
  | { status: "success"; reference: string };

/** Campo trampa para bots: los usuarios no lo ven, los bots lo llenan */
export const HONEYPOT = "sitio_web";

/* ─── Archivos ──────────────────────────────────────────────────────────── */

export const FILE_KINDS = {
  pdf: { label: "PDF", extensions: [".pdf"] },
  image: { label: "JPG o PNG", extensions: [".jpg", ".jpeg", ".png", ".webp"] },
  sheet: { label: "Excel", extensions: [".xlsx", ".xls"] },
  doc: { label: "Word", extensions: [".docx", ".doc"] },
} as const;

export type FileKind = keyof typeof FILE_KINDS;

// Total por envío: por debajo del límite de 4,5 MB de las funciones serverless
export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;

export const acceptAttr = (kinds: FileKind[]) => kinds.flatMap((kind) => FILE_KINDS[kind].extensions).join(",");

const hasExtension = (file: File, kinds: FileKind[]) => {
  const name = file.name.toLowerCase();
  return kinds.some((kind) => FILE_KINDS[kind].extensions.some((ext) => name.endsWith(ext)));
};

/* ─── Validación ────────────────────────────────────────────────────────── */

const REQUIRED = "Este campo es requerido";
const PHONE_PATTERN = /^\+?[\d\s()-]{6,20}$/;

const text = (max: number, required?: boolean) => {
  const base = z.string().trim().max(max, `Máximo ${max} caracteres`);
  return required ? base.min(1, REQUIRED) : base;
};

const quoteLines = z
  .string()
  .transform((raw, ctx) => {
    try {
      return JSON.parse(raw || "[]") as unknown;
    } catch {
      ctx.addIssue({ code: "custom", message: "Lista de productos inválida" });
      return z.NEVER;
    }
  })
  .pipe(z.array(z.object({ slug: z.string().max(60), qty: z.number().int().min(1).max(MAX_QTY) })).max(MAX_ITEMS));

function fieldSchema(field: FieldDef): z.ZodType<FormValue> {
  switch (field.type) {
    case "text":
    case "textarea":
      return text(field.maxLength ?? (field.type === "textarea" ? 3000 : 120), field.required);
    case "email":
      return text(120, field.required).refine((v) => !v || z.email().safeParse(v).success, "Ingrese un correo válido");
    case "tel":
      return text(30, field.required).refine((v) => !v || PHONE_PATTERN.test(v), "Ingrese un número válido");
    case "select":
    case "radio": {
      const values = field.options.map((option) => option.value);
      return z
        .string()
        .refine((v) => (v ? values.includes(v) : !field.required), field.type === "select" ? "Seleccione una opción" : "Elija una opción");
    }
    case "checkbox": {
      const values = field.options.map((option) => option.value);
      return z
        .array(z.string().refine((v) => values.includes(v)))
        .refine((v) => !field.required || v.length > 0, "Elija al menos una opción");
    }
    case "file": {
      const { accept, maxFiles = 1 } = field;
      const formats = accept.map((kind) => FILE_KINDS[kind].label).join(", ");
      return z
        .array(z.instanceof(File))
        .refine((files) => !field.required || files.length > 0, "Adjunte un archivo")
        .refine((files) => files.length <= maxFiles, `Máximo ${maxFiles} archivos`)
        .refine((files) => files.every((file) => hasExtension(file, accept)), `Formato permitido: ${formats}`);
    }
    case "quote":
      return quoteLines;
  }
}

/** Lee del FormData lo que corresponde a cada tipo de campo */
function readValue(field: FieldDef, data: FormData): unknown {
  switch (field.type) {
    case "checkbox":
      return data.getAll(field.name).filter((v) => typeof v === "string");
    case "file":
      // Un input de archivo vacío envía un File sin nombre ni contenido
      return data.getAll(field.name).filter((v): v is File => v instanceof File && v.size > 0);
    default: {
      const value = data.get(field.name);
      return typeof value === "string" ? value : "";
    }
  }
}

export type ParseResult = { ok: true; values: FormValues } | { ok: false; errors: FieldErrors };

export function parseSubmission(form: FormDef, data: FormData): ParseResult {
  const errors: FieldErrors = {};
  const values: FormValues = {};

  for (const field of form.fields) {
    const result = fieldSchema(field).safeParse(readValue(field, data));
    if (result.success) values[field.name] = result.data;
    else errors[field.name] = result.error.issues[0]?.message ?? REQUIRED;
  }

  const files = form.fields.flatMap((field) => (field.type === "file" ? ((values[field.name] as File[] | undefined) ?? []) : []));
  const uploadBytes = files.reduce((total, file) => total + file.size, 0);
  if (uploadBytes > MAX_UPLOAD_BYTES) {
    const field = form.fields.find((f) => f.type === "file" && (values[f.name] as File[]).length > 0);
    if (field) errors[field.name] = `Los archivos superan ${MAX_UPLOAD_BYTES / 1024 / 1024} MB en total`;
  }

  if (Object.keys(errors).length === 0) {
    const crossError = form.check?.(values);
    if (crossError) errors[crossError.field] = crossError.message;
  }

  return Object.keys(errors).length ? { ok: false, errors } : { ok: true, values };
}
