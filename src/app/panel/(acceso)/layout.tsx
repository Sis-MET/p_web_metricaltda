import Image from "next/image";
import Link from "next/link";

/** Ingreso, contraseña y configuración inicial: una tarjeta centrada con la marca */
export default function AccessLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <Image src="/images/logo/metrica.png" alt="Métrica Ltda." width={800} height={251} sizes="160px" className="h-12 w-auto" preload />
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-neutral-500">Panel del catálogo</p>
        </div>
        <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-[0_24px_60px_-32px_rgba(0,0,0,0.35)] sm:p-8">{children}</div>
        <p className="mt-6 text-center text-sm text-neutral-500">
          <Link href="/" className="font-medium text-ink-800 underline-offset-4 hover:underline">
            Volver al sitio
          </Link>
        </p>
      </div>
    </main>
  );
}
