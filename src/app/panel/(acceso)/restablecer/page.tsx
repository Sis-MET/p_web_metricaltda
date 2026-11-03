"use client";

import { Suspense, useState, type FormEvent } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { KeyRound } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { controlCls } from "@/components/forms/styles";
import { Field, Notice } from "@/components/panel/Field";
import { authClient, authErrorMessage } from "@/lib/auth-client";

function ResetForm() {
  const params = useSearchParams();
  const token = params.get("token");
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  if (!token || params.get("error"))
    return <Notice tone="error">El enlace venció o ya se usó. Pida uno nuevo desde “¿Olvidó su contraseña?”.</Notice>;

  if (done)
    return (
      <Notice tone="ok">
        Listo: su contraseña cambió.{" "}
        <Link href="/panel/ingresar" className="font-semibold underline">
          Ingrese con la nueva
        </Link>
        .
      </Notice>
    );

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const password = String(data.get("password"));
    if (password !== String(data.get("confirm"))) return setError("Las contraseñas no coinciden.");
    setPending(true);
    setError(null);
    const { error } = await authClient.resetPassword({ newPassword: password, token: token! });
    setPending(false);
    if (error) setError(authErrorMessage(error));
    else setDone(true);
  }

  return (
    <form onSubmit={submit} method="post" className="flex flex-col gap-4">
      {error && <Notice tone="error">{error}</Notice>}
      <Field label="Nueva contraseña" htmlFor="password" hint="Al menos 10 caracteres.">
        <input id="password" name="password" type="password" autoComplete="new-password" minLength={10} required className={controlCls()} />
      </Field>
      <Field label="Repita la contraseña" htmlFor="confirm">
        <input id="confirm" name="confirm" type="password" autoComplete="new-password" minLength={10} required className={controlCls()} />
      </Field>
      <Button type="submit" disabled={pending}>
        <KeyRound />
        {pending ? "Guardando…" : "Guardar la contraseña"}
      </Button>
    </form>
  );
}

/** Llega desde el enlace del correo (?token=…) */
export default function ResetPasswordPage() {
  return (
    <>
      <h1 className="mb-6 font-heading text-2xl font-bold text-ink-950">Nueva contraseña</h1>
      <Suspense>
        <ResetForm />
      </Suspense>
    </>
  );
}
