"use client";

import { useEffect, useLayoutEffect, useRef, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { openDemoDialogs } from "./DemoShell";

const CLOSE_CLASS =
  "absolute right-3 top-3 z-10 flex size-10 items-center justify-center rounded-full border border-white/15 bg-mt-950/85 text-white transition-colors duration-200 hover:border-white/40 hover:bg-mt-800 sm:right-5 sm:top-4 lg:right-8 lg:top-6 [&_svg]:size-5";

/**
 * Demo a pantalla completa en un <dialog> modal: el resto del sitio queda inerte y sin scroll.
 * - `modal`: abierto sobre la página desde un enlace (ruta interceptada); cerrar vuelve atrás.
 * - `page`: la dirección propia del demo (enlace compartido, recarga, Ctrl+clic); cerrar lleva a `exitHref`.
 */
export function DemoDialog({
  mode,
  label,
  exitHref,
  children,
}: {
  mode: "modal" | "page";
  label: string;
  exitHref: string;
  children: ReactNode;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const closing = useRef(false);
  const router = useRouter();

  const close = () => {
    if (closing.current) return;
    closing.current = true;
    if (mode === "modal") router.back();
    else router.push(exitHref);
  };

  // Las escenas de la página quedan tapadas: se pausan mientras el demo está abierto
  useEffect(() => {
    openDemoDialogs.set(openDemoDialogs.get() + 1);
    return () => openDemoDialogs.set(openDemoDialogs.get() - 1);
  }, []);

  // Llega abierto desde el servidor (se ve antes del JavaScript); aquí pasa a modal
  useLayoutEffect(() => {
    const el = dialog.current;
    if (!el || el.matches(":modal")) return;
    el.close();
    el.showModal();
  }, []);

  return (
    <dialog
      ref={dialog}
      open
      aria-label={label}
      onCancel={(event) => {
        event.preventDefault();
        close();
      }}
      // Si el navegador lo cierra por su cuenta (Esc repetido), también se sale del demo.
      // El cierre que hace el paso a modal llega con el diálogo ya abierto y se ignora.
      onClose={() => {
        if (!dialog.current?.open) close();
      }}
      className="fixed inset-0 z-[100] m-0 h-dvh max-h-none w-screen max-w-none overflow-hidden border-0 bg-mt-900 p-0 text-white backdrop:bg-ink-950/70"
    >
      {children}
      {mode === "modal" ? (
        <button type="button" onClick={close} aria-label="Cerrar el demo" title="Cerrar" className={CLOSE_CLASS} data-demo-close>
          <X />
        </button>
      ) : (
        <Link href={exitHref} aria-label="Salir del demo" title="Salir del demo" className={CLOSE_CLASS} data-demo-close>
          <X />
        </Link>
      )}
    </dialog>
  );
}
