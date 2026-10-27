import { Loader2 } from "lucide-react";

/**
 * Aviso sobre el visor mientras la escena se descarga y compila; toma el color de texto de la sección.
 * Sin hooks: lo usan los demos y la pantalla de carga del modal (componente del servidor).
 */
export function ViewerPlaceholder() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-sm opacity-60">
      <Loader2 className="size-5 animate-spin" aria-hidden />
      Cargando modelo 3D…
    </div>
  );
}
