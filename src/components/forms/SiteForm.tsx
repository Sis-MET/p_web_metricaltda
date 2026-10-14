"use client";

import { startTransition, useActionState, useState, useSyncExternalStore, type FormEvent } from "react";
import { CircleAlert, CircleCheck, Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { FormField } from "./fields";
import { submitForm } from "@/lib/forms/actions";
import { FORMS, type FormId } from "@/lib/forms/definitions";
import { HONEYPOT, parseSubmission, type FieldErrors, type FormState } from "@/lib/forms/schema";
import { EMAILS, SALES_PHONE, whatsappUrl } from "@/content/company";
import { cn } from "@/lib/utils";

const IDLE: FormState = { status: "idle" };

const noSubscribe = () => () => {};

/**
 * true cuando React ya tomó el control del formulario. Antes de eso el navegador haría un envío
 * nativo (GET: los datos en la URL y la solicitud perdida), así que el botón espera.
 */
const useHydrated = () => useSyncExternalStore(noSubscribe, () => true, () => false);

type SiteFormProps = {
  id: FormId;
  className?: string;
  /** Se llama cuando el servidor confirma la recepción */
  onSuccess?: () => void;
};

/**
 * Formulario declarativo: valida en el navegador con las mismas reglas que el servidor,
 * conserva lo escrito si el envío falla y confirma con un número de referencia.
 */
export function SiteForm(props: SiteFormProps) {
  // Cambiar la key reinicia el formulario por completo ("Enviar otra solicitud")
  const [round, setRound] = useState(0);
  return <FormRound key={round} {...props} onReset={() => setRound((n) => n + 1)} />;
}

function FormRound({ id, className, onSuccess, onReset }: SiteFormProps & { onReset: () => void }) {
  const form = FORMS[id];
  const hydrated = useHydrated();
  const [state, dispatch, pending] = useActionState(async (previous: FormState, data: FormData) => {
    const next = await submitForm(id, previous, data);
    if (next.status === "success") onSuccess?.();
    return next;
  }, IDLE);

  // Errores visibles: los del navegador o los que devuelve el servidor
  const [errors, setErrors] = useState<FieldErrors>({});
  const [lastState, setLastState] = useState(state);
  if (state !== lastState) {
    setLastState(state);
    setErrors(state.status === "invalid" ? state.errors : {});
  }

  if (state.status === "success") {
    return <Success title={form.success.title} text={form.success.text} reference={state.reference} onReset={onReset} />;
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const element = event.currentTarget;
    const data = new FormData(element);
    const result = parseSubmission(form, data);

    if (!result.ok) {
      setErrors(result.errors);
      const first = form.fields.find((field) => result.errors[field.name]);
      element.querySelector<HTMLElement>(`[name="${first?.name}"]`)?.focus();
      return;
    }
    setErrors({});
    startTransition(() => dispatch(data));
  };

  // Al corregir un campo, su error desaparece
  const handleChange = (event: FormEvent<HTMLFormElement>) => {
    const { name } = event.target as HTMLInputElement;
    if (!errors[name]) return;
    setErrors((current) => {
      const next = { ...current };
      delete next[name];
      return next;
    });
  };

  return (
    <form onSubmit={handleSubmit} onChange={handleChange} noValidate className={cn("relative", className)}>
      <fieldset disabled={pending} className="grid gap-x-5 gap-y-4 sm:grid-cols-2">
        {form.fields.map((field) => (
          <FormField key={field.name} field={field} error={errors[field.name]} idPrefix={id} />
        ))}
      </fieldset>

      {/* Trampa para bots: fuera de la pantalla y fuera del orden de tabulación */}
      <div aria-hidden className="absolute -left-[9999px] size-px overflow-hidden">
        <input type="text" name={HONEYPOT} tabIndex={-1} autoComplete="off" />
      </div>

      {state.status === "error" && <DeliveryError />}

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs leading-relaxed text-neutral-500 sm:max-w-xs">
          Usamos sus datos solo para atender esta solicitud. Los campos con * son obligatorios.
        </p>
        {/* Con el botón deshabilitado tampoco hay envío implícito con Enter */}
        <Button type="submit" size="lg" disabled={pending || !hydrated} className="shrink-0">
          {pending ? (
            <>
              <Loader2 className="animate-spin" /> Enviando…
            </>
          ) : (
            <>
              {form.submitLabel} <Send />
            </>
          )}
        </Button>
      </div>
    </form>
  );
}

function DeliveryError() {
  const link = "font-semibold text-ink-950 underline underline-offset-2";
  return (
    <div role="alert" className="mt-6 flex gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-900">
      <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
      <p>
        No pudimos enviar su solicitud. Lo que escribió sigue aquí: inténtelo de nuevo en unos minutos o
        contáctenos por{" "}
        <a href={whatsappUrl()} target="_blank" rel="noopener noreferrer" className={link}>
          WhatsApp
        </a>
        , al <a href={`tel:${SALES_PHONE.number}`} className={link}>{SALES_PHONE.display}</a> o a{" "}
        <a href={`mailto:${EMAILS.info}`} className={link}>
          {EMAILS.info}
        </a>
        .
      </p>
    </div>
  );
}

function Success({ title, text, reference, onReset }: { title: string; text: string; reference: string; onReset: () => void }) {
  return (
    <div role="status" className="flex flex-col items-center py-10 text-center">
      <span className="flex size-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
        <CircleCheck className="size-7" aria-hidden />
      </span>
      <h3 className="mt-5 font-heading text-2xl font-bold text-ink-950">{title}</h3>
      <p className="mt-2 max-w-sm text-neutral-600">{text}</p>
      <p className="mt-6 rounded-xl border border-neutral-200 bg-neutral-50 px-5 py-3 text-sm text-neutral-600">
        Número de referencia
        <span className="mt-0.5 block font-mono text-lg font-semibold tracking-wider text-ink-950">{reference}</span>
      </p>
      <Button variant="outline" className="mt-8" onClick={onReset}>
        Enviar otra solicitud
      </Button>
    </div>
  );
}
