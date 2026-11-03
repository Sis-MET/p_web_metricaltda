"use client";

import { useActionState, useState, useTransition, type FormEvent, type ReactNode } from "react";
import { FileText, Save } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { controlCls } from "@/components/forms/styles";
import { Field, Notice } from "@/components/panel/Field";
import { ImageField } from "@/components/panel/ImageField";
import { PairListEditor, TextListEditor } from "@/components/panel/ListEditors";
import { ENVIRONMENTS, PRODUCT_DEMOS } from "@/content/catalog";
import { slugify } from "@/lib/panel/slug";
import type { ActionState } from "@/lib/panel/types";
import { cn } from "@/lib/utils";

export type ProductFormValues = {
  categoryId: number | null;
  lineId: number | null;
  model: string;
  type: string;
  slug: string;
  summary: string;
  description: string;
  capacity: { min: string; max: string; unit: "kg" | "t" };
  protection: string;
  environments: string[];
  features: string[];
  specs: { label: string; value: string }[];
  image: string | null;
  brochure: { href: string; size: number; language?: "en" } | null;
  demo: string | null;
  published: boolean;
};

export type CategoryOption = { id: number; name: string; lines: { id: number; name: string }[] };

const PROTECTIONS = ["IP65", "IP66", "IP67", "IP65 / IP67", "IP68", "IP68 / IP69K", "IP69K"];
const megabytes = new Intl.NumberFormat("es-BO", { maximumFractionDigits: 1 });

function Section({ title, hint, children, className }: { title: string; hint?: string; children: ReactNode; className?: string }) {
  return (
    <section className="rounded-2xl border border-neutral-200 bg-white p-5 sm:p-6">
      <h2 className="font-heading text-base font-bold text-ink-950">{title}</h2>
      {hint && <p className="mt-1 text-sm text-neutral-500">{hint}</p>}
      <div className={cn("mt-5", className)}>{children}</div>
    </section>
  );
}

/**
 * Formulario de un producto. Se envía sin recargar ni vaciar los campos: si algo falla, el mensaje
 * aparece y lo escrito sigue ahí. Imagen y ficha se suben con el formulario.
 */
export function ProductForm({
  save,
  initial,
  categories,
  typeOptions,
}: {
  save: (state: ActionState, form: FormData) => Promise<ActionState>;
  initial: ProductFormValues;
  categories: CategoryOption[];
  typeOptions: string[];
}) {
  const [state, action] = useActionState(save, {} as ActionState);
  const [pending, start] = useTransition();
  const [categoryId, setCategoryId] = useState(initial.categoryId ?? categories[0]?.id ?? 0);
  const [slug, setSlug] = useState(initial.slug);
  const [slugEdited, setSlugEdited] = useState(Boolean(initial.slug));
  const [summary, setSummary] = useState(initial.summary);
  const errors = state.fieldErrors ?? {};
  const lines = categories.find((category) => category.id === categoryId)?.lines ?? [];
  const categorySlug = slugify(categories.find((category) => category.id === categoryId)?.name ?? "");

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    start(() => action(data));
  };

  return (
    <form onSubmit={submit} method="post" encType="multipart/form-data" className="flex flex-col gap-6">
      {state.error && <Notice tone="error">{state.error}</Notice>}

      <Section title="Identificación" className="grid gap-5 sm:grid-cols-2">
        <Field label="Categoría" htmlFor="categoryId" required error={errors.categoryId}>
          <select
            id="categoryId"
            name="categoryId"
            value={categoryId}
            onChange={(event) => setCategoryId(Number(event.target.value))}
            className={controlCls(Boolean(errors.categoryId))}
          >
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Línea" htmlFor="lineId" error={errors.lineId} hint={lines.length ? undefined : "Esta categoría no tiene líneas."}>
          <select
            key={categoryId}
            id="lineId"
            name="lineId"
            defaultValue={initial.categoryId === categoryId ? (initial.lineId ?? "") : ""}
            disabled={!lines.length}
            className={controlCls(Boolean(errors.lineId))}
          >
            <option value="">Sin línea</option>
            {lines.map((line) => (
              <option key={line.id} value={line.id}>
                {line.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Modelo" htmlFor="model" required error={errors.model} hint="El título de la ficha: PBA439, VTS200…">
          <input
            id="model"
            name="model"
            required
            defaultValue={initial.model}
            onChange={(event) => !slugEdited && setSlug(slugify(event.target.value))}
            className={controlCls(Boolean(errors.model))}
          />
        </Field>
        <Field label="Tipo de equipo" htmlFor="type" required error={errors.type} hint="Báscula compacta, plataforma de pesaje…">
          <input id="type" name="type" required list="product-types" defaultValue={initial.type} className={controlCls(Boolean(errors.type))} />
          <datalist id="product-types">
            {typeOptions.map((type) => (
              <option key={type} value={type} />
            ))}
          </datalist>
        </Field>
        <Field
          label="Dirección"
          htmlFor="slug"
          required
          error={errors.slug}
          hint={`metrica.com.bo/productos/${categorySlug || "…"}/${slug || "…"}`}
          className="sm:col-span-2"
        >
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
      </Section>

      <Section title="Textos" className="flex flex-col gap-5">
        <Field
          label="Resumen"
          htmlFor="summary"
          required
          error={errors.summary}
          hint={`Una o dos líneas para las tarjetas y los buscadores · ${summary.length}/300`}
        >
          <textarea
            id="summary"
            name="summary"
            required
            rows={2}
            maxLength={300}
            value={summary}
            onChange={(event) => setSummary(event.target.value)}
            className={cn(controlCls(Boolean(errors.summary)), "h-auto resize-y py-3")}
          />
        </Field>
        <Field label="Descripción" htmlFor="description" required error={errors.description}>
          <textarea
            id="description"
            name="description"
            required
            rows={6}
            maxLength={5000}
            defaultValue={initial.description}
            className={cn(controlCls(Boolean(errors.description)), "h-auto resize-y py-3")}
          />
        </Field>
      </Section>

      <Section title="Datos destacados" hint="Aparecen en la tarjeta y al inicio de la ficha." className="grid gap-5 sm:grid-cols-2">
        <Field label="Capacidad" error={errors.capacityMin ?? errors.capacityMax} hint="Mínima y máxima; vacía si depende del modelo.">
          <div className="flex items-center gap-2">
            <input
              name="capacityMin"
              inputMode="decimal"
              placeholder="Mín."
              aria-label="Capacidad mínima"
              defaultValue={initial.capacity.min}
              className={controlCls(Boolean(errors.capacityMin))}
            />
            <span className="text-neutral-400">–</span>
            <input
              name="capacityMax"
              inputMode="decimal"
              placeholder="Máx."
              aria-label="Capacidad máxima"
              defaultValue={initial.capacity.max}
              className={controlCls(Boolean(errors.capacityMax))}
            />
            <select name="capacityUnit" aria-label="Unidad" defaultValue={initial.capacity.unit} className={cn(controlCls(), "w-24 shrink-0")}>
              <option value="kg">kg</option>
              <option value="t">t</option>
            </select>
          </div>
        </Field>
        <Field label="Protección" htmlFor="protection" error={errors.protection} hint="Grado IP: IP65, IP68 / IP69K…">
          <input id="protection" name="protection" list="protections" defaultValue={initial.protection} className={controlCls()} />
          <datalist id="protections">
            {PROTECTIONS.map((value) => (
              <option key={value} value={value} />
            ))}
          </datalist>
        </Field>
        <fieldset className="sm:col-span-2">
          <legend className="mb-2 text-sm font-medium text-ink-950">Ambientes de trabajo</legend>
          <div className="grid gap-2 sm:grid-cols-2">
            {Object.entries(ENVIRONMENTS).map(([key, label]) => (
              <label key={key} className="flex items-center gap-3 rounded-xl border border-neutral-200 px-3.5 py-2.5 text-sm text-ink-900">
                <input type="checkbox" name="environments" value={key} defaultChecked={initial.environments.includes(key)} className="size-4 accent-ink-900" />
                {label}
              </label>
            ))}
          </div>
          <p className="mt-2 text-xs text-neutral-500">Son el filtro “Entorno de trabajo” del catálogo.</p>
        </fieldset>
      </Section>

      <Section title="Características" hint="Lo que hace bien el equipo, una por fila.">
        <TextListEditor name="features" initial={initial.features} addLabel="Agregar característica" placeholder="Resistente al agua y al polvo, con clasificación IP68/IP69K" />
        {errors.features && <p className="mt-2 text-xs font-medium text-red-600">{errors.features}</p>}
      </Section>

      <Section title="Especificaciones" hint="La tabla técnica de la ficha: dato y valor.">
        <PairListEditor
          name="specs"
          initial={initial.specs}
          keys={["label", "value"]}
          labels={["Dato", "Valor"]}
          placeholders={["Capacidades", "3, 6, 15 y 30 kg"]}
          addLabel="Agregar especificación"
        />
        {errors.specs && <p className="mt-2 text-xs font-medium text-red-600">{errors.specs}</p>}
      </Section>

      <Section title="Imagen" hint="PNG, JPG o WebP, idealmente recortada sobre fondo transparente. Máximo 8 MB.">
        <ImageField name="image" current={initial.image} error={errors.image} />
        {errors.image && <p className="mt-2 text-xs font-medium text-red-600">{errors.image}</p>}
      </Section>

      <Section title="Ficha técnica (PDF)" hint="El folleto del fabricante. Máximo 20 MB." className="flex flex-col gap-4">
        {initial.brochure && (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-neutral-200 px-4 py-3">
            <a href={initial.brochure.href} target="_blank" rel="noopener" className="inline-flex items-center gap-2 text-sm font-semibold text-ink-900 hover:underline">
              <FileText className="size-4" aria-hidden />
              Ficha actual · {megabytes.format(initial.brochure.size / 1024 / 1024)} MB
            </a>
            <label className="flex items-center gap-2 text-sm text-neutral-700">
              <input type="checkbox" name="removeBrochure" className="size-4 accent-red-600" />
              Quitar la ficha
            </label>
          </div>
        )}
        <div className="grid gap-4 sm:grid-cols-[1fr_12rem]">
          <Field label={initial.brochure ? "Reemplazar por otro PDF" : "Subir PDF"} htmlFor="brochure" error={errors.brochure}>
            <input
              id="brochure"
              name="brochure"
              type="file"
              accept="application/pdf"
              className="block w-full text-sm text-neutral-700 file:mr-3 file:rounded-full file:border file:border-neutral-300 file:bg-white file:px-4 file:py-2 file:text-sm file:font-semibold file:text-ink-900 hover:file:border-ink-800"
            />
          </Field>
          <Field label="Idioma" htmlFor="brochureLanguage">
            <select id="brochureLanguage" name="brochureLanguage" defaultValue={initial.brochure?.language ?? "es"} className={controlCls()}>
              <option value="es">Español</option>
              <option value="en">Inglés</option>
            </select>
          </Field>
        </div>
      </Section>

      <Section title="Publicación" className="grid gap-5 sm:grid-cols-2">
        <Field label="Demo 3D" htmlFor="demo" hint="Un demo programado que se muestra dentro de la ficha.">
          <select id="demo" name="demo" defaultValue={initial.demo ?? ""} className={controlCls()}>
            <option value="">Ninguno</option>
            {Object.entries(PRODUCT_DEMOS).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </Field>
        <label className="flex items-start gap-3 self-end rounded-xl border border-neutral-200 p-4">
          <input type="checkbox" name="published" defaultChecked={initial.published} className="mt-0.5 size-5 accent-ink-900" />
          <span>
            <span className="block text-sm font-semibold text-ink-950">Publicado</span>
            <span className="block text-xs text-neutral-500">Visible en el catálogo, la cotización y el asistente.</span>
          </span>
        </label>
      </Section>

      <div className="sticky bottom-0 -mx-4 flex justify-end gap-3 border-t border-neutral-200 bg-neutral-100/95 px-4 py-4 sm:-mx-8 sm:px-8">
        <Button type="submit" disabled={pending}>
          <Save />
          {pending ? "Guardando…" : "Guardar"}
        </Button>
      </div>
    </form>
  );
}
