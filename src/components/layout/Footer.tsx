import Image from "next/image";
import { Facebook, Instagram, Linkedin, MapPin, Phone, Mail } from "lucide-react";
import { SectionLink } from "@/components/navigation/SectionLink";
import { NAV_SECTIONS } from "@/lib/navigation";

const OFFICES = [
  {
    city: "La Paz",
    address: ["Calle Fernando Guachalla", "Pje. Gral. Donato Cardozo #715-B", "Zona Sopocachi"],
    contacts: [
      { icon: Phone, label: "Área Comercial: +591 71538792", href: "tel:+59171538792" },
      { icon: Phone, label: "Tel: 2 2422060", href: "tel:+59122422060" },
      { icon: Phone, label: "Tel: 2 2910878", href: "tel:+59122910878" },
    ],
  },
  {
    city: "Santa Cruz",
    address: ["Calle Prolongación Mutualista", "Entre 6to y 7mo Anillo #6170"],
    contacts: [{ icon: Phone, label: "+591 67010001", href: "tel:+59167010001" }],
  },
];

const EMAILS = ["info@metrica.com.bo", "comercial@metrica.com.bo"];

const SOCIAL = [
  { href: "#", Icon: Facebook, label: "Facebook" },
  { href: "#", Icon: Instagram, label: "Instagram" },
  { href: "#", Icon: Linkedin, label: "LinkedIn" },
];

const linkCls = "transition-colors duration-200 hover:text-white";

export function Footer() {
  return (
    <footer data-header-theme="dark" className="bg-navy-900 text-white">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-12">
          {/* ── Brand ── */}
          <div className="flex flex-col gap-5 lg:col-span-4">
            <Image
              src="/images/logo/metrica-white.png"
              alt="Métrica Ltda."
              width={800}
              height={234}
              sizes="176px"
              className="h-12 w-auto self-start"
            />
            <p className="max-w-xs text-sm leading-relaxed text-white/60">
              Líderes en soluciones de pesaje industrial y servicios de calibración acreditada en Bolivia.
            </p>
            <div className="flex gap-2.5">
              {SOCIAL.map(({ href, Icon, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="flex size-10 items-center justify-center rounded-full border border-white/10 bg-white/5 transition-colors duration-200 hover:border-white hover:bg-white hover:text-navy-900"
                >
                  <Icon className="size-4" />
                </a>
              ))}
            </div>
          </div>

          {/* ── Oficinas ── */}
          {OFFICES.map((office) => (
            <div key={office.city} className="flex flex-col gap-4 lg:col-span-3">
              <h4 className="font-heading text-xs font-bold uppercase tracking-[0.18em] text-navy-200">
                {office.city}
              </h4>
              <div className="flex gap-3 text-sm leading-relaxed text-white/70">
                <MapPin className="mt-0.5 size-4 shrink-0 text-white/40" aria-hidden />
                <address className="not-italic">
                  {office.address.map((line) => (
                    <span key={line} className="block">
                      {line}
                    </span>
                  ))}
                </address>
              </div>
              <ul className="space-y-1.5 text-sm text-white/70">
                {office.contacts.map(({ icon: Icon, label, href }) => (
                  <li key={label}>
                    <a href={href} className={`inline-flex items-center gap-3 ${linkCls}`}>
                      <Icon className="size-4 shrink-0 text-white/40" aria-hidden />
                      {label}
                    </a>
                  </li>
                ))}
                {EMAILS.map((email) => (
                  <li key={email}>
                    <a href={`mailto:${email}`} className={`inline-flex items-center gap-3 ${linkCls}`}>
                      <Mail className="size-4 shrink-0 text-white/40" aria-hidden />
                      {email}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* ── Enlaces ── */}
          <nav aria-label="Enlaces rápidos" className="flex flex-col gap-4 lg:col-span-2">
            <h4 className="font-heading text-xs font-bold uppercase tracking-[0.18em] text-navy-200">
              Enlaces
            </h4>
            <ul className="space-y-2 text-sm text-white/70">
              {NAV_SECTIONS.map((item) => (
                <li key={item.id}>
                  <SectionLink section={item.id} className={linkCls}>
                    {item.label}
                  </SectionLink>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>

      {/* ── Bottom bar ── */}
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-6 text-xs text-white/45 sm:flex-row sm:px-6 lg:px-8">
          <span>© {new Date().getFullYear()} Métrica Ltda. Todos los derechos reservados.</span>
          <span>Laboratorio de calibración acreditado por IBMETRO · DTA-CET-041 · NB/ISO/IEC 17025:2018</span>
        </div>
      </div>
    </footer>
  );
}
