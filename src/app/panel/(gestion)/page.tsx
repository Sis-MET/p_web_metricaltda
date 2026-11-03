import type { Metadata } from "next";
import Link from "next/link";
import { FolderPlus, PackagePlus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { PanelHeader, StatusBadge } from "@/components/panel/PanelHeader";
import { listCategories, listProducts, recentChanges } from "@/lib/panel/catalog-admin";
import { requireUser } from "@/lib/panel/session";

export const metadata: Metadata = { title: "Resumen" };

const dateTime = new Intl.DateTimeFormat("es-BO", { dateStyle: "medium", timeStyle: "short", timeZone: "America/La_Paz" });

export default async function DashboardPage() {
  const user = await requireUser();
  const [categories, products, recent] = await Promise.all([listCategories(), listProducts(), recentChanges()]);
  const published = products.filter((product) => product.published).length;

  const stats = [
    { label: "Categorías publicadas", value: categories.filter((category) => category.published).length, total: categories.length },
    { label: "Productos publicados", value: published, total: products.length },
    { label: "Borradores", value: products.length - published },
  ];

  return (
    <>
      <PanelHeader
        title={`Hola, ${user.name.split(" ")[0]}`}
        description="Desde aquí administra las categorías y los productos que muestra el sitio. Los cambios publicados se ven al instante."
        actions={
          <>
            <Button asChild variant="outline" size="sm">
              <Link href="/panel/categorias/nueva">
                <FolderPlus /> Nueva categoría
              </Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/panel/productos/nuevo">
                <PackagePlus /> Nuevo producto
              </Link>
            </Button>
          </>
        }
      />

      <dl className="grid gap-4 sm:grid-cols-3">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-neutral-200 bg-white p-5">
            <dt className="text-sm text-neutral-500">{stat.label}</dt>
            <dd className="mt-2 font-heading text-3xl font-extrabold text-ink-950">
              {stat.value}
              {stat.total !== undefined && <span className="ml-1.5 text-base font-semibold text-neutral-400">de {stat.total}</span>}
            </dd>
          </div>
        ))}
      </dl>

      <section className="mt-10">
        <h2 className="font-heading text-lg font-bold text-ink-950">Últimos cambios</h2>
        {recent.length === 0 ? (
          <p className="mt-3 text-sm text-neutral-600">Todavía no hay productos.</p>
        ) : (
          <ul className="mt-3 divide-y divide-neutral-200 overflow-hidden rounded-2xl border border-neutral-200 bg-white">
            {recent.map((item) => (
              <li key={item.id}>
                <Link href={`/panel/productos/${item.id}`} className="flex flex-wrap items-center gap-x-4 gap-y-1 px-5 py-3.5 hover:bg-neutral-50">
                  <span className="font-semibold text-ink-950">{item.model}</span>
                  <StatusBadge published={item.published} />
                  <span className="ml-auto text-xs text-neutral-500">
                    {dateTime.format(item.updatedAt)}
                    {item.editor && ` · ${item.editor}`}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
