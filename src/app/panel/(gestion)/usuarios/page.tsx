import type { Metadata } from "next";
import { asc } from "drizzle-orm";
import { PanelHeader } from "@/components/panel/PanelHeader";
import { db, schema } from "@/lib/db";
import { ADMIN_ROLE, DEFAULT_ROLE, isRole } from "@/lib/panel/roles";
import { requireUser } from "@/lib/panel/session";
import { UsersManager } from "./UsersManager";

export const metadata: Metadata = { title: "Usuarios" };

/** Solo administradores: las cuentas del panel */
export default async function UsersPage() {
  const me = await requireUser(ADMIN_ROLE);
  const rows = await db().select().from(schema.users).orderBy(asc(schema.users.name));
  const users = rows.map((user) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    role: isRole(user.role) ? user.role : DEFAULT_ROLE,
    active: !user.banned,
    createdAt: user.createdAt.toISOString(),
  }));

  return (
    <>
      <PanelHeader
        title="Usuarios"
        description="Las cuentas del panel. Cree una para cada persona del área comercial: nadie puede registrarse por su cuenta. Al desactivar una cuenta, su sesión se cierra al instante."
      />
      <UsersManager users={users} meId={me.id} />
    </>
  );
}
