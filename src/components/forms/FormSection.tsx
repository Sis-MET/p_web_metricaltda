import type { ReactNode } from "react";
import { Reveal } from "@/components/animations/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ContactCard } from "@/components/layout/ContactCard";
import { SiteForm } from "./SiteForm";
import type { FormId } from "@/lib/forms/definitions";

type FormSectionProps = {
  form: FormId;
  eyebrow: string;
  title: string;
  description?: string;
  /** Columna lateral; por defecto, los canales directos de atención */
  aside?: ReactNode;
  id?: string;
};

/** Formulario de la página con su columna de apoyo. */
export function FormSection({ form, eyebrow, title, description, aside = <ContactCard />, id = "solicitar" }: FormSectionProps) {
  return (
    <section id={id} className="bg-neutral-50 py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <SectionHeading eyebrow={eyebrow} title={title} description={description} className="max-w-2xl" />
        </Reveal>
        <div className="mt-12 grid items-start gap-6 lg:grid-cols-12 lg:gap-8">
          <Reveal className="lg:col-span-7">
            <div className="rounded-[2rem] border border-neutral-200 bg-white p-6 shadow-[0_32px_64px_-40px_rgba(0,0,0,0.3)] sm:p-8">
              <SiteForm id={form} />
            </div>
          </Reveal>
          <Reveal delay={0.06} className="flex flex-col gap-6 lg:col-span-5">
            {aside}
          </Reveal>
        </div>
      </div>
    </section>
  );
}
