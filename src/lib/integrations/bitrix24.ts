/**
 * Prospectos (Leads) de Bitrix24 a través del webhook entrante de METRICA.
 * Solo se usa en el servidor: el webhook es la credencial y nunca aparece en logs ni errores.
 */

const TIMEOUT_MS = 15_000;
const FIELDS_TTL_MS = 10 * 60_000;

export type CommentsFormat = "text" | "bbcode" | "html";

type Bitrix24Config = {
  webhookUrl: string;
  statusId: string;
  sourceId?: string;
  assignedById?: string;
  cityField?: string;
  opportunityTypeField?: string;
  attachmentsField?: string;
  commentsFormat: CommentsFormat;
};

export function bitrix24Config(): Bitrix24Config | null {
  const webhookUrl = process.env.BITRIX24_WEBHOOK_URL?.trim();
  if (!webhookUrl) return null;
  const format = process.env.BITRIX24_COMMENTS_FORMAT;
  return {
    webhookUrl: webhookUrl.endsWith("/") ? webhookUrl : `${webhookUrl}/`,
    statusId: process.env.BITRIX24_LEAD_STATUS_ID || "NEW",
    sourceId: process.env.BITRIX24_LEAD_SOURCE_ID || undefined,
    assignedById: process.env.BITRIX24_LEAD_ASSIGNED_BY_ID || undefined,
    cityField: process.env.BITRIX24_FIELD_CITY || undefined,
    opportunityTypeField: process.env.BITRIX24_FIELD_OPPORTUNITY_TYPE || undefined,
    attachmentsField: process.env.BITRIX24_FIELD_ATTACHMENTS || undefined,
    commentsFormat: format === "text" || format === "html" ? format : "bbcode",
  };
}

export class Bitrix24Error extends Error {
  constructor(method: string, code: string, description?: string) {
    super(`Bitrix24 ${method}: ${code}${description ? ` (${description.slice(0, 200)})` : ""}`);
    this.name = "Bitrix24Error";
  }
}

async function call<T>(config: Bitrix24Config, method: string, params: object): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${config.webhookUrl}${method}.json`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(params),
      signal: AbortSignal.timeout(TIMEOUT_MS),
      cache: "no-store",
    });
  } catch (error) {
    const timeout = error instanceof Error && error.name === "TimeoutError";
    throw new Bitrix24Error(method, timeout ? "TIMEOUT" : "SIN_CONEXION");
  }
  const body = (await response.json().catch(() => null)) as { result?: T; error?: string; error_description?: string } | null;
  if (!response.ok || !body || body.error || body.result === undefined) {
    throw new Bitrix24Error(method, body?.error ?? `HTTP_${response.status}`, body?.error_description);
  }
  return body.result;
}

/* ─── Campos de lista (Ciudad del prospecto, Tipo de oportunidad) ───────── */

type LeadField = { type: string; isRequired?: boolean; isMultiple?: boolean; items?: { ID: string; VALUE: string }[] };

let fieldsCache: { expires: number; fields: Promise<Record<string, LeadField>> } | null = null;

/** Metadatos de los Prospectos en memoria: no se gasta el límite de solicitudes de Bitrix en cada envío */
function leadFields(config: Bitrix24Config) {
  if (!fieldsCache || fieldsCache.expires < Date.now()) {
    const fields = call<Record<string, LeadField>>(config, "crm.lead.fields", {});
    fieldsCache = { expires: Date.now() + FIELDS_TTL_MS, fields };
    fields.catch(() => (fieldsCache = null));
  }
  return fieldsCache.fields;
}

const normalize = (value: string) =>
  value.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/\s+/g, " ").trim().toLowerCase();

/** ID del elemento de una lista de Bitrix24 a partir de su texto ("Potosí" → "985") */
function optionId(field: LeadField | undefined, text: string) {
  return field?.items?.find((item) => normalize(item.VALUE) === normalize(text))?.ID;
}

/* ─── Prospecto ─────────────────────────────────────────────────────────── */

export type LeadInput = {
  reference: string;
  title: string;
  name: string;
  lastName: string;
  company: string;
  position?: string;
  email: string;
  phone: string;
  city?: string;
  /** VENTA, SOPORTE TECNICO, CALIBRACIÓN: textos de la lista "Tipo de oportunidad" */
  opportunityTypes: string[];
  /** Detalle legible para el comentario del prospecto */
  sections: { label: string; value: string }[];
  products: { name: string; quantity: number }[];
  /** Formulario de calibración, fotos del equipo… */
  attachments: File[];
};

function formatComments(sections: LeadInput["sections"], format: CommentsFormat) {
  const escape = (value: string) => value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const lines = sections.map(({ label, value }) => {
    if (format === "html") return `<b>${escape(label)}:</b> ${escape(value).replace(/\n/g, "<br>")}`;
    if (format === "bbcode") return `[B]${label}:[/B] ${value}`;
    return `${label}: ${value}`;
  });
  return lines.join(format === "html" ? "<br>" : "\n");
}

/** Crea el prospecto en la etapa inicial (columna "Sin asignar") y devuelve su ID */
export async function createLead(config: Bitrix24Config, lead: LeadInput) {
  const fields = await leadFields(config);

  const payload: Record<string, unknown> = {
    TITLE: lead.title,
    NAME: lead.name,
    LAST_NAME: lead.lastName,
    COMPANY_TITLE: lead.company,
    POST: lead.position,
    EMAIL: [{ VALUE: lead.email, VALUE_TYPE: "WORK" }],
    PHONE: [{ VALUE: lead.phone, VALUE_TYPE: "WORK" }],
    STATUS_ID: config.statusId,
    SOURCE_ID: config.sourceId,
    SOURCE_DESCRIPTION: "Sitio web",
    ASSIGNED_BY_ID: config.assignedById,
    OPENED: "Y",
    COMMENTS: formatComments(lead.sections, config.commentsFormat),
    // Origen y referencia: permiten ubicar el prospecto a partir del número que recibe el cliente
    ORIGINATOR_ID: "SITIO_WEB",
    ORIGIN_ID: lead.reference,
  };

  if (config.cityField && lead.city) {
    const id = optionId(fields[config.cityField], lead.city);
    if (id) payload[config.cityField] = id;
  }
  if (config.opportunityTypeField) {
    const field = fields[config.opportunityTypeField];
    const ids = lead.opportunityTypes.map((type) => optionId(field, type)).filter((id) => id !== undefined);
    if (ids.length) payload[config.opportunityTypeField] = field?.isMultiple ? ids : ids[0];
  }

  if (config.attachmentsField && lead.attachments.length) {
    payload[config.attachmentsField] = await Promise.all(
      lead.attachments.map(async (file) => ({
        fileData: [file.name, Buffer.from(await file.arrayBuffer()).toString("base64")],
      }))
    );
  }

  // Un campo obligatorio sin valor haría fallar la creación: mejor un error claro antes de llamar
  const missing = Object.entries(fields)
    .filter(([id, field]) => id.startsWith("UF_CRM_") && field.isRequired && payload[id] === undefined)
    .map(([id]) => id);
  if (missing.length) throw new Bitrix24Error("crm.lead.add", "CAMPO_OBLIGATORIO_SIN_VALOR", missing.join(", "));

  const id = await call<number>(config, "crm.lead.add", { fields: payload, params: { REGISTER_SONET_EVENT: "Y" } });

  // Los equipos también quedan en la pestaña "Productos" del prospecto (sin precio: lo pone el asesor)
  if (lead.products.length) {
    await call(config, "crm.lead.productrows.set", {
      id,
      rows: lead.products.map((product) => ({ PRODUCT_NAME: product.name, QUANTITY: product.quantity, PRICE: 0 })),
    }).catch((error) => console.warn(`[bitrix24] prospecto ${id} sin productos: ${(error as Error).message}`));
  }

  return id;
}
