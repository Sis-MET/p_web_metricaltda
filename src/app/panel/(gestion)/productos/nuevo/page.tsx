import type { Metadata } from "next";
import { PanelHeader } from "@/components/panel/PanelHeader";
import { Notice } from "@/components/panel/Field";
import { categoryOptions, listProducts } from "@/lib/panel/catalog-admin";
import { requireUser } from "@/lib/panel/session";
import { saveProduct } from "../actions";
import { EMPTY_PRODUCT } from "../form-values";
import { ProductForm } from "../ProductForm";

export const metadata: Metadata = { title: "Nuevo producto" };

export default async function NewProductPage({ searchParams }: { searchParams: Promise<{ categoria?: string }> }) {
  await requireUser();
  const [categories, products, { categoria }] = await Promise.all([categoryOptions(), listProducts(), searchParams]);
  const typeOptions = [...new Set(products.map((product) => product.type))].sort();
  const categoryId = Number(categoria) || null;

  return (
    <>
      <PanelHeader
        title="Nuevo producto"
        description="Puede guardarlo como borrador y completarlo después; al publicarlo aparece en el catálogo, la cotización y el asistente."
        back={{ href: "/panel/productos", label: "Productos" }}
      />
      {categories.length === 0 ? (
        <Notice tone="info">Primero cree una categoría.</Notice>
      ) : (
        <ProductForm
          save={saveProduct.bind(null, null)}
          initial={{ ...EMPTY_PRODUCT, categoryId }}
          categories={categories}
          typeOptions={typeOptions}
        />
      )}
    </>
  );
}
