/** Roles del panel. Lo usan el servidor y la interfaz. */

export const ADMIN_ROLE = "admin";
export const DEFAULT_ROLE = "comercial";

export const ROLES = {
  admin: { label: "Administrador", description: "Usuarios y todo el catálogo" },
  comercial: { label: "Comercial", description: "Categorías y productos" },
} as const;

export type Role = keyof typeof ROLES;

export const isRole = (value: unknown): value is Role => typeof value === "string" && value in ROLES;
