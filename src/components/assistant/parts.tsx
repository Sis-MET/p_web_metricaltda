"use client";

import { Fragment } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { AddToQuoteButton } from "@/components/products/AddToQuoteButton";
import { whatsappUrl } from "@/content/company";
import type { AssistantHandoff, AssistantSuggestion } from "@/lib/assistant/tools";
import { formDrafts } from "@/lib/form-drafts";
import { quote } from "@/lib/quote-store";

/* ─── Texto del asesor ──────────────────────────────────────────────────── */

const BULLET = /^(?:[-*•]|(\d+)[.)])\s+/;

type Block = { kind: "p" | "ul" | "ol"; lines: string[] };

/** Párrafos y listas del texto del modelo (lo único que se le permite además de **negrita**) */
function toBlocks(text: string) {
  const blocks: Block[] = [];
  let current: Block | undefined;
  for (const raw of text.split("\n")) {
    const line = raw.trim();
    if (!line) {
      current = undefined;
      continue;
    }
    const bullet = BULLET.exec(line);
    const kind = bullet ? (bullet[1] ? "ol" : "ul") : "p";
    if (current?.kind !== kind) {
      current = { kind, lines: [] };
      blocks.push(current);
    }
    current.lines.push(bullet ? line.slice(bullet[0].length) : line);
  }
  return blocks;
}

const inline = (line: string) =>
  line.split(/(\*\*[^*]+\*\*)/g).map((chunk, i) =>
    chunk.length > 4 && chunk.startsWith("**") && chunk.endsWith("**") ? (
      <strong key={i} className="font-semibold text-ink-950">
        {chunk.slice(2, -2)}
      </strong>
    ) : (
      chunk
    )
  );

export function RichText({ text }: { text: string }) {
  return (
    <div className="max-w-[92%] space-y-2 rounded-2xl rounded-bl-md bg-neutral-100 px-3.5 py-2.5 text-[15px] leading-relaxed text-ink-800">
      {toBlocks(text).map(({ kind, lines }, i) => {
        if (kind === "p")
          return (
            <p key={i}>
              {lines.map((line, j) => (
                <Fragment key={j}>
                  {j > 0 && <br />}
                  {inline(line)}
                </Fragment>
              ))}
            </p>
          );
        const List = kind;
        return (
          <List key={i} className={`space-y-1 pl-5 ${kind === "ol" ? "list-decimal" : "list-disc"} marker:text-neutral-400`}>
            {lines.map((line, j) => (
              <li key={j}>{inline(line)}</li>
            ))}
          </List>
        );
      })}
    </div>
  );
}

/* ─── Equipos recomendados ──────────────────────────────────────────────── */

export function ProductSuggestions({ products }: { products: AssistantSuggestion[] }) {
  return (
    <ul className="space-y-2" aria-label="Equipos recomendados">
      {products.map((product) => (
        <li
          key={product.slug}
          className="flex gap-3 rounded-2xl border border-neutral-200 bg-white p-3 shadow-[0_12px_28px_-22px_rgba(0,0,0,0.45)]"
        >
          <Link
            href={product.href}
            tabIndex={-1}
            aria-hidden
            className="relative size-[4.5rem] shrink-0 overflow-hidden rounded-xl bg-gradient-to-b from-neutral-100 to-white"
          >
            <Image src={product.image.src} alt="" fill sizes="72px" className="object-contain p-1.5" />
          </Link>
          <div className="min-w-0 flex-1">
            <Link href={product.href} className="font-heading text-sm font-bold text-ink-950 hover:underline">
              {product.title}
            </Link>
            {product.specs && <p className="text-xs text-neutral-500">{product.specs}</p>}
            {product.reason && <p className="mt-1.5 text-[13px] leading-snug text-neutral-700">{product.reason}</p>}
            <div className="mt-2.5 flex items-center gap-3">
              <AddToQuoteButton slug={product.slug} model={product.model} variant="compact" />
              <Link href={product.href} className="text-xs font-semibold text-mt-700 underline-offset-4 hover:underline">
                Ver ficha
              </Link>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}

/* ─── Siguiente paso ────────────────────────────────────────────────────── */

/** Lleva al formulario con el resumen escrito y, en la cotización, los equipos en la lista */
export function HandoffCard({ handoff }: { handoff: AssistantHandoff }) {
  const { form, href, label, summary, products } = handoff;
  const prepare = () => {
    formDrafts.set(form, summary);
    products.forEach(({ slug, qty }) => {
      quote.add(slug);
      quote.setQty(slug, qty);
    });
  };
  const whatsappText = [summary, ...products.map(({ qty, title }) => `• ${qty} × ${title}`)].join("\n");

  return (
    <div className="rounded-2xl border border-mt-200 bg-mt-50 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-mt-700">Siguiente paso</p>
      <p className="mt-1 text-sm text-ink-800">
        Abrimos el formulario con este resumen
        {products.length > 0 && " y los equipos en su lista de cotización"}: solo complete sus datos.
      </p>
      <blockquote className="mt-3 line-clamp-5 whitespace-pre-line border-l-2 border-mt-300 pl-3 text-[13px] leading-snug text-neutral-700">
        {summary}
      </blockquote>
      {products.length > 0 && (
        <p className="mt-2 text-xs text-neutral-600">
          Equipos: {products.map(({ qty, model }) => `${qty} × ${model}`).join(", ")}
        </p>
      )}
      <div className="mt-3 flex flex-wrap gap-2">
        <Button asChild size="sm">
          <Link href={href} onClick={prepare}>
            {label} <ArrowRight />
          </Link>
        </Button>
        <Button asChild size="sm" variant="outline">
          <a href={whatsappUrl(whatsappText)} target="_blank" rel="noopener noreferrer">
            <MessageCircle /> WhatsApp
          </a>
        </Button>
      </div>
    </div>
  );
}
