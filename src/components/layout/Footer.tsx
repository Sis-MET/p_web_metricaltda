import Link from "next/link";
import { Facebook, Instagram, Linkedin, MapPin, Phone, Mail } from "lucide-react";

export function Footer() {
  return (
    <footer className="text-white" style={{ backgroundColor: "#04376e" }}>

      {/* ── Main grid ── */}
      <div className="container mx-auto px-6 lg:px-16 py-14">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* ── Col 1: Brand ── */}
          <div className="lg:col-span-1 flex flex-col gap-5">
            <img
              src="/images/logo/logo_metrica_white.svg"
              alt="Métrica"
              className="h-10 w-auto object-contain object-left"
              draggable={false}
            />
            <p className="text-sm text-white/50 leading-relaxed">
              Líderes en soluciones de pesaje industrial y servicios
              de calibración acreditada en Bolivia.
            </p>

            {/* Social */}
            <div className="flex gap-3 mt-auto">
              {[
                { href: "#", Icon: Facebook,  label: "Facebook",  hover: "hover:bg-blue-600" },
                { href: "#", Icon: Instagram, label: "Instagram", hover: "hover:bg-pink-600" },
                { href: "#", Icon: Linkedin,  label: "LinkedIn",  hover: "hover:bg-blue-700" },
              ].map(({ href, Icon, label, hover }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className={`w-9 h-9 rounded-full bg-white/10 flex items-center justify-center transition-colors duration-200 ${hover}`}
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* ── Col 2: Oficinas ── */}
          <div className="flex flex-col gap-6">
            <h4 className="text-xs font-bold tracking-widest uppercase text-white">
              Oficinas
            </h4>

            {/* La Paz */}
            <div className="flex gap-3">
              <MapPin className="w-4 h-4 text-[#f9e300] shrink-0 mt-0.5" />
              <div className="text-sm text-white/70 leading-relaxed space-y-0.5">
                <p className="font-semibold text-white">La Paz</p>
                <p>Calle Fernando Guachalla</p>
                <p>Pje. Gral. Donato Cardozo #715-B</p>
                <p>Zona Sopocachi</p>
              </div>
            </div>

            {/* Santa Cruz */}
            <div className="flex gap-3">
              <MapPin className="w-4 h-4 text-[#f9e300] shrink-0 mt-0.5" />
              <div className="text-sm text-white/70 leading-relaxed space-y-0.5">
                <p className="font-semibold text-white">Santa Cruz</p>
                <p>Calle Prolongación Mutualista</p>
                <p>Entre 6to y 7mo Anillo #6170</p>
              </div>
            </div>
          </div>

          {/* ── Col 3: Contacto ── */}
          <div className="flex flex-col gap-6">
            <h4 className="text-xs font-bold tracking-widest uppercase text-white">
              Contacto
            </h4>

            {/* La Paz */}
            <div className="flex flex-col gap-1.5">
              <p className="text-sm font-semibold text-white">La Paz</p>
              <div className="flex items-center gap-2 text-sm text-white/70">
                <Phone className="w-3.5 h-3.5 text-[#f9e300] shrink-0" />
                Área Comercial: +591 71538792
              </div>
              <div className="flex items-start gap-2 text-sm text-white/70">
                <Phone className="w-3.5 h-3.5 text-[#f9e300] shrink-0 mt-0.5" />
                <span>Tel: 2 2422060 — 2 2910878</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-white/70">
                <Mail className="w-3.5 h-3.5 text-[#f9e300] shrink-0" />
                info@metrica.com.bo
              </div>
              <div className="flex items-center gap-2 text-sm text-white/70">
                <Mail className="w-3.5 h-3.5 text-[#f9e300] shrink-0" />
                comercial@metrica.com.bo
              </div>
            </div>

            {/* Santa Cruz */}
            <div className="flex flex-col gap-1.5">
              <p className="text-sm font-semibold text-white">Santa Cruz</p>
              <div className="flex items-center gap-2 text-sm text-white/70">
                <Phone className="w-3.5 h-3.5 text-[#f9e300] shrink-0" />
                +591 67010001
              </div>
              <div className="flex items-center gap-2 text-sm text-white/70">
                <Mail className="w-3.5 h-3.5 text-[#f9e300] shrink-0" />
                info@metrica.com.bo
              </div>
              <div className="flex items-center gap-2 text-sm text-white/70">
                <Mail className="w-3.5 h-3.5 text-[#f9e300] shrink-0" />
                comercial@metrica.com.bo
              </div>
            </div>
          </div>

          {/* ── Col 4: Links ── */}
          <div className="flex flex-col gap-6">
            <h4 className="text-xs font-bold tracking-widest uppercase text-white">
              Enlaces Rápidos
            </h4>
            <ul className="flex flex-col gap-2.5 text-sm text-white/70">
              {[
                { label: "Inicio",          href: "#" },
                { label: "Productos",       href: "#productos" },
                { label: "Servicios",       href: "#servicios" },
                { label: "Certificaciones", href: "#certificaciones" },
                { label: "Contacto",        href: "#contacto" },
              ].map(({ label, href }) => (
                <li key={label}>
                  <Link
                    href={href}
                    className="hover:text-[#f9e300] transition-colors duration-200"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

        </div>
      </div>

      {/* ── Bottom bar ── */}
      <div className="border-t border-white/10">
        <div className="container mx-auto px-6 lg:px-16 py-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-white/30">
          <span>© {new Date().getFullYear()} Métrica L. Todos los derechos reservados.</span>
          <span>Acreditado IBMETRO · DTA-CET-041 · NB/ISO/IEC 17025:2018</span>
        </div>
      </div>

    </footer>
  );
}
