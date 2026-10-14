/**
 * Verifica el correo de los formularios con la misma configuración que usa el sitio.
 *
 *   pnpm mail:check            conexión y usuario SMTP, sin enviar nada
 *   pnpm mail:check --enviar   además, un correo de prueba a los buzones configurados
 */
import nodemailer from "nodemailer";
import { mailConfig, recipientsFor, sendMail } from "../src/lib/integrations/mail.ts";

const config = mailConfig();
if (!config) {
  console.error("Faltan SMTP_HOST, SMTP_USER o SMTP_PASSWORD (.env.local o variables del hosting).");
  process.exit(1);
}

const { host, port, secure, auth } = config.transport;
await nodemailer.createTransport(config.transport).verify();
console.log(`SMTP correcto: ${host}:${port} (${secure ? "TLS" : "STARTTLS"}) como ${auth.user}`);

if (process.argv.includes("--enviar")) {
  const to = recipientsFor("comercial");
  await sendMail(config, {
    to,
    subject: "Prueba del correo del sitio web Métrica",
    text: "Este es un correo de prueba de los formularios del sitio web. Si lo recibe, el envío funciona.",
    html: "<p>Este es un correo de prueba de los formularios del sitio web. Si lo recibe, el envío funciona.</p>",
    attachments: [],
  });
  console.log(`Correo de prueba enviado a ${to.join(", ")}`);
}
