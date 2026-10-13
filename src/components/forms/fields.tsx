"use client";

import { useState } from "react";
import { ChevronDown, FileUp } from "lucide-react";
import { acceptAttr, FILE_KINDS, type FieldDef } from "@/lib/forms/schema";
import { useQuoteItems } from "@/lib/quote-store";
import { cn } from "@/lib/utils";

export const controlCls = (invalid?: boolean) =>
  cn(
    "block h-11 w-full rounded-xl border bg-white px-3.5 text-[15px] text-ink-950 shadow-[0_1px_2px_rgba(0,0,0,0.04)] outline-none transition-[border-color,box-shadow] duration-150 placeholder:text-neutral-400",
    "focus:border-ink-500 focus:ring-4 focus:ring-ink-500/15 disabled:opacity-60",
    invalid ? "border-red-400 focus:border-red-500 focus:ring-red-500/15" : "border-neutral-200 hover:border-neutral-300"
  );

/** Campos que ocupan siempre las dos columnas */
const FULL_WIDTH = new Set<FieldDef["type"]>(["textarea", "file", "checkbox"]);

type FieldProps = { field: FieldDef; error?: string; idPrefix: string };

function Message({ id, error, hint }: { id: string; error?: string; hint?: string }) {
  if (error)
    return (
      <p id={`${id}-error`} className="text-xs font-medium text-red-600">
        {error}
      </p>
    );
  return hint ? <p id={`${id}-hint`} className="text-xs text-neutral-500">{hint}</p> : null;
}

function Label({ htmlFor, field, as: Tag = "label" }: { htmlFor?: string; field: FieldDef; as?: "label" | "legend" }) {
  return (
    <Tag htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium text-ink-950">
      {field.label}
      {field.required && (
        <span className="text-neutral-400" aria-hidden>
          {" "}
          *
        </span>
      )}
    </Tag>
  );
}

/** Lista de cotización del navegador como campo oculto */
function QuoteInput({ name }: { name: string }) {
  const items = useQuoteItems();
  return <input type="hidden" name={name} value={JSON.stringify(items)} />;
}

function FileInput({ field, id, describedBy, invalid }: { field: Extract<FieldDef, { type: "file" }>; id: string; describedBy?: string; invalid: boolean }) {
  const [names, setNames] = useState<string[]>([]);
  const multiple = (field.maxFiles ?? 1) > 1;
  const formats = field.accept.map((kind) => FILE_KINDS[kind].label).join(", ");

  return (
    <div
      className={cn(
        "relative flex items-center gap-3 rounded-xl border border-dashed bg-white px-4 py-4 transition-colors focus-within:border-ink-500 focus-within:ring-4 focus-within:ring-ink-500/15 hover:border-neutral-400",
        invalid ? "border-red-400" : "border-neutral-300"
      )}
    >
      <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-ink-700">
        <FileUp className="size-4" aria-hidden />
      </span>
      <span className="min-w-0 text-sm">
        {names.length ? (
          <span className="block truncate font-medium text-ink-950">{names.join(", ")}</span>
        ) : (
          <span className="block font-medium text-ink-950">Seleccione o arrastre {multiple ? "los archivos" : "el archivo"}</span>
        )}
        <span className="block text-xs text-neutral-500">{formats}</span>
      </span>
      {/* El input cubre toda la zona: acepta clic y arrastrar y soltar */}
      <input
        id={id}
        name={field.name}
        type="file"
        accept={acceptAttr(field.accept)}
        multiple={multiple}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        onChange={(event) => setNames(Array.from(event.currentTarget.files ?? [], (file) => file.name))}
        className="absolute inset-0 cursor-pointer opacity-0"
      />
    </div>
  );
}

function Control({ field, id, describedBy, invalid }: { field: FieldDef; id: string; describedBy?: string; invalid: boolean }) {
  const aria = { "aria-invalid": invalid || undefined, "aria-describedby": describedBy };

  switch (field.type) {
    case "text":
    case "email":
    case "tel":
      return (
        <input
          id={id}
          name={field.name}
          type={field.type}
          autoComplete={field.autoComplete}
          placeholder={field.placeholder}
          maxLength={field.maxLength}
          className={controlCls(invalid)}
          {...aria}
        />
      );
    case "textarea":
      return (
        <textarea
          id={id}
          name={field.name}
          rows={field.rows ?? 4}
          placeholder={field.placeholder}
          maxLength={field.maxLength}
          className={cn(controlCls(invalid), "h-auto resize-y py-3")}
          {...aria}
        />
      );
    case "select":
      return (
        <div className="relative">
          <select id={id} name={field.name} defaultValue="" className={cn(controlCls(invalid), "appearance-none pr-10")} {...aria}>
            <option value="" disabled={field.required}>
              {field.placeholder ?? "Seleccione"}
            </option>
            {field.options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-neutral-400" aria-hidden />
        </div>
      );
    case "radio":
    case "checkbox":
      return (
        <div className="flex flex-wrap gap-2" {...(field.type === "radio" ? { role: "radiogroup" } : {})}>
          {field.options.map((option) => (
            <label
              key={option.value}
              className={cn(
                "inline-flex cursor-pointer items-center gap-2 rounded-full border bg-white px-4 py-2 text-sm font-medium text-ink-800 transition-colors",
                "hover:border-neutral-400 has-[:checked]:border-ink-900 has-[:checked]:bg-ink-900 has-[:checked]:text-white has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-ink-500/20",
                invalid ? "border-red-400" : "border-neutral-200"
              )}
            >
              <input type={field.type} name={field.name} value={option.value} className="sr-only" {...aria} />
              {option.label}
            </label>
          ))}
        </div>
      );
    case "file":
      return <FileInput field={field} id={id} describedBy={describedBy} invalid={invalid} />;
    case "quote":
      return <QuoteInput name={field.name} />;
  }
}

/** Un campo del formulario con su etiqueta, ayuda y error */
export function FormField({ field, error, idPrefix }: FieldProps) {
  if (field.type === "quote") return <Control field={field} id="" invalid={false} />;

  const id = `${idPrefix}-${field.name}`;
  const describedBy = error ? `${id}-error` : field.hint ? `${id}-hint` : undefined;
  const isGroup = field.type === "radio" || field.type === "checkbox";
  const Wrapper = isGroup ? "fieldset" : "div";

  return (
    <Wrapper className={cn("min-w-0", (field.full || FULL_WIDTH.has(field.type)) && "sm:col-span-2")}>
      <Label field={field} htmlFor={isGroup ? undefined : id} as={isGroup ? "legend" : "label"} />
      <Control field={field} id={id} describedBy={describedBy} invalid={Boolean(error)} />
      <div className="mt-1.5 empty:hidden">
        <Message id={id} error={error} hint={field.hint} />
      </div>
    </Wrapper>
  );
}
