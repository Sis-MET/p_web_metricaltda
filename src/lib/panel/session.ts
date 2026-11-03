import "server-only";
import { count } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { cache } from "react";
import { getAuth } from "@/lib/auth";
import { db, schema } from "@/lib/db";
import { ADMIN_ROLE, DEFAULT_ROLE, isRole, type Role } from "./roles";

export const PANEL_HOME = "/panel";
export const LOGIN_HREF = "/panel/ingresar";
export const SETUP_HREF = "/panel/configuracion";

export type PanelUser = { id: string; name: string; email: string; role: Role };

/** Quién usa el panel en este pedido (null sin sesión o con la cuenta desactivada) */
export const currentUser = cache(async (): Promise<PanelUser | null> => {
  // Primero el pedido (la página pasa a dinámica) y después la base: nunca al compilar
  const requestHeaders = await headers();
  const session = await getAuth().api.getSession({ headers: requestHeaders });
  const user = session?.user;
  if (!user || user.banned) return null;
  return { id: user.id, name: user.name, email: user.email, role: isRole(user.role) ? user.role : DEFAULT_ROLE };
});

/**
 * Cada página y cada acción del panel empieza por aquí: sin sesión, al ingreso; con `admin`, solo
 * para administradores. (El diseño del panel también lo revisa, pero las acciones se pueden
 * llamar por su cuenta: la verificación va en cada una.)
 */
export async function requireUser(role?: typeof ADMIN_ROLE): Promise<PanelUser> {
  const user = await currentUser();
  if (!user) redirect(LOGIN_HREF);
  if (role && user.role !== role) redirect(PANEL_HOME);
  return user;
}

/** Sin cuentas todavía: el panel pide crear la del primer administrador */
export async function hasUsers() {
  await connection();
  const [{ total }] = await db().select({ total: count() }).from(schema.users);
  return total > 0;
}
