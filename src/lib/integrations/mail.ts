import nodemailer, { type Transporter } from "nodemailer";
import type { FormDef } from "@/lib/forms/schema";

/**
 * Correo por SMTP: sirve con el servidor de correo de metrica.com.bo o con cualquier servicio
 * transaccional que ofrezca SMTP; cambiar de proveedor es cambiar variables de entorno.
 */

type Inbox = FormDef["inbox"];

const INBOX_ENV: Record<Inbox, string> = {
  comercial: "MAIL_TO_COMERCIAL",
  laboratorio: "MAIL_TO_LABORATORIO",
  soporte: "MAIL_TO_SOPORTE",
  rrhh: "MAIL_TO_RRHH",
  calidad: "MAIL_TO_CALIDAD",
};

type MailConfig = {
  from: string;
  transport: {
    host: string;
    port: number;
    secure: boolean;
    auth: { user: string; pass: string };
    tls?: { servername: string };
  };
};

export function mailConfig(): MailConfig | null {
  const { SMTP_HOST, SMTP_USER, SMTP_PASSWORD, MAIL_FROM } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASSWORD) return null;
  const port = Number(process.env.SMTP_PORT) || 465;
  const servername = process.env.SMTP_TLS_SERVERNAME;
  return {
    from: MAIL_FROM || SMTP_USER,
    transport: {
      host: SMTP_HOST,
      port,
      // 465 = TLS directo; 587 = STARTTLS (secure false: nodemailer lo negocia)
      secure: (process.env.SMTP_SECURE ?? String(port === 465)) === "true",
      auth: { user: SMTP_USER, pass: SMTP_PASSWORD },
      // Nombre con el que se valida el certificado cuando el del servidor no coincide con SMTP_HOST
      // (MegaLink: mail.metrica.com.bo presenta el certificado *.megalink.com de h22.megalink.com)
      ...(servername && { tls: { servername } }),
    },
  };
}

/** Destinatarios del buzón del formulario; MAIL_TO_DEFAULT cubre los buzones sin dirección propia */
export function recipientsFor(inbox: Inbox) {
  const list = process.env[INBOX_ENV[inbox]] || process.env.MAIL_TO_DEFAULT || "";
  return list.split(",").map((address) => address.trim()).filter(Boolean);
}

let transporter: Transporter | null = null;

export type Mail = {
  to: string[];
  subject: string;
  text: string;
  html: string;
  replyTo?: string;
  attachments: File[];
};

export async function sendMail(config: MailConfig, mail: Mail) {
  transporter ??= nodemailer.createTransport(config.transport);
  await transporter.sendMail({
    from: config.from,
    to: mail.to,
    replyTo: mail.replyTo,
    subject: mail.subject,
    text: mail.text,
    html: mail.html,
    attachments: await Promise.all(
      mail.attachments.map(async (file) => ({
        filename: file.name,
        contentType: file.type || undefined,
        content: Buffer.from(await file.arrayBuffer()),
      }))
    ),
  });
}
