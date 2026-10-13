import { Mail, MapPin, MessageCircle, Phone, type LucideIcon } from "lucide-react";
import { Glow } from "@/components/ui/Backdrop";
import { EMAILS, OFFICES, SALES_PHONE, mapsUrl, whatsappUrl } from "@/content/company";

type Channel = { icon: LucideIcon; label: string; value: string; href: string; external?: boolean };

const CHANNELS: Channel[] = [
  { icon: MessageCircle, label: "WhatsApp", value: SALES_PHONE.display, href: whatsappUrl(), external: true },
  { icon: Phone, label: SALES_PHONE.label, value: SALES_PHONE.display, href: `tel:${SALES_PHONE.number}` },
  { icon: Mail, label: "Correo", value: EMAILS.info, href: `mailto:${EMAILS.info}` },
  ...OFFICES.map((office) => ({
    icon: MapPin,
    label: `Oficina ${office.city}`,
    value: office.address.join(", "),
    href: mapsUrl(office),
    external: true,
  })),
];

/** Canales directos de atención, junto a los formularios */
export function ContactCard({ title = "Atención directa" }: { title?: string }) {
  return (
    <div className="relative isolate overflow-hidden rounded-[2rem] bg-mt-800 p-6 text-white sm:p-8">
      <Glow className="-right-72 -top-80" />
      <h3 className="font-heading text-lg font-bold">{title}</h3>
      <ul className="mt-5 space-y-1">
        {CHANNELS.map(({ icon: Icon, label, value, href, external }) => (
          <li key={label}>
            <a
              href={href}
              {...(external && { target: "_blank", rel: "noopener noreferrer" })}
              className="-mx-2 flex items-center gap-3.5 rounded-xl px-2 py-2 transition-colors hover:bg-white/[0.07]"
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-sun-400">
                <Icon className="size-4" aria-hidden />
              </span>
              <span className="min-w-0">
                <span className="block text-xs text-white/55">{label}</span>
                <span className="block truncate font-medium">{value}</span>
              </span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
