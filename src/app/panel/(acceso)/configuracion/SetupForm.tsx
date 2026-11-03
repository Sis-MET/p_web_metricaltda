"use client";

import { useActionState } from "react";
import { ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { controlCls } from "@/components/forms/styles";
import { Field, Notice } from "@/components/panel/Field";
import { createFirstAdmin, type SetupState } from "./actions";

export function SetupForm() {
  const [state, action, pending] = useActionState(createFirstAdmin, {} as SetupState);

  return (
    <form action={action} className="mt-6 flex flex-col gap-4">
      {state.error && <Notice tone="error">{state.error}</Notice>}
      <Field label="Código de configuración" htmlFor="token">
        <input id="token" name="token" type="password" autoComplete="off" required className={controlCls()} />
      </Field>
      <Field label="Nombre" htmlFor="name">
        <input id="name" name="name" autoComplete="name" required defaultValue={state.fields?.name} className={controlCls()} />
      </Field>
      <Field label="Correo" htmlFor="email">
        <input id="email" name="email" type="email" autoComplete="username" required defaultValue={state.fields?.email} className={controlCls()} />
      </Field>
      <Field label="Contraseña" htmlFor="password" hint="Al menos 10 caracteres.">
        <input id="password" name="password" type="password" autoComplete="new-password" minLength={10} required className={controlCls()} />
      </Field>
      <Field label="Repita la contraseña" htmlFor="confirm">
        <input id="confirm" name="confirm" type="password" autoComplete="new-password" minLength={10} required className={controlCls()} />
      </Field>
      <Button type="submit" disabled={pending} className="mt-2">
        <ShieldCheck />
        {pending ? "Creando…" : "Crear la cuenta e ingresar"}
      </Button>
    </form>
  );
}
