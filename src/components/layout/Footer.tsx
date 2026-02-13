import Link from "next/link";
import { Scale, Facebook, Twitter, Instagram, Linkedin } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 py-12 border-t border-slate-800">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          
          <div className="space-y-4">
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-white">
                    <Scale className="w-5 h-5" />
                </div>
                <span className="text-xl font-bold text-white">Metrica</span>
            </div>
            <p className="text-slate-400 text-sm">
              Líderes en soluciones de pesaje industrial y servicios de calibración con más de 20 años de experiencia.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-white mb-4">Enlaces Rápidos</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="#" className="hover:text-blue-400 transition-colors">Inicio</Link></li>
              <li><Link href="#productos" className="hover:text-blue-400 transition-colors">Productos</Link></li>
              <li><Link href="#servicios" className="hover:text-blue-400 transition-colors">Servicios</Link></li>
              <li><Link href="#certificaciones" className="hover:text-blue-400 transition-colors">Certificaciones</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white mb-4">Servicios</h4>
            <ul className="space-y-2 text-sm">
              <li>Mantenimiento Preventivo</li>
              <li>Calibración ONAC</li>
              <li>Automatización Industrial</li>
              <li>Alquiler de Patrones</li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white mb-4">Síguenos</h4>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors text-white">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center hover:bg-blue-400 transition-colors text-white">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center hover:bg-pink-600 transition-colors text-white">
                <Instagram className="w-5 h-5" />
              </a>
               <a href="#" className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors text-white">
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
        
        <div className="pt-8 border-t border-slate-800 text-center text-xs text-slate-500">
          © {new Date().getFullYear()} Metrica SAS. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  );
}
