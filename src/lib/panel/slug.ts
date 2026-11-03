/** Dirección amigable a partir de un nombre: "PBA439 / PBA639" → "pba439-pba639" (servidor y formularios) */
export const slugify = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
