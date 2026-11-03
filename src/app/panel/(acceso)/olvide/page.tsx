"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { controlCls } from "@/components/forms/styles";
import { Field, Notice } from "@/components/panel/Field";
import { authClient, authErrorMessage } from "@/lib/auth-client";

/** Pide el enlace para restablecer la contraseña (llega por correo y vence en una hora) */
export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    const { error } = await authClient.requestPasswordReset({
      email: String(new FormData(event.currentTarget).get("email")).trim(),
      redirectTo: "/panel/restablecer",
    });
    setPending(false);
    if (error) setError(authErrorMessage(error));
    else setSent(true);
  }

  return (
    <>
      <h1 className="font-heading text-2xl font-bold text-ink-950">Restablecer la contraseña</h1>
      {sent ? (
        <Notice tone="ok" className="mt-6">
          Si el correo pertenece a una cuenta del panel, le enviamos un enlace para elegir una nueva contraseña. Vence en una
          hora.
        </Notice>
      ) : (
        <form onSubmit={submit} method="post" className="mt-6 flex flex-col gap-4">
          <p className="text-sm text-neutral-600">Escriba el correo de su cuenta y le enviaremos un enlace.</p>
          {error && <Notice tone="error">{error}</Notice>}
          <Field label="Correo" htmlFor="email">
            <input id="email" name="email" type="email" autoComplete="username" required className={controlCls()} />
          </Field>
          <Button type="submit" disabled={pending}>
            <Mail />
            {pending ? "Enviando…" : "Enviar el enlace"}
          </Button>
        </form>
      )}
      <Link href="/panel/ingresar" className="mt-5 block text-center text-sm font-medium text-ink-800 underline-offset-4 hover:underline">
        Volver a ingresar
      </Link>
    </>
  );
}
