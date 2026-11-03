import { Hero } from "@/components/sections/Hero";
import { About } from "@/components/sections/About";
import { Services } from "@/components/sections/Services";
import { WeighingDemo } from "@/components/demos/WeighingDemo";
import { ProductLines } from "@/components/sections/ProductLines";
import { CtaBand } from "@/components/layout/CtaBand";

/** Inicio: un resumen de cada sección del sitio, con la báscula de camiones como vitrina. */
export default function Home() {
  return (
    <main className="min-h-screen">
      <Hero />
      <About />
      <Services />
      <WeighingDemo />
      <ProductLines />
      <CtaBand />
    </main>
  );
}
