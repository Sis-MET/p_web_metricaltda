import { PanelNav } from "@/components/panel/PanelNav";
import { requireUser } from "@/lib/panel/session";

/** Panel con sesión: menú lateral y el contenido de cada sección */
export default async function ManageLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  return (
    <div className="min-h-svh lg:grid lg:grid-cols-[16rem_minmax(0,1fr)]">
      <PanelNav user={user} />
      <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-8 lg:py-10">{children}</main>
    </div>
  );
}
