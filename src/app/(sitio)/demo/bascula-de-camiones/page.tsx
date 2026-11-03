import type { Metadata } from "next";
import { Vts200DemoDialog } from "@/components/demos/Vts200Demo";
import { DEMO_HREF, DEMO_TITLE } from "@/content/truckScaleProject";

export const metadata: Metadata = {
  title: DEMO_TITLE,
  description:
    "Recorra en 3D el proyecto de instalación de una báscula camionera METTLER TOLEDO VTS200 que ejecuta Métrica: preparación del terreno, zapatas, sistema pluvial, muros y montaje.",
  alternates: { canonical: DEMO_HREF },
};

/** Dirección propia del demo: enlace compartido, recarga o Ctrl+clic en "Ver demo 3D" */
export default function TruckScaleDemoPage() {
  return <Vts200DemoDialog mode="page" />;
}
