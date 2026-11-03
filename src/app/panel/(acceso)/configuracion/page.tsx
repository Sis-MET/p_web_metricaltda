import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LOGIN_HREF, hasUsers } from "@/lib/panel/session";
import { SetupForm } from "./SetupForm";

export const metadata: Metadata = { title: "Configuración inicial" };

/** Solo existe mientras no hay usuarios: crea la cuenta del primer administrador */
export default async function SetupPage() {
  if (await hasUsers()) redirect(LOGIN_HREF);

  return (
    <>
      <h1 className="font-heading text-2xl font-bold text-ink-950">Primer administrador</h1>
      <p className="mt-1.5 text-sm leading-relaxed text-neutral-600">
        El panel todavía no tiene cuentas. Cree la suya con el código de configuración del servidor
        (PANEL_SETUP_TOKEN); después podrá crear las del área comercial.
      </p>
      <SetupForm />
    </>
  );
}
