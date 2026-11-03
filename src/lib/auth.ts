import "server-only";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { admin } from "better-auth/plugins";
import { db, schema } from "@/lib/db";
import { mailConfig, sendMail } from "@/lib/integrations/mail";
import { PANEL_ROLES, accessControl } from "@/lib/panel/permissions";
import { ADMIN_ROLE, DEFAULT_ROLE } from "@/lib/panel/roles";

/**
 * Inicio de sesión del panel (Better Auth, en la propia base: sin servicios externos). Solo correo y
 * contraseña, sin registro abierto: las cuentas las crea un administrador. Variables:
 * - BETTER_AUTH_SECRET: firma de las sesiones (una cadena larga y aleatoria, distinta por entorno).
 * - BETTER_AUTH_URL: la dirección pública del sitio (https://www.metrica.com.bo).
 */

const escapeHtml = (value: string) => value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** Enlace para restablecer la contraseña: por correo; sin SMTP (en desarrollo), en el registro */
async function sendResetLink({ email, name }: { email: string; name: string }, url: string) {
  const config = mailConfig();
  if (!config) {
    if (process.env.NODE_ENV === "production") throw new Error("Correo sin configurar: no se puede enviar el enlace");
    console.info(`[panel] Enlace para restablecer la contraseña de ${email}: ${url}`);
    return;
  }
  await sendMail(config, {
    to: [email],
    subject: "Restablecer su contraseña del panel de Métrica",
    text: `Hola, ${name}:\n\nPara elegir una nueva contraseña del panel, abra este enlace (vence en una hora):\n${url}\n\nSi no lo pidió usted, ignore este correo.`,
    html: `<p>Hola, ${escapeHtml(name)}:</p><p>Para elegir una nueva contraseña del panel, abra este enlace (vence en una hora):</p><p><a href="${escapeHtml(url)}">Restablecer la contraseña</a></p><p>Si no lo pidió usted, ignore este correo.</p>`,
    attachments: [],
  });
}

/** La dirección pública con y sin www: el panel acepta pedidos desde cualquiera de las dos */
function trustedOrigins() {
  const url = URL.parse(process.env.BETTER_AUTH_URL ?? "");
  if (!url) return [];
  const host = url.host.replace(/^www\./, "");
  return [`${url.protocol}//${host}`, `${url.protocol}//www.${host}`];
}

function createAuth() {
  return betterAuth({
    appName: "Panel de Métrica",
    trustedOrigins: trustedOrigins(),
    database: drizzleAdapter(db(), {
      provider: "mysql",
      schema: { user: schema.users, session: schema.sessions, account: schema.accounts, verification: schema.verifications },
    }),
    emailAndPassword: {
      enabled: true,
      disableSignUp: true,
      minPasswordLength: 10,
      maxPasswordLength: 128,
      resetPasswordTokenExpiresIn: 60 * 60,
      revokeSessionsOnPasswordReset: true,
      sendResetPassword: ({ user, url }) => sendResetLink(user, url),
    },
    // Una jornada de trabajo; se renueva sola mientras se usa el panel
    session: { expiresIn: 60 * 60 * 12, updateAge: 60 * 60 },
    // Pocos intentos de ingreso por dirección IP: frena a quien prueba contraseñas
    rateLimit: {
      enabled: true,
      window: 60,
      max: 60,
      customRules: {
        "/sign-in/email": { window: 300, max: 5 },
        "/request-password-reset": { window: 600, max: 3 },
      },
    },
    advanced: { cookiePrefix: "metrica-panel" },
    // nextCookies al final: deja la sesión en las cookies cuando se inicia desde el servidor
    plugins: [
      admin({ ac: accessControl, roles: PANEL_ROLES, defaultRole: DEFAULT_ROLE, adminRoles: [ADMIN_ROLE] }),
      nextCookies(),
    ],
  });
}

let instance: ReturnType<typeof createAuth> | undefined;

/** Se crea al primer uso: el paquete se compila sin acceso a la base */
export const getAuth = () => (instance ??= createAuth());
