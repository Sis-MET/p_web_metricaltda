"use client";

import { useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { KeyRound, Trash2, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/forms/Select";
import { controlCls } from "@/components/forms/styles";
import { Field, Notice } from "@/components/panel/Field";
import { authClient, authErrorMessage } from "@/lib/auth-client";
import { ROLES, type Role } from "@/lib/panel/roles";
import { cn } from "@/lib/utils";

type User = { id: string; name: string; email: string; role: Role; active: boolean; createdAt: string };

const ROLE_OPTIONS = Object.entries(ROLES).map(([value, role]) => ({ value, label: role.label }));

const date = new Intl.DateTimeFormat("es-BO", { dateStyle: "medium", timeZone: "America/La_Paz" });

/** Cuentas del panel: crear, rol, activar/desactivar, contraseña nueva y eliminar (API de administración) */
export function UsersManager({ users, meId }: { users: User[]; meId: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [message, setMessage] = useState<{ tone: "ok" | "error"; text: string } | null>(null);
  // Tras cada operación las listas de rol se rearman con lo guardado (si un cambio falla, vuelven atrás)
  const [version, setVersion] = useState(0);

  /** Ejecuta una operación y refresca la lista */
  const run = (operation: () => Promise<{ error: unknown }>, done: string) =>
    start(async () => {
      const { error } = await operation();
      setVersion((v) => v + 1);
      if (error) setMessage({ tone: "error", text: authErrorMessage(error as Parameters<typeof authErrorMessage>[0]) });
      else {
        setMessage({ tone: "ok", text: done });
        router.refresh();
      }
    });

  function create(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const name = String(data.get("name")).trim();
    run(async () => {
      const result = await authClient.admin.createUser({
        name,
        email: String(data.get("email")).trim().toLowerCase(),
        password: String(data.get("password")),
        role: data.get("role") as Role,
      });
      if (!result.error) form.reset();
      return result;
    }, `Se creó la cuenta de ${name}. Compártale su correo y la contraseña inicial; la puede cambiar en “Mi cuenta”.`);
  }

  function setPassword(user: User) {
    const password = window.prompt(`Nueva contraseña para ${user.name} (al menos 10 caracteres):`);
    if (!password) return;
    run(() => authClient.admin.setUserPassword({ userId: user.id, newPassword: password }), `La contraseña de ${user.name} cambió.`);
  }

  return (
    <div className="flex flex-col gap-8">
      {message && <Notice tone={message.tone}>{message.text}</Notice>}

      <ul className="divide-y divide-neutral-200 overflow-hidden rounded-2xl border border-neutral-200 bg-white">
        {users.map((user) => {
          const me = user.id === meId;
          return (
            <li key={user.id} className={cn("flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3.5 sm:px-5", !user.active && "bg-neutral-50")}>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-ink-950">
                  {user.name}
                  {me && <span className="ml-2 text-xs font-medium text-neutral-500">(usted)</span>}
                  {!user.active && (
                    <span className="ml-2 rounded-full bg-neutral-200 px-2 py-0.5 text-xs font-semibold text-neutral-600">Desactivada</span>
                  )}
                </p>
                <p className="truncate text-xs text-neutral-500">
                  {user.email} · desde {date.format(new Date(user.createdAt))}
                </p>
              </div>
              <div className="w-44">
                <Select
                  key={`${user.role}-${version}`}
                  id={`rol-${user.id}`}
                  name={`rol-${user.id}`}
                  label={`Rol de ${user.name}`}
                  defaultValue={user.role}
                  disabled={me || pending}
                  options={ROLE_OPTIONS}
                  onChange={(role) =>
                    run(
                      () => authClient.admin.setRole({ userId: user.id, role: role as Role }),
                      `${user.name} ahora es ${ROLES[role as Role].label.toLowerCase()}.`
                    )
                  }
                  className={cn(controlCls(), "h-9 text-sm")}
                />
              </div>
              {!me && (
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() =>
                      user.active
                        ? window.confirm(`¿Desactivar la cuenta de ${user.name}? No podrá ingresar hasta que la reactive.`) &&
                          run(() => authClient.admin.banUser({ userId: user.id }), `Se desactivó la cuenta de ${user.name}.`)
                        : run(() => authClient.admin.unbanUser({ userId: user.id }), `Se reactivó la cuenta de ${user.name}.`)
                    }
                    className="h-9 rounded-full border border-neutral-300 px-3.5 text-sm font-semibold text-ink-900 hover:border-ink-800 disabled:opacity-60"
                  >
                    {user.active ? "Desactivar" : "Reactivar"}
                  </button>
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => setPassword(user)}
                    className="flex size-9 items-center justify-center rounded-lg text-neutral-500 hover:bg-neutral-100 hover:text-ink-950"
                    aria-label={`Nueva contraseña para ${user.name}`}
                    title="Nueva contraseña"
                  >
                    <KeyRound className="size-4" />
                  </button>
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() =>
                      window.confirm(`¿Eliminar la cuenta de ${user.name}? No se puede deshacer (sus cambios en el catálogo se conservan).`) &&
                      run(() => authClient.admin.removeUser({ userId: user.id }), `Se eliminó la cuenta de ${user.name}.`)
                    }
                    className="flex size-9 items-center justify-center rounded-lg text-neutral-500 hover:bg-neutral-100 hover:text-red-600"
                    aria-label={`Eliminar la cuenta de ${user.name}`}
                    title="Eliminar"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              )}
            </li>
          );
        })}
      </ul>

      <section className="rounded-2xl border border-neutral-200 bg-white p-5 sm:p-6">
        <h2 className="font-heading text-base font-bold text-ink-950">Nueva cuenta</h2>
        <form onSubmit={create} method="post" className="mt-5 grid gap-5 sm:grid-cols-2">
          <Field label="Nombre" htmlFor="new-name" required>
            <input id="new-name" name="name" required autoComplete="off" className={controlCls()} />
          </Field>
          <Field label="Correo" htmlFor="new-email" required>
            <input id="new-email" name="email" type="email" required autoComplete="off" className={controlCls()} />
          </Field>
          <Field label="Contraseña inicial" htmlFor="new-password" required hint="Al menos 10 caracteres; la persona la cambia en “Mi cuenta”.">
            <input id="new-password" name="password" type="text" required minLength={10} autoComplete="off" className={controlCls()} />
          </Field>
          <Field label="Rol" htmlFor="new-role" required>
            <Select
              id="new-role"
              name="role"
              defaultValue="comercial"
              options={Object.entries(ROLES).map(([value, role]) => ({ value, label: `${role.label} — ${role.description}` }))}
              className={controlCls()}
            />
          </Field>
          <div className="sm:col-span-2">
            <Button type="submit" disabled={pending}>
              <UserPlus />
              {pending ? "Guardando…" : "Crear la cuenta"}
            </Button>
          </div>
        </form>
      </section>
    </div>
  );
}
