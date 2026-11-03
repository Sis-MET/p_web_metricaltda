"use client";

import { useEffect, useState } from "react";
import { ImagePlus } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Imagen de una categoría o un producto: muestra la actual y, al elegir otra, su vista previa.
 * Se guarda al enviar el formulario (en WebP, reducida a 1600 px).
 */
export function ImageField({
  name,
  current,
  error,
}: {
  name: string;
  /** Dirección de la imagen guardada, si tiene */
  current: string | null;
  error?: string;
}) {
  const [preview, setPreview] = useState<string | null>(null);
  useEffect(() => () => (preview ? URL.revokeObjectURL(preview) : undefined), [preview]);
  const shown = preview ?? current;

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div
        className={cn(
          "relative flex aspect-[4/3] w-full shrink-0 items-center justify-center overflow-hidden rounded-2xl border bg-gradient-to-b from-neutral-50 to-white sm:w-56",
          error ? "border-red-400" : "border-neutral-200"
        )}
      >
        {shown ? (
          // Vista previa local (blob:) o el archivo guardado: sin optimizar
          // eslint-disable-next-line @next/next/no-img-element
          <img src={shown} alt="" className="size-full object-contain p-3" />
        ) : (
          <span className="text-xs text-neutral-400">Sin imagen</span>
        )}
      </div>
      <label className="relative inline-flex cursor-pointer items-center gap-2 self-start rounded-full border border-neutral-300 bg-white px-4 py-2 text-sm font-semibold text-ink-900 hover:border-ink-800 sm:self-center">
        <ImagePlus className="size-4" aria-hidden />
        {shown ? "Cambiar imagen" : "Elegir imagen"}
        <input
          type="file"
          name={name}
          accept="image/png,image/jpeg,image/webp,image/avif"
          className="absolute inset-0 cursor-pointer opacity-0"
          onChange={(event) => {
            const file = event.target.files?.[0];
            setPreview(file ? URL.createObjectURL(file) : null);
          }}
        />
      </label>
    </div>
  );
}
