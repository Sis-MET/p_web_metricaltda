import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { PanelHeader } from "@/components/panel/PanelHeader";
import { DeleteButton } from "@/components/panel/RowButtons";
import { productHref } from "@/content/catalog";
import { categoryOptions, getProduct, listCategories, listProducts } from "@/lib/panel/catalog-admin";
import { requireUser } from "@/lib/panel/session";
import { deleteProduct, saveProduct } from "../actions";
import { toFormValues } from "../form-values";
import { ProductForm } from "../ProductForm";

type Props = { params: Promise<{ id: string }> };

export const metadata: Metadata = { title: "Editar producto" };

const dateTime = new Intl.DateTimeFormat("es-BO", { dateStyle: "long", timeStyle: "short", timeZone: "America/La_Paz" });

export default async function EditProductPage({ params }: Props) {
  await requireUser();
  const product = await getProduct(Number((await params).id));
  if (!product) notFound();
  const [categories, allCategories, products] = await Promise.all([categoryOptions(), listCategories(), listProducts()]);
  const typeOptions = [...new Set(products.map((row) => row.type))].sort();
  const category = allCategories.find((row) => row.id === product.categoryId);
  const editor = products.find((row) => row.id === product.id)?.editor;
  const live = product.published && category?.published;

  return (
    <>
      <PanelHeader
        title={product.model}
        description={`Último cambio: ${dateTime.format(product.updatedAt)}${editor ? `, por ${editor}` : ""}.`}
        back={{ href: "/panel/productos", label: "Productos" }}
        actions={
          <>
            {live && category && (
              <a
                href={productHref({ category: category.slug, slug: product.slug })}
                target="_blank"
                rel="noopener"
                className="inline-flex h-9 items-center gap-2 rounded-full border border-neutral-300 bg-white px-4 text-sm font-semibold text-ink-900 hover:border-ink-800"
              >
                <ExternalLink className="size-4" aria-hidden />
                Ver en el sitio
              </a>
            )}
            <DeleteButton
              remove={deleteProduct.bind(null, product.id)}
              confirmText={`¿Eliminar “${product.model}”? Desaparece del catálogo y no se puede deshacer.`}
              label="Eliminar"
            />
          </>
        }
      />
      <ProductForm save={saveProduct.bind(null, product.id)} initial={toFormValues(product)} categories={categories} typeOptions={typeOptions} />
    </>
  );
}
