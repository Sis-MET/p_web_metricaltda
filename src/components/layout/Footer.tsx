import Image from "next/image";
import Link from "next/link";
import { Facebook, Instagram, Linkedin, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { ACCREDITATION, COMPANY, EMAILS, OFFICES, SOCIAL_LINKS, mapsUrl, whatsappUrl } from "@/content/company";
import { NAV } from "@/lib/routes";

const SOCIAL_ICONS = { Facebook, Instagram, LinkedIn: Linkedin };

const linkCls = "transition-colors duration-200 hover:text-white";
const headingCls = "font-heading text-xs font-bold uppercase tracking-[0.18em] text-sun-400";

// Columnas del mapa del sitio: las secciones con subpáginas
const SITEMAP = NAV.filter((item) => item.children);

export function Footer() {
  return (
    <footer data-header-theme="dark" className="bg-ink-950 text-white">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-12">
          {/* ── Marca y oficinas ── */}
          <div className="flex flex-col gap-8 lg:col-span-5">
            <div className="flex flex-col gap-5">
              <Image
                src="/images/logo/metrica-white.png"
                alt="Métrica Ltda."
                width={800}
                height={234}
                sizes="176px"
                className="h-12 w-auto self-start"
              />
              <p className="max-w-sm text-sm leading-relaxed text-white/60">
                {COMPANY.tagline}. Representantes exclusivos de METTLER TOLEDO en Bolivia y laboratorio de calibración
                acreditado.
              </p>
              {SOCIAL_LINKS.length > 0 && (
                <div className="flex gap-2.5">
                  {SOCIAL_LINKS.map(({ href, label }) => {
                    const Icon = SOCIAL_ICONS[label];
                    return (
                      <a
                        key={label}
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={label}
                        className="flex size-10 items-center justify-center rounded-full border border-white/10 bg-white/5 transition-colors duration-200 hover:border-white hover:bg-white hover:text-ink-900"
                      >
                        <Icon className="size-4" />
                      </a>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="grid gap-8 sm:grid-cols-2">
              {OFFICES.map((office) => (
                <div key={office.city} className="flex flex-col gap-3 text-sm text-white/70">
                  <h3 className={headingCls}>{office.city}</h3>
                  <a href={mapsUrl(office)} target="_blank" rel="noopener noreferrer" className={`flex gap-3 ${linkCls}`}>
                    <MapPin className="mt-0.5 size-4 shrink-0 text-white/40" aria-hidden />
                    <address className="not-italic leading-relaxed">
                      {office.address.map((line) => (
                        <span key={line} className="block">
                          {line}
                        </span>
                      ))}
                    </address>
                  </a>
                  <ul className="space-y-1.5">
                    {office.phones.map((phone) => (
                      <li key={phone.number}>
                        <a href={`tel:${phone.number}`} className={`inline-flex items-center gap-3 ${linkCls}`}>
                          <Phone className="size-4 shrink-0 text-white/40" aria-hidden />
                          {phone.display}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* ── Mapa del sitio ── */}
          <nav aria-label="Mapa del sitio" className="grid gap-10 sm:grid-cols-3 lg:col-span-7 lg:pl-10">
            {SITEMAP.map((item) => (
              <div key={item.href} className="flex flex-col gap-4">
                <h3 className={headingCls}>
                  <Link href={item.href} className={linkCls}>
                    {item.label}
                  </Link>
                </h3>
                <ul className="space-y-2 text-sm text-white/70">
                  {item.children?.map((link) => (
                    <li key={link.href}>
                      <Link href={link.href} className={linkCls}>
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            <div className="flex flex-col gap-4 sm:col-span-3">
              <h3 className={headingCls}>Escríbanos</h3>
              <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/70">
                {Object.values(EMAILS).map((email) => (
                  <li key={email}>
                    <a href={`mailto:${email}`} className={`inline-flex items-center gap-2.5 ${linkCls}`}>
                      <Mail className="size-4 shrink-0 text-white/40" aria-hidden />
                      {email}
                    </a>
                  </li>
                ))}
                <li>
                  <a href={whatsappUrl()} target="_blank" rel="noopener noreferrer" className={`inline-flex items-center gap-2.5 ${linkCls}`}>
                    <MessageCircle className="size-4 shrink-0 text-white/40" aria-hidden />
                    WhatsApp
                  </a>
                </li>
              </ul>
            </div>
          </nav>
        </div>
      </div>

      {/* ── Barra inferior ── */}
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-6 text-center text-xs text-white/45 sm:flex-row sm:px-6 sm:text-left lg:px-8">
          <span>
            © {COMPANY.founded}–{new Date().getFullYear()} {COMPANY.name} Todos los derechos reservados.
          </span>
          <span>
            Laboratorio de calibración acreditado por IBMETRO · {ACCREDITATION.code} · {ACCREDITATION.standard}
          </span>
        </div>
      </div>
    </footer>
  );
}
