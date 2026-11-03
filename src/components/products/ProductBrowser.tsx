"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ProductCard } from "./ProductCard";
import { ENVIRONMENTS, type Environment, type Line, type ProductSummary } from "@/content/catalog";
import { cn } from "@/lib/utils";

type Filter<K extends string> = { param: string; label: string; options: Record<K, string> };

const ENVIRONMENT_FILTER: Filter<Environment> = { param: "entorno", label: "Entorno de trabajo", options: ENVIRONMENTS };

export function ProductGrid({ products }: { products: ProductSummary[] }) {
  return (
    <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((product) => (
        <li key={product.slug}>
          <ProductCard product={product} />
        </li>
      ))}
    </ul>
  );
}

function Chips<K extends string>({
  filter,
  available,
  value,
  onChange,
}: {
  filter: Filter<K>;
  available: K[];
  value: K | null;
  onChange: (value: K | null) => void;
}) {
  const options: [K | null, string][] = [[null, "Todos"], ...available.map((key): [K, string] => [key, filter.options[key]])];
  return (
    <fieldset className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
      <legend className="sr-only">{filter.label}</legend>
      <span aria-hidden className="w-36 shrink-0 text-xs font-semibold uppercase tracking-wider text-neutral-500">
        {filter.label}
      </span>
      <div className="flex flex-wrap gap-1.5">
        {options.map(([key, label]) => (
          <button
            key={key ?? "todos"}
            type="button"
            aria-pressed={value === key}
            onClick={() => onChange(key)}
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors duration-200",
              value === key
                ? "border-ink-900 bg-ink-900 text-white"
                : "border-neutral-200 bg-white text-ink-800 hover:border-neutral-400"
            )}
          >
            {label}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

/**
 * Catálogo filtrable. Los filtros viven en la URL (?tipo=…&entorno=…) para que un asesor
 * pueda compartir, por ejemplo, "plataformas para lavado intensivo" con un solo enlace.
 * `lines`: las líneas de la categoría, en su orden (el filtro de tipo de equipo).
 */
export function ProductBrowser({ products, lines }: { products: ProductSummary[]; lines: Line[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const lineFilter: Filter<string> = {
    param: "tipo",
    label: "Tipo de equipo",
    options: Object.fromEntries(lines.map((line) => [line.slug, line.name])),
  };
  const lineSlugs = lines.filter((line) => products.some((p) => p.line?.slug === line.slug)).map((line) => line.slug);
  const environments = (Object.keys(ENVIRONMENTS) as Environment[]).filter((env) =>
    products.some((p) => p.environments.includes(env))
  );

  const read = <K extends string>(filter: Filter<K>, available: K[]) => {
    const value = params.get(filter.param) as K | null;
    return value && available.includes(value) ? value : null;
  };
  const line = read(lineFilter, lineSlugs);
  const environment = read(ENVIRONMENT_FILTER, environments);

  const setParam = (param: string, value: string | null) => {
    const next = new URLSearchParams(params);
    if (value) next.set(param, value);
    else next.delete(param);
    const query = next.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  const visible = products.filter(
    (p) => (!line || p.line?.slug === line) && (!environment || p.environments.includes(environment))
  );

  return (
    <div>
      {(lineSlugs.length > 1 || environments.length > 1) && (
        <div className="mb-8 flex flex-col gap-3 border-b border-neutral-200 pb-6">
          {lineSlugs.length > 1 && (
            <Chips filter={lineFilter} available={lineSlugs} value={line} onChange={(v) => setParam(lineFilter.param, v)} />
          )}
          {environments.length > 1 && (
            <Chips
              filter={ENVIRONMENT_FILTER}
              available={environments}
              value={environment}
              onChange={(v) => setParam(ENVIRONMENT_FILTER.param, v)}
            />
          )}
        </div>
      )}

      <p className="mb-5 text-sm text-neutral-500" aria-live="polite">
        {visible.length} {visible.length === 1 ? "modelo" : "modelos"}
      </p>

      {visible.length > 0 ? (
        <ProductGrid products={visible} />
      ) : (
        <div className="rounded-3xl border border-dashed border-neutral-300 px-6 py-14 text-center">
          <p className="font-heading text-lg font-bold text-ink-950">Ningún modelo coincide con esos filtros</p>
          <p className="mx-auto mt-2 max-w-md text-sm text-neutral-600">
            METTLER TOLEDO tiene muchos más modelos que los de este catálogo. Cuéntenos su aplicación y le recomendamos el
            adecuado.
          </p>
          <Link href="/contacto" className="mt-5 inline-block text-sm font-semibold text-ink-900 underline underline-offset-4">
            Consultar a un asesor
          </Link>
        </div>
      )}
    </div>
  );
}
