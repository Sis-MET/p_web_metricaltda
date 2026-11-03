"use client";

import { useState, type FormEvent } from "react";
import { KeyRound } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { controlCls } from "@/components/forms/styles";
import { Field, Notice } from "@/components/panel/Field";
import { authClient, authErrorMessage } from "@/lib/auth-client";

export function PasswordForm() {
  const [message, setMessage] = useState<{ tone: "ok" | "error"; text: string } | null>(null);
  const [pending, setPending] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const newPassword = String(data.get("password"));
    if (newPassword !== String(data.get("confirm"))) return setMessage({ tone: "error", text: "Las contraseñas nuevas no coinciden." });
    setPending(true);
    const { error } = await authClient.changePassword({
      currentPassword: String(data.get("current")),
      newPassword,
      revokeOtherSessions: true,
    });
    setPending(false);
    if (error) return setMessage({ tone: "error", text: authErrorMessage(error) });
    form.reset();
    setMessage({ tone: "ok", text: "Su contraseña cambió." });
  }

  return (
    <form onSubmit={submit} method="post" className="mt-5 flex flex-col gap-4">
      {message && <Notice tone={message.tone}>{message.text}</Notice>}
      <Field label="Contraseña actual" htmlFor="current">
        <input id="current" name="current" type="password" autoComplete="current-password" required className={controlCls()} />
      </Field>
      <Field label="Nueva contraseña" htmlFor="password" hint="Al menos 10 caracteres.">
        <input id="password" name="password" type="password" autoComplete="new-password" minLength={10} required className={controlCls()} />
      </Field>
      <Field label="Repita la nueva contraseña" htmlFor="confirm">
        <input id="confirm" name="confirm" type="password" autoComplete="new-password" minLength={10} required className={controlCls()} />
      </Field>
      <Button type="submit" disabled={pending} className="self-start">
        <KeyRound />
        {pending ? "Guardando…" : "Cambiar la contraseña"}
      </Button>
    </form>
  );
}
