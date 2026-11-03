"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogIn } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { controlCls } from "@/components/forms/styles";
import { Field, Notice } from "@/components/panel/Field";
import { authClient, authErrorMessage } from "@/lib/auth-client";

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setPending(true);
    setError(null);
    const { error } = await authClient.signIn.email({
      email: String(data.get("email")).trim(),
      password: String(data.get("password")),
    });
    if (error) {
      setError(authErrorMessage(error));
      setPending(false);
      return;
    }
    router.replace("/panel");
    router.refresh();
  }

  // method="post": si se envía antes de que cargue el JavaScript, la contraseña no queda en la dirección
  return (
    <form onSubmit={submit} method="post" className="mt-6 flex flex-col gap-4">
      {error && <Notice tone="error">{error}</Notice>}
      <Field label="Correo" htmlFor="email">
        <input id="email" name="email" type="email" autoComplete="username" required className={controlCls()} />
      </Field>
      <Field label="Contraseña" htmlFor="password">
        <input id="password" name="password" type="password" autoComplete="current-password" required className={controlCls()} />
      </Field>
      <Button type="submit" disabled={pending} className="mt-2">
        <LogIn />
        {pending ? "Ingresando…" : "Ingresar"}
      </Button>
      <Link href="/panel/olvide" className="self-center text-sm font-medium text-ink-800 underline-offset-4 hover:underline">
        ¿Olvidó su contraseña?
      </Link>
    </form>
  );
}
