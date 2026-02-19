import { Hero } from "@/components/sections/Hero";
import { About } from "@/components/sections/About";
import { Products } from "@/components/sections/Products";
import { Services } from "@/components/sections/Services";
import { Certifications } from "@/components/sections/Certifications";
import { Contact } from "@/components/sections/Contact";

export default function Home() {
  return (
    <main className="min-h-screen">
      <Hero />
      <About />
      <Products />
      <Services />
      <Certifications />
      <Contact />
    </main>
  );
}
