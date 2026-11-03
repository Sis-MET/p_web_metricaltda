import type { Metadata } from "next";
import { PanelHeader } from "@/components/panel/PanelHeader";
import { ROLES } from "@/lib/panel/roles";
import { requireUser } from "@/lib/panel/session";
import { PasswordForm } from "./PasswordForm";

export const metadata: Metadata = { title: "Mi cuenta" };

export default async function AccountPage() {
  const user = await requireUser();
  return (
    <>
      <PanelHeader title="Mi cuenta" description={`${user.name} · ${user.email} · ${ROLES[user.role].label}`} />
      <section className="max-w-xl rounded-2xl border border-neutral-200 bg-white p-5 sm:p-6">
        <h2 className="font-heading text-base font-bold text-ink-950">Cambiar la contraseña</h2>
        <p className="mt-1 text-sm text-neutral-500">Al cambiarla se cierran sus sesiones en otros equipos.</p>
        <PasswordForm />
      </section>
    </>
  );
}
