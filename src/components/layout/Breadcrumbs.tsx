import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { JsonLd } from "@/components/seo/JsonLd";
import { SITE_URL } from "@/content/company";
import type { NavLink } from "@/lib/routes";
import { cn } from "@/lib/utils";

/** Ruta de la página desde el inicio; el último elemento es la página actual. */
export function Breadcrumbs({ trail, tone = "dark" }: { trail: NavLink[]; tone?: "dark" | "light" }) {
  const items = [{ label: "Inicio", href: "/" }, ...trail];
  const dark = tone === "dark";

  return (
    <nav aria-label="Ruta de navegación">
      <ol className={cn("flex flex-wrap items-center gap-1.5 text-xs font-medium", dark ? "text-white/50" : "text-neutral-500")}>
        {items.map((item, i) => {
          const isLast = i === items.length - 1;
          return (
            <li key={item.href} className="inline-flex items-center gap-1.5">
              {isLast ? (
                <span aria-current="page" className={dark ? "text-white/85" : "text-ink-900"}>
                  {item.label}
                </span>
              ) : (
                <>
                  <Link href={item.href} className={cn("transition-colors", dark ? "hover:text-white" : "hover:text-ink-900")}>
                    {item.label}
                  </Link>
                  <ChevronRight className="size-3 opacity-60" aria-hidden />
                </>
              )}
            </li>
          );
        })}
      </ol>
      <JsonLd
        data={{
          "@type": "BreadcrumbList",
          itemListElement: items.map((item, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: item.label,
            item: `${SITE_URL}${item.href === "/" ? "" : item.href}`,
          })),
        }}
      />
    </nav>
  );
}
