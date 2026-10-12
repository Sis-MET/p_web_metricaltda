import { TruckScaleDemo } from "@/components/demos/TruckScaleDemo";
import { BenchScaleDemo } from "@/components/demos/BenchScaleDemo";

/**
 * Productos: un demo 3D a pantalla completa por producto.
 * El contenedor lleva el id "productos" para el menú y su indicador de sección activa.
 */
export function Products() {
  return (
    <div id="productos">
      <TruckScaleDemo />
      <BenchScaleDemo />
    </div>
  );
}
