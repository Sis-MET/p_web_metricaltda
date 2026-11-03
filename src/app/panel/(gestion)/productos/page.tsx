import type { Metadata } from "next";
import Link from "next/link";
import { PackagePlus, Pencil, Search } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/forms/Select";
import { controlCls } from "@/components/forms/styles";
import { Notice } from "@/components/panel/Field";
import { PanelHeader, StatusBadge } from "@/components/panel/PanelHeader";
import { MoveButtons } from "@/components/panel/RowButtons";
import { imageUrl, listCategories, listProducts } from "@/lib/panel/catalog-admin";
import { requireUser } from "@/lib/panel/session";
import { cn } from "@/lib/utils";
import { moveProduct } from "./actions";

export const metadata: Metadata = { title: "Productos" };

type Filters = { categoria?: string; estado?: string; q?: string; guardado?: string };

const dateTime = new Intl.DateTimeFormat("es-BO", { dateStyle: "short", timeStyle: "short", timeZone: "America/La_Paz" });

/** Enlace que conserva los demás filtros */
const withFilter = (filters: Filters, change: Partial<Filters>) => {
  const params = new URLSearchParams(
    Object.entries({ ...filters, ...change, guardado: undefined }).filter((entry): entry is [string, string] => Boolean(entry[1]))
  );
  const query = params.toString();
  return query ? `/panel/productos?${query}` : "/panel/productos";
};

export default async function ProductsPage({ searchParams }: { searchParams: Promise<Filters> }) {
  await requireUser();
  const [filters, categories, products] = await Promise.all([searchParams, listCategories(), listProducts()]);
  const categoryId = Number(filters.categoria) || null;
  const query = filters.q?.trim().toLowerCase() ?? "";

  const visible = products.filter(
    (product) =>
      (!categoryId || product.categoryId === categoryId) &&
      (filters.estado !== "publicados" || product.published) &&
      (filters.estado !== "borradores" || !product.published) &&
      (!query || `${product.model} ${product.type} ${product.slug}`.toLowerCase().includes(query))
  );
  // Ordenar tiene sentido dentro de una categoría y sin otros filtros
  const sortable = Boolean(categoryId) && !query && !filters.estado;

  const tab = (active: boolean) =>
    cn(
      "whitespace-nowrap rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors",
      active ? "bg-ink-900 text-white" : "text-neutral-700 hover:bg-white"
    );

  return (
    <>
      <PanelHeader
        title="Productos"
        description="Elija una categoría para ver sus productos en el orden del catálogo y cambiarlo."
        actions={
          <Button asChild size="sm">
            <Link href={categoryId ? `/panel/productos/nuevo?categoria=${categoryId}` : "/panel/productos/nuevo"}>
              <PackagePlus /> Nuevo producto
            </Link>
          </Button>
        }
      />
      {filters.guardado && (
        <Notice tone="ok" className="mb-6">
          Se guardó “{filters.guardado}”.
        </Notice>
      )}

      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <nav aria-label="Categorías" className="-mx-1 flex gap-1 overflow-x-auto px-1 [scrollbar-width:none]">
          <Link href={withFilter(filters, { categoria: undefined })} className={tab(!categoryId)}>
            Todas
          </Link>
          {categories.map((category) => (
            <Link key={category.id} href={withFilter(filters, { categoria: String(category.id) })} className={tab(categoryId === category.id)}>
              {category.name}
            </Link>
          ))}
        </nav>
        <form className="flex gap-2" action="/panel/productos">
          {categoryId && <input type="hidden" name="categoria" value={categoryId} />}
          <div className="w-40">
            <Select
              id="estado"
              name="estado"
              label="Estado"
              defaultValue={filters.estado ?? ""}
              options={[
                { value: "", label: "Todos" },
                { value: "publicados", label: "Publicados" },
                { value: "borradores", label: "Borradores" },
              ]}
              className={cn(controlCls(), "h-10")}
            />
          </div>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-neutral-400" aria-hidden />
            <input name="q" defaultValue={filters.q} placeholder="Buscar modelo" aria-label="Buscar modelo" className={cn(controlCls(), "h-10 w-48 pl-9")} />
          </div>
          <Button type="submit" variant="outline" size="sm" className="h-10">
            Filtrar
          </Button>
        </form>
      </div>

      {visible.length === 0 ? (
        <Notice tone="info">No hay productos con esos filtros.</Notice>
      ) : (
        <ul className="divide-y divide-neutral-200 overflow-hidden rounded-2xl border border-neutral-200 bg-white">
          {visible.map((product, i) => {
            const image = imageUrl(product.image);
            return (
              <li key={product.id} className="flex flex-wrap items-center gap-4 px-4 py-3 sm:flex-nowrap sm:px-5">
                <div className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-neutral-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {image && <img src={image} alt="" loading="lazy" className="size-full object-contain p-1" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link href={`/panel/productos/${product.id}`} className="font-semibold text-ink-950 hover:underline">
                      {product.model}
                    </Link>
                    <StatusBadge published={product.published} />
                  </div>
                  <p className="mt-0.5 truncate text-xs text-neutral-500">
                    {product.type} · {product.category}
                    {product.line && ` · ${product.line}`}
                  </p>
                </div>
                <p className="hidden shrink-0 text-right text-xs text-neutral-500 md:block">
                  {dateTime.format(product.updatedAt)}
                  {product.editor && (
                    <>
                      <br />
                      {product.editor}
                    </>
                  )}
                </p>
                <div className="flex items-center gap-1">
                  {sortable && (
                    <MoveButtons move={moveProduct.bind(null, product.id)} first={i === 0} last={i === visible.length - 1} label={product.model} />
                  )}
                  <Link
                    href={`/panel/productos/${product.id}`}
                    className="inline-flex h-9 items-center gap-1.5 rounded-full border border-neutral-300 px-3.5 text-sm font-semibold text-ink-900 hover:border-ink-800"
                  >
                    <Pencil className="size-3.5" aria-hidden />
                    Editar
                  </Link>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
