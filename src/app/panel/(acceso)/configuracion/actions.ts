"use server";

import { timingSafeEqual } from "node:crypto";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getAuth } from "@/lib/auth";
import { ADMIN_ROLE } from "@/lib/panel/roles";
import { PANEL_HOME, hasUsers } from "@/lib/panel/session";

export type SetupState = { error?: string; fields?: Record<string, string> };

const input = z.object({
  token: z.string().min(1, "Escriba el código de configuración."),
  name: z.string().trim().min(2, "Escriba su nombre.").max(120),
  email: z.email("Escriba un correo válido.").trim().toLowerCase(),
  password: z.string().min(10, "La contraseña debe tener al menos 10 caracteres.").max(128),
  confirm: z.string(),
});

const sameSecret = (a: string, b: string) => {
  const [x, y] = [Buffer.from(a), Buffer.from(b)];
  return x.length === y.length && timingSafeEqual(x, y);
};

/**
 * Crea la cuenta del primer administrador. Solo mientras la base no tiene usuarios y con el código
 * PANEL_SETUP_TOKEN (variable del servidor): nadie más puede adelantarse a crearla.
 */
export async function createFirstAdmin(_state: SetupState, form: FormData): Promise<SetupState> {
  const fields = Object.fromEntries(["name", "email"].map((key) => [key, String(form.get(key) ?? "")]));
  const parsed = input.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message, fields };
  const { token, name, email, password, confirm } = parsed.data;
  if (password !== confirm) return { error: "Las contraseñas no coinciden.", fields };

  const expected = process.env.PANEL_SETUP_TOKEN;
  if (!expected) return { error: "Falta definir PANEL_SETUP_TOKEN en el servidor.", fields };
  if (!sameSecret(token, expected)) return { error: "El código de configuración no es correcto.", fields };
  if (await hasUsers()) redirect("/panel/ingresar");

  const auth = getAuth();
  const context = await auth.$context;
  const user = await context.internalAdapter.createUser(
    { name, email, emailVerified: true, role: ADMIN_ROLE },
    { method: "admin" }
  );
  await context.internalAdapter.linkAccount({
    userId: user.id,
    providerId: "credential",
    accountId: user.id,
    password: await context.password.hash(password),
  });

  // Entra directamente con la cuenta recién creada
  await auth.api.signInEmail({ body: { email, password }, headers: await headers() });
  redirect(PANEL_HOME);
}
