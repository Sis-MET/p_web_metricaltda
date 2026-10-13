import { Hero } from "@/components/sections/Hero";
import { About } from "@/components/sections/About";
import { ProductLines } from "@/components/sections/ProductLines";
import { Services } from "@/components/sections/Services";
import { TruckScaleDemo } from "@/components/demos/TruckScaleDemo";
import { CtaBand } from "@/components/layout/CtaBand";

/** Inicio: un resumen de cada sección del sitio, con el demo de básculas de camiones como vitrina. */
export default function Home() {
  return (
    <main className="min-h-screen">
      <Hero />
      <About />
      <ProductLines />
      <TruckScaleDemo />
      <Services />
      <CtaBand />
    </main>
  );
}
