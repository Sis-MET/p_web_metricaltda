import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Field } from "@/components/panel/Field";
import { PanelHeader } from "@/components/panel/PanelHeader";
import { DeleteButton } from "@/components/panel/RowButtons";
import { getCategory, imageUrl } from "@/lib/panel/catalog-admin";
import { requireUser } from "@/lib/panel/session";
import { addLine, deleteCategory, deleteLine, moveLine, renameLine, saveCategory } from "../actions";
import { CategoryForm } from "../CategoryForm";
import { LinesEditor } from "../LinesEditor";

type Props = { params: Promise<{ id: string }> };

export const metadata: Metadata = { title: "Editar categoría" };

export default async function EditCategoryPage({ params }: Props) {
  await requireUser();
  const category = await getCategory(Number((await params).id));
  if (!category) notFound();

  return (
    <>
      <PanelHeader
        title={category.name}
        back={{ href: "/panel/categorias", label: "Categorías" }}
        actions={
          <DeleteButton
            remove={deleteCategory.bind(null, category.id)}
            confirmText={`¿Eliminar la categoría “${category.name}”? No se puede deshacer.`}
            label="Eliminar categoría"
          />
        }
      />

      <section className="mb-8 rounded-2xl border border-neutral-200 bg-white p-5 sm:p-6">
        <Field label="Líneas" hint="Agrupan los productos de la categoría y se usan como filtro en su página. Se guardan al momento.">
          <LinesEditor
            lines={category.lines.map(({ id, name }) => ({ id, name }))}
            add={addLine.bind(null, category.id)}
            rename={renameLine}
            remove={deleteLine}
            move={moveLine.bind(null, category.id)}
          />
        </Field>
      </section>

      <CategoryForm
        save={saveCategory.bind(null, category.id)}
        initial={{
          name: category.name,
          slug: category.slug,
          short: category.short,
          description: category.description,
          image: imageUrl(category.image),
          highlights: category.highlights,
          demo: category.demo,
          published: category.published,
        }}
      />
    </>
  );
}
