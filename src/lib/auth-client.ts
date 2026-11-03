"use client";

import { adminClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import { PANEL_ROLES, accessControl } from "@/lib/panel/permissions";

/** Cliente del panel: ingresar, salir, contraseñas y (administradores) usuarios */
export const authClient = createAuthClient({ plugins: [adminClient({ ac: accessControl, roles: PANEL_ROLES })] });

/** Mensaje en español para los errores que devuelve el servidor de sesiones */
export function authErrorMessage(error: { status?: number; code?: string; message?: string } | null | undefined) {
  if (!error) return "No se pudo completar la acción. Inténtelo de nuevo.";
  if (error.status === 429) return "Demasiados intentos. Espere unos minutos y vuelva a intentarlo.";
  switch (error.code) {
    case "INVALID_EMAIL_OR_PASSWORD":
      return "El correo o la contraseña no son correctos.";
    case "BANNED_USER":
      return "Esta cuenta está desactivada. Consulte con un administrador.";
    case "PASSWORD_TOO_SHORT":
      return "La contraseña debe tener al menos 10 caracteres.";
    case "INVALID_PASSWORD":
      return "La contraseña actual no es correcta.";
    case "INVALID_TOKEN":
      return "El enlace venció o ya se usó. Pida uno nuevo.";
    case "USER_ALREADY_EXISTS":
    case "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL":
      return "Ya existe una cuenta con ese correo.";
    default:
      return error.message || "No se pudo completar la acción. Inténtelo de nuevo.";
  }
}
