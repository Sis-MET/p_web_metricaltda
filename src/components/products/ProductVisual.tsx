import Image from "next/image";
import type { CatalogImage } from "@/content/catalog";
import { cn } from "@/lib/utils";

/** Imagen de producto recortada sobre un foco de luz, para las cabeceras oscuras. */
export function ProductVisual({
  image,
  alt,
  preload,
  className,
}: {
  image: CatalogImage;
  alt: string;
  preload?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("relative aspect-[4/3] w-full", className)}>
      <div aria-hidden className="absolute inset-[8%] rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.14),transparent_68%)]" />
      <div aria-hidden className="absolute inset-x-[18%] bottom-[8%] h-[10%] rounded-[50%] bg-black/60 blur-2xl" />
      <Image
        src={image.src}
        alt={alt}
        fill
        preload={preload}
        sizes="(min-width: 1024px) 480px, 90vw"
        className="object-contain drop-shadow-[0_24px_40px_rgba(0,0,0,0.45)]"
      />
    </div>
  );
}
