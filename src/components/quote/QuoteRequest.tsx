"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ClipboardList, MessageCircle, Minus, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { SiteForm } from "@/components/forms/SiteForm";
import { productHref, productTitle, type ProductSummary } from "@/content/catalog";
import { whatsappUrl } from "@/content/company";
import { MAX_QTY } from "@/lib/quote";
import { quote, useQuoteItems } from "@/lib/quote-store";

function QtyStepper({ slug, qty, model }: { slug: string; qty: number; model: string }) {
  const btn =
    "flex size-8 items-center justify-center rounded-full text-ink-800 transition-colors hover:bg-neutral-100 disabled:opacity-30 [&_svg]:size-3.5";
  return (
    <div className="inline-flex items-center rounded-full border border-neutral-200 bg-white p-0.5">
      <button type="button" className={btn} onClick={() => quote.setQty(slug, qty - 1)} disabled={qty <= 1} aria-label={`Una unidad menos de ${model}`}>
        <Minus aria-hidden />
      </button>
      <input
        type="number"
        inputMode="numeric"
        min={1}
        max={MAX_QTY}
        value={qty}
        onChange={(event) => quote.setQty(slug, Number(event.target.value))}
        aria-label={`Cantidad de ${model}`}
        className="w-10 bg-transparent text-center font-mono text-sm font-semibold tabular-nums text-ink-950 outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
      />
      <button type="button" className={btn} onClick={() => quote.setQty(slug, qty + 1)} disabled={qty >= MAX_QTY} aria-label={`Una unidad más de ${model}`}>
        <Plus aria-hidden />
      </button>
    </div>
  );
}

/** Mensaje de WhatsApp con la lista completa, para quien prefiere cotizar por chat */
const whatsappText = (lines: { qty: number; product: ProductSummary }[]) =>
  ["Hola, quisiera una cotización de:", ...lines.map(({ qty, product }) => `• ${qty} × ${productTitle(product)}`)].join("\n");

/** Lista de cotización (guardada en el navegador) y formulario para enviarla. */
export function QuoteRequest({ products }: { products: ProductSummary[] }) {
  const items = useQuoteItems();
  const [sent, setSent] = useState(false);

  // Los productos que ya no existen en el catálogo simplemente no se muestran
  const lines = items.flatMap((item) => {
    const product = products.find((p) => p.slug === item.slug);
    return product ? [{ ...item, product }] : [];
  });

  return (
    <div className="grid items-start gap-8 lg:grid-cols-12">
      {/* ── Lista ── */}
      <section aria-labelledby="lista-titulo" className="lg:sticky lg:top-28 lg:col-span-5">
        <div className="rounded-[2rem] border border-neutral-200 bg-white p-5 sm:p-6">
          <div className="flex items-center justify-between gap-4">
            <h2 id="lista-titulo" className="flex items-center gap-2.5 font-heading text-lg font-bold text-ink-950">
              <ClipboardList className="size-5 text-ink-700" aria-hidden />
              Su lista
            </h2>
            {lines.length > 0 && (
              <span className="text-sm text-neutral-500">
                {lines.length} {lines.length === 1 ? "producto" : "productos"}
              </span>
            )}
          </div>

          {lines.length > 0 ? (
            <>
              <ul className="mt-5 divide-y divide-neutral-200 border-y border-neutral-200">
                {lines.map(({ slug, qty, product }) => (
                  <li key={slug} className="flex items-center gap-4 py-4">
                    <Link
                      href={productHref(product)}
                      className="relative size-16 shrink-0 overflow-hidden rounded-xl bg-gradient-to-b from-neutral-100 to-white"
                    >
                      <Image src={product.image} alt="" fill sizes="64px" className="object-contain p-1.5" />
                    </Link>
                    <div className="min-w-0 flex-1">
                      <Link href={productHref(product)} className="block truncate font-heading text-sm font-bold text-ink-950 hover:underline">
                        {product.model}
                      </Link>
                      <p className="truncate text-xs text-neutral-500">{product.type}</p>
                      <div className="mt-2 flex items-center gap-2">
                        <QtyStepper slug={slug} qty={qty} model={product.model} />
                        <button
                          type="button"
                          onClick={() => quote.remove(slug)}
                          aria-label={`Quitar ${product.model} de la lista`}
                          className="flex size-8 items-center justify-center rounded-full text-neutral-400 transition-colors hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 className="size-4" aria-hidden />
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                <Link href="/productos" className="text-sm font-semibold text-ink-800 underline-offset-4 hover:underline">
                  Agregar más productos
                </Link>
                <Button asChild variant="outline" size="sm">
                  <a href={whatsappUrl(whatsappText(lines))} target="_blank" rel="noopener noreferrer">
                    <MessageCircle /> Enviar por WhatsApp
                  </a>
                </Button>
              </div>
            </>
          ) : (
            <div className="mt-5 rounded-2xl border border-dashed border-neutral-300 px-5 py-8 text-center">
              <p className="text-sm text-neutral-600">
                {sent
                  ? "Su lista se envió con la solicitud."
                  : "Su lista está vacía. Agregue equipos desde el catálogo o describa lo que necesita en el formulario."}
              </p>
              <Button asChild variant="outline" size="sm" className="mt-5">
                <Link href="/productos">
                  Ver productos <ArrowRight />
                </Link>
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* ── Datos de contacto ── */}
      <section aria-labelledby="datos-titulo" className="lg:col-span-7">
        <div className="rounded-[2rem] border border-neutral-200 bg-white p-6 shadow-[0_32px_64px_-40px_rgba(0,0,0,0.3)] sm:p-8">
          <h2 id="datos-titulo" className="font-heading text-lg font-bold text-ink-950">
            Sus datos
          </h2>
          <p className="mt-1 text-sm text-neutral-500">Le enviaremos la cotización a su correo.</p>
          <SiteForm
            id="cotizacion"
            className="mt-6"
            onSuccess={() => {
              quote.clear();
              setSent(true);
            }}
          />
        </div>
      </section>
    </div>
  );
}
