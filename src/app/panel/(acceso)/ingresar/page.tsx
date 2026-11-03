import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PANEL_HOME, SETUP_HREF, currentUser, hasUsers } from "@/lib/panel/session";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "Ingresar" };

export default async function LoginPage() {
  if (!(await hasUsers())) redirect(SETUP_HREF);
  if (await currentUser()) redirect(PANEL_HOME);

  return (
    <>
      <h1 className="font-heading text-2xl font-bold text-ink-950">Ingresar</h1>
      <p className="mt-1.5 text-sm text-neutral-600">Con el correo y la contraseña de su cuenta del panel.</p>
      <LoginForm />
    </>
  );
}
