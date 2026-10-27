import { ViewerPlaceholder } from "@/components/demos/ViewerPlaceholder";

/** Mientras llega el código del demo, la pantalla ya lo cubre todo: el clic responde al instante */
export default function DemoLoading() {
  return (
    <div className="fixed inset-0 z-[100] bg-mt-900 text-white">
      <ViewerPlaceholder />
    </div>
  );
}
