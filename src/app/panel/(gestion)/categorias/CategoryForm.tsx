"use client";

import { useActionState, useState, useTransition, type FormEvent } from "react";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { controlCls } from "@/components/forms/styles";
import { Field, Notice } from "@/components/panel/Field";
import { ImageField } from "@/components/panel/ImageField";
import { PairListEditor } from "@/components/panel/ListEditors";
import { CATEGORY_DEMOS } from "@/content/catalog";
import { slugify } from "@/lib/panel/slug";
import type { ActionState } from "@/lib/panel/types";
import { cn } from "@/lib/utils";

export type CategoryFormValues = {
  name: string;
  slug: string;
  short: string;
  description: string;
  image: string | null;
  highlights: { title: string; text: string }[];
  demo: string | null;
  published: boolean;
};

const EMPTY: CategoryFormValues = { name: "", slug: "", short: "", description: "", image: null, highlights: [], demo: null, published: false };

/**
 * Formulario de una categoría. Se envía sin recargar ni vaciar los campos: si algo falla, el
 * mensaje aparece y lo escrito sigue ahí.
 */
export function CategoryForm({
  save,
  initial = EMPTY,
}: {
  save: (state: ActionState, form: FormData) => Promise<ActionState>;
  initial?: CategoryFormValues;
}) {
  const [state, action] = useActionState(save, {} as ActionState);
  const [pending, start] = useTransition();
  const [slug, setSlug] = useState(initial.slug);
  const [slugEdited, setSlugEdited] = useState(Boolean(initial.slug));
  const errors = state.fieldErrors ?? {};

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    start(() => action(data));
  };

  return (
    <form onSubmit={submit} method="post" encType="multipart/form-data" className="flex flex-col gap-8">
      {state.error && <Notice tone="error">{state.error}</Notice>}

      <section className="grid gap-5 rounded-2xl border border-neutral-200 bg-white p-5 sm:grid-cols-2 sm:p-6">
        <Field label="Nombre" htmlFor="name" required error={errors.name}>
          <input
            id="name"
            name="name"
            required
            defaultValue={initial.name}
            onChange={(event) => !slugEdited && setSlug(slugify(event.target.value))}
            className={controlCls(Boolean(errors.name))}
          />
        </Field>
        <Field label="Dirección" htmlFor="slug" required error={errors.slug} hint={`metrica.com.bo/productos/${slug || "…"}`}>
          <input
            id="slug"
            name="slug"
            required
            value={slug}
            onChange={(event) => {
              setSlugEdited(true);
              setSlug(event.target.value);
            }}
            className={controlCls(Boolean(errors.slug))}
          />
        </Field>
        <Field label="Resumen para el menú" htmlFor="short" required error={errors.short} hint="Una línea: aparece en el menú y en la tarjeta." className="sm:col-span-2">
          <input id="short" name="short" required maxLength={200} defaultValue={initial.short} className={controlCls(Boolean(errors.short))} />
        </Field>
        <Field label="Descripción" htmlFor="description" required error={errors.description} className="sm:col-span-2">
          <textarea
            id="description"
            name="description"
            required
            rows={4}
            maxLength={2000}
            defaultValue={initial.description}
            className={cn(controlCls(Boolean(errors.description)), "h-auto resize-y py-3")}
          />
        </Field>
      </section>

      <section className="rounded-2xl border border-neutral-200 bg-white p-5 sm:p-6">
        <Field label="Imagen" error={errors.image} hint="PNG, JPG o WebP, idealmente recortada sobre fondo transparente. Máximo 8 MB.">
          <ImageField name="image" current={initial.image} error={errors.image} />
        </Field>
      </section>

      <section className="rounded-2xl border border-neutral-200 bg-white p-5 sm:p-6">
        <Field
          label="Destacados"
          error={errors.highlights}
          hint="Por qué elegir esta línea: se muestran en su página (lo ideal son tres)."
        >
          <PairListEditor
            name="highlights"
            initial={initial.highlights}
            keys={["title", "text"]}
            labels={["Título", "Texto"]}
            placeholders={["Diagnóstico continuo", "El terminal supervisa cada celda y alerta ante una anomalía…"]}
            addLabel="Agregar destacado"
            multiline
            max={6}
          />
        </Field>
      </section>

      <section className="grid gap-5 rounded-2xl border border-neutral-200 bg-white p-5 sm:grid-cols-2 sm:p-6">
        <Field label="Demo 3D" htmlFor="demo" hint="Enlace a un demo programado, en la página de la categoría.">
          <select id="demo" name="demo" defaultValue={initial.demo ?? ""} className={controlCls()}>
            <option value="">Ninguno</option>
            {Object.entries(CATEGORY_DEMOS).map(([key, demo]) => (
              <option key={key} value={key}>
                {demo.label}
              </option>
            ))}
          </select>
        </Field>
        <label className="flex items-start gap-3 self-end rounded-xl border border-neutral-200 p-4">
          <input type="checkbox" name="published" defaultChecked={initial.published} className="mt-0.5 size-5 accent-ink-900" />
          <span>
            <span className="block text-sm font-semibold text-ink-950">Publicada</span>
            <span className="block text-xs text-neutral-500">Visible en el menú y en el catálogo del sitio.</span>
          </span>
        </label>
      </section>

      <div className="sticky bottom-0 -mx-4 flex justify-end gap-3 border-t border-neutral-200 bg-neutral-100/95 px-4 py-4 sm:-mx-8 sm:px-8">
        <Button type="submit" disabled={pending}>
          <Save />
          {pending ? "Guardando…" : "Guardar"}
        </Button>
      </div>
    </form>
  );
}
