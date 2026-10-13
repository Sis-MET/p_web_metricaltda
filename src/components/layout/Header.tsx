"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ChevronDown, ClipboardList, Menu, MessageCircle, Phone, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { NAV, QUOTE_HREF, isActivePath, type NavItem } from "@/lib/routes";
import { useQuoteItems } from "@/lib/quote-store";
import { SALES_PHONE, whatsappUrl } from "@/content/company";
import { EASE_OUT } from "@/lib/motion";
import { cn } from "@/lib/utils";

// Altura (px desde arriba) donde se mide qué sección hay detrás de la barra
const HEADER_PROBE_Y = 44;
const CLOSE_DELAY_MS = 150;

// Las páginas empiezan con una cabecera negra, salvo las fichas de producto (fondo claro).
// Sirve para el primer render, antes de poder medir qué hay detrás de la barra.
const LIGHT_TOP = /^\/productos\/[^/]+\/[^/]+$/;

/** Tono de la barra según la sección que tiene detrás (data-header-theme). */
function useHeaderTone(pathname: string) {
  const [tone, setTone] = useState<"dark" | "light">(() => (LIGHT_TOP.test(pathname) ? "light" : "dark"));
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    let frame = 0;

    const update = () => {
      frame = 0;
      setScrolled(window.scrollY > 8);

      let next: "dark" | "light" = "light";
      for (const section of document.querySelectorAll<HTMLElement>("[data-header-theme]")) {
        const rect = section.getBoundingClientRect();
        if (rect.top <= HEADER_PROBE_Y && rect.bottom > HEADER_PROBE_Y) {
          next = section.dataset.headerTheme === "dark" ? "dark" : "light";
          break;
        }
      }
      setTone(next);
    };

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [pathname]);

  return { tone, scrolled };
}

/** Menú desplegable de escritorio: se abre al pasar el mouse o con el botón, y tolera el paso al panel. */
function useDropdown() {
  const [open, setOpen] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const cancel = () => clearTimeout(timer.current);

  useEffect(() => () => clearTimeout(timer.current), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setOpen(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return {
    open,
    show: (key: string) => {
      cancel();
      setOpen(key);
    },
    hide: () => {
      cancel();
      timer.current = setTimeout(() => setOpen(null), CLOSE_DELAY_MS);
    },
    toggle: (key: string) => {
      cancel();
      setOpen((current) => (current === key ? null : key));
    },
    close: () => {
      cancel();
      setOpen(null);
    },
  };
}

const menuId = (item: NavItem) => `menu-${item.href.slice(1)}`;
const isMouse = (event: React.PointerEvent) => event.pointerType === "mouse";

/** Botón de cotizar: muestra cuántos equipos hay en la lista */
function QuoteButton({ className, onNavigate }: { className?: string; onNavigate?: () => void }) {
  const count = useQuoteItems().length;
  return (
    <Button asChild size="sm" variant="brand" className={className}>
      <Link href={QUOTE_HREF} onClick={onNavigate}>
        Solicitar cotización
        {count > 0 && (
          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-ink-950 px-1.5 text-[11px] font-bold tabular-nums text-sun-300">
            {count}
            <span className="sr-only"> {count === 1 ? "producto" : "productos"} en su lista</span>
          </span>
        )}
      </Link>
    </Button>
  );
}

/** Acceso a la lista en pantallas pequeñas, solo si tiene productos */
function QuoteIcon({ isDark }: { isDark: boolean }) {
  const count = useQuoteItems().length;
  if (!count) return null;
  return (
    <Link
      href={QUOTE_HREF}
      aria-label={`Lista de cotización: ${count} ${count === 1 ? "producto" : "productos"}`}
      className={cn(
        "relative flex size-11 items-center justify-center rounded-xl transition-colors sm:hidden",
        isDark ? "text-white hover:bg-white/10" : "text-ink-900 hover:bg-ink-800/[0.06]"
      )}
    >
      <ClipboardList className="size-5" aria-hidden />
      <span className="absolute right-1.5 top-1.5 flex size-4 items-center justify-center rounded-full bg-sun-400 text-[10px] font-bold tabular-nums text-ink-950">
        {count}
      </span>
    </Link>
  );
}

function DirectContact({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-col justify-between rounded-xl bg-ink-950 px-5 py-4 text-white", className)}>
      <div>
        <p className="font-heading text-sm font-bold">¿Necesita asesoría?</p>
        <p className="mt-1 text-[13px] leading-snug text-white/60">Hable directamente con nuestro equipo comercial.</p>
      </div>
      <div className="mt-3 flex flex-col gap-0.5 text-sm">
        <a
          href={whatsappUrl()}
          target="_blank"
          rel="noopener noreferrer"
          className="-mx-2 inline-flex items-center gap-2.5 rounded-lg px-2 py-1.5 transition-colors hover:bg-white/10"
        >
          <MessageCircle className="size-4 text-sun-400" aria-hidden /> WhatsApp
        </a>
        <a
          href={`tel:${SALES_PHONE.number}`}
          className="-mx-2 inline-flex items-center gap-2.5 rounded-lg px-2 py-1.5 transition-colors hover:bg-white/10"
        >
          <Phone className="size-4 text-sun-400" aria-hidden /> {SALES_PHONE.display}
        </a>
      </div>
    </div>
  );
}

/**
 * Anima la altura real del contenido al cambiar de sección. No usa `layout` de Framer Motion:
 * esa animación es un scale y estiraría textos e imágenes durante la transición.
 */
function AutoHeight({ children }: { children: React.ReactNode }) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number | "auto">("auto");

  useEffect(() => {
    const content = contentRef.current;
    if (!content) return;
    const observer = new ResizeObserver(([entry]) => setHeight(entry.borderBoxSize[0].blockSize));
    observer.observe(content);
    return () => observer.disconnect();
  }, []);

  return (
    <motion.div animate={{ height }} transition={{ duration: 0.28, ease: EASE_OUT }} className="overflow-hidden">
      <div ref={contentRef} className="relative">
        {children}
      </div>
    </motion.div>
  );
}

/** Panel de una sección: sus subpáginas y el contacto directo */
function DropdownPanel({ item }: { item: NavItem }) {
  const links = item.children ?? [];
  const hasOverview = !links.some((link) => link.href === item.href);

  return (
    <div className="grid gap-2 lg:grid-cols-[1fr_16rem]">
      <div className="flex flex-col">
        <ul className={cn("grid flex-1 gap-1", links.length > 2 ? "grid-cols-3" : "grid-cols-2")}>
          {links.map(({ href, label, description, image, icon: Icon }) => (
            <li key={href}>
              <Link
                href={href}
                className={cn(
                  "group flex h-full rounded-xl p-3 transition-colors hover:bg-neutral-100",
                  image ? "flex-col" : "items-start gap-3.5 p-4"
                )}
              >
                {image ? (
                  <span className="relative mb-3 block aspect-[16/9] overflow-hidden rounded-lg bg-gradient-to-b from-neutral-100 to-white">
                    <Image
                      src={image}
                      alt=""
                      fill
                      sizes="260px"
                      className="object-contain p-3 transition-transform duration-300 ease-out group-hover:scale-105"
                    />
                  </span>
                ) : (
                  Icon && (
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-neutral-100 text-ink-800 transition-colors group-hover:bg-ink-900 group-hover:text-white">
                      <Icon className="size-[18px]" aria-hidden />
                    </span>
                  )
                )}
                <span className="flex flex-col">
                  <span className="flex items-center gap-1.5 font-heading text-sm font-bold text-ink-950">
                    {label}
                    <ArrowRight
                      className="size-3.5 -translate-x-1 opacity-0 transition-[opacity,transform] duration-200 group-hover:translate-x-0 group-hover:opacity-100"
                      aria-hidden
                    />
                  </span>
                  {description && <span className="mt-1 text-[13px] leading-snug text-neutral-500">{description}</span>}
                </span>
              </Link>
            </li>
          ))}
        </ul>
        {hasOverview && (
          <Link
            href={item.href}
            className="mx-3 mt-2 inline-flex items-center gap-1.5 self-start py-2 text-sm font-semibold text-ink-800 transition-colors hover:text-ink-950"
          >
            Ver todo en {item.label.toLowerCase()} <ArrowRight className="size-4" aria-hidden />
          </Link>
        )}
      </div>
      <DirectContact />
    </div>
  );
}

export function Header() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const dropdown = useDropdown();
  const { tone, scrolled } = useHeaderTone(pathname);

  // Al cambiar de página se cierran los menús
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setMobileOpen(false);
    dropdown.close();
  }

  const openItem = NAV.find((item) => item.href === dropdown.open);
  const isDark = tone === "dark" && !mobileOpen && !openItem;

  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setMobileOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mobileOpen]);

  const toggleMobile = () => {
    setMobileOpen((open) => !open);
    // El acordeón abre la sección de la página actual
    setExpanded(NAV.find((item) => item.children && isActivePath(pathname, item.href))?.href ?? null);
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-4 sm:pt-4">
      {/* Fondo para cerrar el menú móvil al tocar fuera */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            key="backdrop"
            aria-hidden
            onClick={() => setMobileOpen(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 -z-10 bg-ink-950/40 lg:hidden"
          />
        )}
      </AnimatePresence>

      <div onPointerLeave={(event) => isMouse(event) && dropdown.hide()}>
        <div
          className={cn(
            "mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 rounded-2xl border pl-4 pr-2 backdrop-blur-xl backdrop-saturate-150 sm:pl-5",
            "transition-[background-color,border-color,box-shadow] duration-300 ease-out",
            isDark
              ? scrolled
                ? "border-white/10 bg-ink-950/55 shadow-[0_12px_40px_-16px_rgba(0,0,0,0.6)]"
                : "border-white/10 bg-white/[0.06]"
              : "border-ink-950/[0.06] bg-white/85 shadow-[0_12px_40px_-18px_rgba(0,0,0,0.25)]"
          )}
        >
          <Link href="/" aria-label="Métrica, ir al inicio" className="shrink-0 rounded-lg">
            <Image
              src="/images/logo/metrica.png"
              alt="Métrica Ltda."
              width={800}
              height={251}
              sizes="128px"
              preload
              className="h-9 w-auto sm:h-10"
            />
          </Link>

          {/* Navegación de escritorio */}
          <nav aria-label="Principal" className="hidden lg:block">
            <ul className="flex items-center gap-0.5">
              {NAV.map((item) => {
                const isActive = isActivePath(pathname, item.href);
                const isOpen = dropdown.open === item.href;
                const textCls = isDark
                  ? isActive || isOpen
                    ? "text-white"
                    : "text-white/70 hover:text-white"
                  : isActive || isOpen
                    ? "text-ink-900"
                    : "text-neutral-600 hover:text-ink-900";

                return (
                  <li
                    key={item.href}
                    className="relative isolate flex items-center"
                    onPointerEnter={(event) => {
                      if (!isMouse(event)) return;
                      if (item.children) dropdown.show(item.href);
                      else dropdown.close();
                    }}
                  >
                    {isActive && (
                      <motion.span
                        layoutId="nav-pill"
                        aria-hidden
                        className={cn("absolute inset-0 -z-10 rounded-full", isDark ? "bg-white/15" : "bg-ink-800/[0.08]")}
                        transition={{ type: "spring", stiffness: 500, damping: 40 }}
                      />
                    )}
                    <Link
                      href={item.href}
                      aria-current={isActive ? "page" : undefined}
                      className={cn(
                        "block rounded-full py-2 text-sm font-medium transition-colors duration-200",
                        item.children ? "pl-3.5 pr-1" : "px-3.5",
                        textCls
                      )}
                    >
                      {item.label}
                    </Link>
                    {item.children && (
                      <button
                        type="button"
                        aria-expanded={isOpen}
                        aria-controls={menuId(item)}
                        aria-label={`${isOpen ? "Cerrar" : "Abrir"} el menú de ${item.label}`}
                        onClick={() => dropdown.toggle(item.href)}
                        className={cn("flex h-9 items-center rounded-full pl-0.5 pr-3 transition-colors duration-200", textCls)}
                      >
                        <ChevronDown
                          className={cn("size-3.5 transition-transform duration-200", isOpen && "rotate-180")}
                          aria-hidden
                        />
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="flex items-center gap-1 sm:gap-2">
            <QuoteButton className="hidden sm:inline-flex" />
            <QuoteIcon isDark={isDark} />
            <button
              type="button"
              onClick={toggleMobile}
              aria-expanded={mobileOpen}
              aria-controls="menu-movil"
              aria-label={mobileOpen ? "Cerrar menú" : "Abrir menú"}
              className={cn(
                "flex size-11 items-center justify-center rounded-xl transition-colors lg:hidden",
                isDark ? "text-white hover:bg-white/10" : "text-ink-900 hover:bg-ink-800/[0.06]"
              )}
            >
              {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>

        {/* Menú desplegable de escritorio: un solo panel; al cambiar de sección se cruza el contenido y se anima la altura */}
        <AnimatePresence>
          {openItem && (
            <motion.div
              key="menu-desktop"
              id={menuId(openItem)}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6, transition: { duration: 0.12 } }}
              transition={{ duration: 0.2, ease: EASE_OUT }}
              onPointerEnter={(event) => isMouse(event) && dropdown.show(openItem.href)}
              onClick={(event) => (event.target as HTMLElement).closest("a") && dropdown.close()}
              className="mx-auto mt-2 hidden max-w-7xl rounded-2xl border border-ink-950/[0.06] bg-white/95 p-2 shadow-[0_24px_60px_-20px_rgba(0,0,0,0.35)] backdrop-blur-xl lg:block"
            >
              <AutoHeight>
                {/* popLayout saca de flujo el contenido que sale: el que entra define la altura */}
                <AnimatePresence initial={false} mode="popLayout">
                  <motion.div
                    key={openItem.href}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.18, ease: EASE_OUT }}
                  >
                    <DropdownPanel item={openItem} />
                  </motion.div>
                </AnimatePresence>
              </AutoHeight>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Menú móvil */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.nav
            key="menu"
            id="menu-movil"
            aria-label="Principal"
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.2, ease: EASE_OUT }}
            className="mx-auto mt-2 max-h-[calc(100svh-6.5rem)] max-w-7xl origin-top overflow-y-auto rounded-2xl border border-ink-950/[0.06] bg-white/95 p-2 shadow-[0_24px_60px_-20px_rgba(0,0,0,0.35)] backdrop-blur-xl lg:hidden"
          >
            <ul className="flex flex-col">
              {NAV.map((item) => {
                const isActive = isActivePath(pathname, item.href);
                const isExpanded = expanded === item.href;
                const linkCls = cn(
                  "flex flex-1 items-center justify-between rounded-xl px-4 py-3 text-base font-medium transition-colors",
                  isActive ? "text-ink-900" : "text-neutral-700"
                );

                return (
                  <li key={item.href} className={cn("rounded-xl", isActive && "bg-ink-50")}>
                    <div className="flex items-center">
                      <Link href={item.href} onClick={() => setMobileOpen(false)} aria-current={isActive ? "page" : undefined} className={linkCls}>
                        {item.label}
                        {isActive && <span aria-hidden className="size-1.5 rounded-full bg-sun-400 ring-4 ring-sun-400/25" />}
                      </Link>
                      {item.children && (
                        <button
                          type="button"
                          aria-expanded={isExpanded}
                          aria-label={`${isExpanded ? "Ocultar" : "Mostrar"} las opciones de ${item.label}`}
                          onClick={() => setExpanded(isExpanded ? null : item.href)}
                          className="flex size-11 shrink-0 items-center justify-center rounded-xl text-neutral-500 transition-colors hover:bg-neutral-100"
                        >
                          <ChevronDown className={cn("size-4 transition-transform duration-200", isExpanded && "rotate-180")} aria-hidden />
                        </button>
                      )}
                    </div>
                    {item.children && isExpanded && (
                      <ul className="pb-2 pl-4">
                        {item.children.map((link) => (
                          <li key={link.href}>
                            <Link
                              href={link.href}
                              onClick={() => setMobileOpen(false)}
                              aria-current={pathname === link.href ? "page" : undefined}
                              className={cn(
                                "block rounded-lg border-l-2 px-4 py-2.5 text-[15px] transition-colors",
                                pathname === link.href
                                  ? "border-sun-400 font-medium text-ink-900"
                                  : "border-neutral-200 text-neutral-600 hover:text-ink-900"
                              )}
                            >
                              {link.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                );
              })}
            </ul>
            <QuoteButton className="mt-2 h-11 w-full text-sm" onNavigate={() => setMobileOpen(false)} />
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
