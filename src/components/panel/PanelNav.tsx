"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ArrowUpRight, FolderTree, LayoutDashboard, LogOut, Package, UserRound, Users, type LucideIcon } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { ROLES, type Role } from "@/lib/panel/roles";
import { cn } from "@/lib/utils";

type Item = { href: string; label: string; icon: LucideIcon; adminOnly?: boolean };

const ITEMS: Item[] = [
  { href: "/panel", label: "Resumen", icon: LayoutDashboard },
  { href: "/panel/productos", label: "Productos", icon: Package },
  { href: "/panel/categorias", label: "Categorías", icon: FolderTree },
  { href: "/panel/usuarios", label: "Usuarios", icon: Users, adminOnly: true },
  { href: "/panel/cuenta", label: "Mi cuenta", icon: UserRound },
];

const isActive = (pathname: string, href: string) =>
  href === "/panel" ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);

/** Menú del panel: lateral en escritorio, una fila desplazable en el celular */
export function PanelNav({ user }: { user: { name: string; email: string; role: Role } }) {
  const pathname = usePathname();
  const router = useRouter();
  const items = ITEMS.filter((item) => !item.adminOnly || user.role === "admin");

  async function signOut() {
    await authClient.signOut();
    router.replace("/panel/ingresar");
    router.refresh();
  }

  return (
    <aside className="border-b border-neutral-200 bg-white lg:sticky lg:top-0 lg:flex lg:h-svh lg:flex-col lg:border-b-0 lg:border-r">
      <div className="flex items-center justify-between gap-4 px-4 py-4 lg:block lg:px-6 lg:py-6">
        <Link href="/panel" className="flex items-center gap-3">
          <Image src="/images/logo/metrica.png" alt="Métrica Ltda." width={800} height={251} sizes="120px" className="h-9 w-auto" />
          <span className="font-mono text-[10px] uppercase leading-tight tracking-[0.18em] text-neutral-500">
            Panel del
            <br />
            catálogo
          </span>
        </Link>
        <button
          type="button"
          onClick={signOut}
          className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium text-neutral-600 hover:bg-neutral-100 lg:hidden"
        >
          <LogOut className="size-4" aria-hidden />
          Salir
        </button>
      </div>

      <nav aria-label="Panel" className="overflow-x-auto px-3 pb-3 [scrollbar-width:none] lg:flex-1 lg:overflow-visible lg:px-3 lg:pb-0">
        <ul className="flex gap-1 lg:flex-col">
          {items.map(({ href, label, icon: Icon }) => {
            const active = isActive(pathname, href);
            return (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-3 whitespace-nowrap rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                    active ? "bg-ink-900 text-white" : "text-neutral-700 hover:bg-neutral-100 hover:text-ink-950"
                  )}
                >
                  <Icon className="size-4 shrink-0" aria-hidden />
                  {label}
                </Link>
              </li>
            );
          })}
          <li className="lg:mt-2 lg:border-t lg:border-neutral-200 lg:pt-2">
            <a
              href="/"
              target="_blank"
              rel="noopener"
              className="flex items-center gap-3 whitespace-nowrap rounded-xl px-3 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-100 hover:text-ink-950"
            >
              <ArrowUpRight className="size-4 shrink-0" aria-hidden />
              Ver el sitio
            </a>
          </li>
        </ul>
      </nav>

      <div className="hidden border-t border-neutral-200 px-6 py-5 lg:block">
        <p className="truncate text-sm font-semibold text-ink-950">{user.name}</p>
        <p className="truncate text-xs text-neutral-500">
          {ROLES[user.role].label} · {user.email}
        </p>
        <button
          type="button"
          onClick={signOut}
          className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-neutral-600 hover:text-ink-950"
        >
          <LogOut className="size-4" aria-hidden />
          Salir
        </button>
      </div>
    </aside>
  );
}
