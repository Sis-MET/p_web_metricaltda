import { createAccessControl } from "better-auth/plugins/access";
import { defaultStatements } from "better-auth/plugins/admin/access";

/**
 * Qué puede hacer cada rol con las cuentas del panel (plugin de administración de Better Auth). Lo
 * usan el servidor (quien decide) y el cliente (los tipos). El catálogo lo pueden editar los dos
 * roles: eso lo revisa cada acción del panel.
 */
export const accessControl = createAccessControl(defaultStatements);

export const PANEL_ROLES = {
  // Gestiona las cuentas; sin "impersonate": nadie entra al panel con la cuenta de otro
  admin: accessControl.newRole({
    user: ["create", "list", "set-role", "ban", "delete", "set-password", "set-email", "get", "update"],
    session: ["list", "revoke", "delete"],
  }),
  comercial: accessControl.newRole({ user: [], session: [] }),
};
