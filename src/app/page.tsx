import { Hero } from "@/components/sections/Hero";
import { About } from "@/components/sections/About";
import { ProductLines } from "@/components/sections/ProductLines";
import { Services } from "@/components/sections/Services";
import { TruckScaleProject } from "@/components/sections/TruckScaleProject";
import { CtaBand } from "@/components/layout/CtaBand";

/** Inicio: un resumen de cada sección del sitio, con el proyecto de la báscula camionera como vitrina. */
export default function Home() {
  return (
    <main className="min-h-screen">
      <Hero />
      <About />
      <ProductLines />
      <TruckScaleProject />
      <Services />
      <CtaBand />
    </main>
  );
}
