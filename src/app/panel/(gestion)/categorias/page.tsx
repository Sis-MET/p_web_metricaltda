import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink, FolderPlus, Pencil } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Notice } from "@/components/panel/Field";
import { PanelHeader, StatusBadge } from "@/components/panel/PanelHeader";
import { MoveButtons } from "@/components/panel/RowButtons";
import { categoryHref } from "@/content/catalog";
import { imageUrl, listCategories } from "@/lib/panel/catalog-admin";
import { requireUser } from "@/lib/panel/session";
import { moveCategory } from "./actions";

export const metadata: Metadata = { title: "Categorías" };

export default async function CategoriesPage({ searchParams }: { searchParams: Promise<{ guardado?: string }> }) {
  await requireUser();
  const [categories, { guardado }] = await Promise.all([listCategories(), searchParams]);

  return (
    <>
      <PanelHeader
        title="Categorías"
        description="Los tipos de producto del menú y del catálogo, en este orden. Cada una puede tener líneas (por ejemplo, “Plataformas de pesaje”) para filtrar sus productos."
        actions={
          <Button asChild size="sm">
            <Link href="/panel/categorias/nueva">
              <FolderPlus /> Nueva categoría
            </Link>
          </Button>
        }
      />
      {guardado && (
        <Notice tone="ok" className="mb-6">
          Se guardó “{guardado}”.
        </Notice>
      )}

      <ul className="divide-y divide-neutral-200 overflow-hidden rounded-2xl border border-neutral-200 bg-white">
        {categories.map((category, i) => {
          const image = imageUrl(category.image);
          return (
            <li key={category.id} className="flex flex-wrap items-center gap-4 px-4 py-3 sm:flex-nowrap sm:px-5">
              <div className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-neutral-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {image && <img src={image} alt="" className="size-full object-contain p-1" />}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Link href={`/panel/categorias/${category.id}`} className="font-semibold text-ink-950 hover:underline">
                    {category.name}
                  </Link>
                  <StatusBadge published={category.published} />
                </div>
                <p className="mt-0.5 text-xs text-neutral-500">
                  {category.productCount} {category.productCount === 1 ? "producto" : "productos"}
                  {category.lines.length > 0 && ` · Líneas: ${category.lines.map((line) => line.name).join(", ")}`}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <MoveButtons
                  move={moveCategory.bind(null, category.id)}
                  first={i === 0}
                  last={i === categories.length - 1}
                  label={category.name}
                />
                {category.published && (
                  <a
                    href={categoryHref(category.slug)}
                    target="_blank"
                    rel="noopener"
                    className="flex size-9 items-center justify-center rounded-lg text-neutral-500 hover:bg-neutral-100 hover:text-ink-950"
                    aria-label={`Ver ${category.name} en el sitio`}
                  >
                    <ExternalLink className="size-4" />
                  </a>
                )}
                <Link
                  href={`/panel/categorias/${category.id}`}
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
    </>
  );
}
