import type { Metadata } from "next";
import { PanelHeader } from "@/components/panel/PanelHeader";
import { requireUser } from "@/lib/panel/session";
import { saveCategory } from "../actions";
import { CategoryForm } from "../CategoryForm";

export const metadata: Metadata = { title: "Nueva categoría" };

export default async function NewCategoryPage() {
  await requireUser();
  return (
    <>
      <PanelHeader
        title="Nueva categoría"
        description="Guárdela como borrador hasta tener su imagen y sus textos; al publicarla aparece en el menú. Después de guardarla podrá agregarle líneas."
        back={{ href: "/panel/categorias", label: "Categorías" }}
      />
      <CategoryForm save={saveCategory.bind(null, null)} />
    </>
  );
}
