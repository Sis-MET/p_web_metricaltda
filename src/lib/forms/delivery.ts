import { productTitle } from "@/content/catalog";
import { readCatalog } from "@/lib/catalog";
import { bitrix24Config, createLead } from "@/lib/integrations/bitrix24";
import { mailConfig, recipientsFor, sendMail } from "@/lib/integrations/mail";
import type { QuoteItem } from "@/lib/quote";
import { CONTACT } from "./definitions";
import type { FieldDef, FormDef, FormValue, FormValues } from "./schema";

/**
 * Entrega de los formularios: siempre por correo al buzón del área y, en los formularios con
 * `crm` (la cotización), también como prospecto en Bitrix24. Los canales corren en paralelo y
 * basta con que uno entregue para no perder la solicitud; las fallas quedan en el registro.
 */

export type Submission = { form: FormDef; values: FormValues; reference: string };

type Row = { label: string; value: string };

const textOf = (values: FormValues, name: string) => (typeof values[name] === "string" ? (values[name] as string) : "");

const attachmentsOf = ({ form, values }: Submission) =>
  form.fields.flatMap((field) => (field.type === "file" ? (values[field.name] as File[]) : []));

type QuotedProduct = { model: string; name: string; quantity: number };

/** Equipos de la lista de cotización con su nombre comercial (los que siguen en el catálogo) */
async function quotedProducts({ form, values }: Submission): Promise<QuotedProduct[]> {
  const field = form.fields.find((candidate) => candidate.type === "quote");
  if (!field) return [];
  const { products } = await readCatalog();
  return (values[field.name] as QuoteItem[]).flatMap(({ slug, qty }) => {
    const product = products.find((candidate) => candidate.slug === slug);
    return product ? [{ model: product.model, name: `${productTitle(product)} METTLER TOLEDO`, quantity: qty }] : [];
  });
}

/** Valor de un campo tal como lo leerá el equipo de Métrica */
function display(field: FieldDef, value: FormValue, quoted: QuotedProduct[]): string {
  switch (field.type) {
    case "file":
      return (value as File[]).map((file) => file.name).join(", ");
    case "checkbox":
      return (value as string[]).join(", ");
    case "quote":
      return quoted
        .map((product) => `${product.quantity} × ${product.name}`)
        .join("\n");
    default:
      return value as string;
  }
}

/* ─── Canales ───────────────────────────────────────────────────────────── */

/** Sin configuración: en desarrollo se registra lo que se habría enviado; en producción es una falla */
function notConfigured(channel: string, submission: Submission, rows: Row[]) {
  if (process.env.NODE_ENV === "production") throw new Error(`${channel} sin configurar`);
  console.info(`[formulario] ${submission.reference} · ${channel} sin configurar, no se envía:`, rows);
  return `${channel} omitido (sin configurar)`;
}

const escapeHtml = (value: string) => value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

async function byEmail(submission: Submission, rows: Row[]) {
  const { form, values, reference } = submission;
  const config = mailConfig();
  const to = recipientsFor(form.inbox);
  if (!config || !to.length) return notConfigured("correo", submission, rows);

  const who = textOf(values, CONTACT.company) || `${textOf(values, CONTACT.name)} ${textOf(values, CONTACT.lastName)}`.trim();
  const subject = `${form.subject} · ${who} · ${reference}`;
  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#171716">
      <p style="margin:0 0 4px;font-size:12px;color:#62625e">Sitio web Métrica · ${escapeHtml(reference)}</p>
      <h2 style="margin:0 0 16px;font-size:18px">${escapeHtml(form.subject)}</h2>
      <table cellpadding="8" style="border-collapse:collapse;width:100%;max-width:640px">
        ${rows
          .map(
            ({ label, value }) =>
              `<tr><td style="border-bottom:1px solid #e8e8e6;color:#62625e;vertical-align:top;width:34%">${escapeHtml(label)}</td>` +
              `<td style="border-bottom:1px solid #e8e8e6">${escapeHtml(value).replace(/\n/g, "<br>")}</td></tr>`
          )
          .join("")}
      </table>
      <p style="margin:16px 0 0;font-size:12px;color:#62625e">Responda este correo para contestar directamente al cliente.</p>
    </div>`;
  const text = [`${form.subject} · ${reference}`, "", ...rows.map(({ label, value }) => `${label}: ${value}`)].join("\n");

  await sendMail(config, {
    to,
    subject,
    text,
    html,
    replyTo: textOf(values, CONTACT.email),
    attachments: attachmentsOf(submission),
  });
  return `correo a ${to.join(", ")}`;
}

// Estos datos van en campos propios del prospecto; el resto, en su comentario
const CONTACT_FIELDS = new Set<string>(Object.values(CONTACT));

async function asLead(submission: Submission, rows: Row[], fieldRows: Map<string, Row>, products: QuotedProduct[]) {
  const { form, values, reference } = submission;
  const config = bitrix24Config();
  if (!config) return notConfigured("Bitrix24", submission, rows);

  const models = products.map((product) => product.model).join(", ");
  const company = textOf(values, CONTACT.company);
  const title = [`${form.subject} web`, company, models].filter(Boolean).join(" · ").slice(0, 250);

  const id = await createLead(config, {
    reference,
    title,
    name: textOf(values, CONTACT.name),
    lastName: textOf(values, CONTACT.lastName),
    company,
    position: textOf(values, CONTACT.position) || undefined,
    email: textOf(values, CONTACT.email),
    phone: textOf(values, CONTACT.phone),
    city: textOf(values, CONTACT.city) || undefined,
    opportunityTypes: form.crm?.opportunityTypes(values) ?? [],
    sections: [
      { label: "Referencia web", value: reference },
      ...[...fieldRows].filter(([name]) => !CONTACT_FIELDS.has(name)).map(([, row]) => row),
    ],
    products: products.map(({ name, quantity }) => ({ name, quantity })),
    attachments: attachmentsOf(submission),
  });
  return `prospecto ${id} en Bitrix24`;
}

/* ─── Entrega ───────────────────────────────────────────────────────────── */

export async function deliver(submission: Submission): Promise<void> {
  const { form, values, reference } = submission;
  const quoted = await quotedProducts(submission);
  const fieldRows = new Map(
    form.fields
      .map((field) => [field.name, { label: field.label, value: display(field, values[field.name], quoted) }] as const)
      .filter(([, row]) => row.value)
  );
  const rows = [...fieldRows.values()];

  const channels: [string, () => Promise<string>][] = [["correo", () => byEmail(submission, rows)]];
  if (form.crm) channels.push(["Bitrix24", () => asLead(submission, rows, fieldRows, quoted)]);

  const results = await Promise.allSettled(channels.map(([, run]) => run()));
  results.forEach((result, i) => {
    if (result.status === "fulfilled") console.info(`[formulario] ${reference} → ${result.value}`);
    else console.error(`[formulario] ${reference} · ${channels[i][0]} falló:`, result.reason);
  });

  if (!results.some((result) => result.status === "fulfilled")) {
    throw new Error(`${reference}: ningún canal entregó la solicitud`);
  }
}
