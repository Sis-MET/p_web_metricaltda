import type { CategorySlug } from "./categories";
import type { Brochure, Product } from "./catalog";

import bba211 from "@/assets/products/bba211.png";
import bba231 from "@/assets/products/bba231.png";
import bba236 from "@/assets/products/bba236.png";
import bba256x from "@/assets/products/bba256x.png";
import bpa121 from "@/assets/products/bpa121.png";
import ics226 from "@/assets/products/ics226.png";
import ics241 from "@/assets/products/ics241.png";
import pba220 from "@/assets/products/pba220.png";
import pba436 from "@/assets/products/pba436.png";
import pba439 from "@/assets/products/pba439.png";
import pba757 from "@/assets/products/pba757.png";
import pbd655 from "@/assets/products/pbd655.png";
import pbd659pba639 from "@/assets/products/pbd659-pba639.png";
import pbd769 from "@/assets/products/pbd769.png";
import pbk785pbd555 from "@/assets/products/pbk785-pbd555.png";
import pbk9pfk9 from "@/assets/products/pbk9-pfk9.png";
import powercellPdx from "@/assets/products/powercell-pdx.png";

/** Fichas técnicas METTLER TOLEDO, servidas desde public/fichas-tecnicas */
const brochure = (file: string, language?: Brochure["language"]): Brochure => ({
  href: `/fichas-tecnicas/${file}.pdf`,
  ...(language && { language }),
});

const SHARED_DIGITAL =
  "Plataformas precalibradas y robustas, aptas para entornos hostiles con protección IP65 opcional, nivelación ergonómica, protección contra sobrecargas e interfaz digital SICSpro para conectar y pesar.";

const SHARED_HYGIENIC = "Fabricada en acero inoxidable AISI 304 con protección IP68/IP69K, es fácil de limpiar y mantener.";

export const PRODUCTS: Product[] = [
  /* Sobremesa y compactas */
  {
    slug: "bpa121",
    category: "balanzas-industriales",
    family: "sobremesa",
    model: "BPA121",
    type: "Báscula compacta",
    image: bpa121,
    brochure: brochure("bpa121"),
    summary: "Báscula de sobremesa portátil para pesar de forma eficiente y fiable en entornos húmedos y de procesamiento de alimentos.",
    description:
      "La BPA121 es una báscula de sobremesa portátil, diseñada para ofrecer un pesaje eficiente y fiable en entornos industriales, especialmente en aquellos con humedad o condiciones adversas. Su diseño compacto facilita el transporte y la integración en los flujos de trabajo de procesamiento de alimentos, y su plato y soporte se desmontan para limpiar cada pieza por separado.",
    capacity: { min: 3, max: 30 },
    protection: "IP68 / IP69K",
    environments: ["humedo", "lavado"],
    features: [
      "Resistente al agua y al polvo, con clasificación IP68/IP69K",
      "Plato y soporte desmontables para una limpieza a fondo",
      "Batería recargable de bajo consumo: pese donde la necesite",
      "Doble pantalla LED con brillo ajustable",
    ],
    specs: [
      { label: "Capacidades", value: "3, 6, 15 y 30 kg" },
      { label: "Plataforma", value: "182 × 226 mm" },
      { label: "Dimensiones", value: "300 × 230 × 133 mm" },
      { label: "Protección", value: "IP68 / IP69K" },
      { label: "Pantalla", value: "Doble pantalla LED con brillo ajustable" },
      { label: "Alimentación", value: "Adaptador de corriente y batería recargable" },
      { label: "Material", value: "Carcasa de plástico ligero; plato de acero inoxidable opcional" },
    ],
    demo: "bpa121",
  },
  {
    slug: "ics226",
    category: "balanzas-industriales",
    family: "sobremesa",
    model: "ICS226",
    type: "Báscula compacta",
    image: ics226,
    brochure: brochure("ics226"),
    summary: "Báscula portátil de acero inoxidable para pesaje y porcionado en producción de alimentos y envasado.",
    description:
      "La ICS226 es una solución portátil ideal para aplicaciones de pesaje y porcionado en entornos de producción de alimentos y envasado. Está fabricada completamente en acero inoxidable y su protección IP65/IP67 contra el agua y el polvo la hace adecuada para entornos con humedad ligera.",
    capacity: { min: 3, max: 15 },
    protection: "IP65 / IP67",
    environments: ["humedo"],
    features: [
      "Pesaje simple, control de exceso/defecto y cambio de unidades",
      "Indicador gráfico de control de peso",
      "Batería recargable y asas extraíbles para trasladarla con facilidad",
    ],
    specs: [
      { label: "Capacidades", value: "De 3 a 15 kg" },
      { label: "Precisión", value: "Clase III OIML, hasta 7500 d" },
      { label: "Pantalla", value: "LCD retroiluminada de 6 dígitos" },
      { label: "Material", value: "Carcasa y celda de carga de acero inoxidable" },
      { label: "Protección", value: "IP65 / IP67" },
      { label: "Interfaz", value: "RS232 para impresoras y otros equipos" },
    ],
  },
  {
    slug: "ics241",
    category: "balanzas-industriales",
    family: "sobremesa",
    model: "ICS241",
    type: "Báscula compacta",
    image: ics241,
    brochure: brochure("ics241"),
    summary: "Pesaje y recuento con registro de datos en tarjeta SD para producción, logística y control de calidad.",
    description:
      "La ICS241 está diseñada para tareas sencillas de pesaje y recuento en producción, logística y control de calidad. Su pantalla LCD y su teclado alfanumérico la hacen intuitiva, y la gestión de datos mediante tarjeta SD mejora la productividad y reduce los errores humanos.",
    capacity: { min: 3, max: 30 },
    environments: ["seco"],
    features: [
      "Pesaje y recuento de piezas",
      "Hasta 30 000 transacciones y 1550 ID de producto en tarjeta SD",
      "Hasta 100 horas de autonomía con pilas recargables",
    ],
    specs: [
      { label: "Capacidades", value: "3, 6, 15 y 30 kg" },
      { label: "Pantalla", value: "LCD matricial retroiluminada, teclado alfanumérico" },
      { label: "Memoria", value: "30 000 transacciones y 1550 ID de producto (tarjeta SD)" },
      { label: "Alimentación", value: "Adaptador de corriente o pilas recargables (hasta 100 h)" },
      { label: "Conectividad", value: "RS232 para impresoras y sistemas ERP" },
      { label: "Material", value: "Carcasa de plástico, plato de acero inoxidable" },
    ],
  },
  {
    slug: "bba211",
    category: "balanzas-industriales",
    family: "sobremesa",
    model: "BBA211",
    type: "Báscula de sobremesa",
    image: bba211,
    brochure: brochure("bba211", "en"),
    summary: "Pesaje simple y control de peso para paquetes, envíos y recepción de mercancías.",
    description:
      "La BBA211 es una báscula de sobremesa para aplicaciones sencillas de pesaje y control de peso (over/under). Es eficiente, robusta y fácil de usar, ideal para entornos industriales y comerciales como el pesaje de paquetes, envíos y recepción de mercancías.",
    capacity: { min: 3, max: 300 },
    protection: "IP65",
    environments: ["seco"],
    features: [
      "Pesaje simple, control de peso (over/under) y cambio de unidades",
      "Hasta 450 horas de funcionamiento con 3 pilas tipo D",
      "Estructura de acero y plataforma de acero inoxidable",
    ],
    specs: [
      { label: "Capacidades", value: "De 3 a 300 kg" },
      { label: "Pantalla", value: "LCD retroiluminada de 6 dígitos" },
      { label: "Material", value: "Estructura de acero pintado, plataforma de acero inoxidable" },
      { label: "Protección", value: "IP65" },
      { label: "Autonomía", value: "Hasta 450 h con 3 pilas tipo D" },
      { label: "Conectividad", value: "RS232 opcional" },
    ],
  },
  {
    slug: "bba231",
    category: "balanzas-industriales",
    family: "sobremesa",
    model: "BBA231",
    type: "Báscula de sobremesa",
    image: bba231,
    brochure: brochure("bba231"),
    summary: "Báscula versátil, económica y robusta para el pesaje rutinario en ambientes secos o con polvo.",
    description:
      "La BBA231 es una báscula de sobremesa versátil, económica y robusta, diseñada para aplicaciones rutinarias de pesaje en entornos industriales secos o con polvo: pesaje directo, recuento, control de peso (over/under) y pesaje de animales.",
    capacity: { min: 6, max: 300 },
    protection: "IP54 / IP65",
    environments: ["seco"],
    features: [
      "Pesaje, recuento, control de peso, totalización e impresión",
      "Almacenamiento de objetivos de peso",
      "Pantalla LCD grande de 60 mm",
    ],
    specs: [
      { label: "Capacidades", value: "De 6 a 300 kg" },
      { label: "Pantalla", value: "LCD de 60 mm con retroiluminación ajustable" },
      { label: "Material", value: "Bastidor de acero al carbono, plataforma de acero inoxidable" },
      { label: "Protección", value: "IP54 / IP65" },
      { label: "Conectividad", value: "RS232 para impresoras o PC" },
      { label: "Alimentación", value: "6 pilas AA (más de 80 h) o adaptador de corriente" },
    ],
  },
  {
    slug: "bba236",
    category: "balanzas-industriales",
    family: "sobremesa",
    model: "BBA236",
    type: "Báscula de sobremesa",
    image: bba236,
    brochure: brochure("bba236"),
    summary: "Báscula robusta de acero inoxidable para ambientes secos o con salpicaduras de líquidos.",
    description:
      "La BBA236 es una báscula de sobremesa robusta y rentable para uso versátil en entornos industriales secos o con salpicaduras de líquidos. Su diseño intuitivo la hace ideal para pesaje directo, control de exceso/defecto, recuento y pesaje de animales.",
    capacity: { min: 3, max: 600 },
    protection: "IP66 / IP67",
    environments: ["seco", "humedo"],
    features: [
      "Pesaje, control de peso, recuento, totalización y pesaje de animales",
      "Estructura y plataforma de acero inoxidable",
      "Más de 80 horas de funcionamiento con batería recargable",
    ],
    specs: [
      { label: "Capacidades", value: "De 3 a 600 kg" },
      { label: "Material", value: "Estructura y plataforma de acero inoxidable" },
      { label: "Protección", value: "IP66 / IP67" },
      { label: "Pantalla", value: "LCD de 60 mm con retroiluminación ajustable" },
      { label: "Conectividad", value: "RS232 para impresoras o PC" },
      { label: "Alimentación", value: "Adaptador de corriente o batería recargable (más de 80 h)" },
    ],
  },
  {
    slug: "bba256x",
    category: "balanzas-industriales",
    family: "sobremesa",
    model: "BBA256x",
    type: "Báscula intrínsecamente segura",
    image: bba256x,
    brochure: brochure("bba256x"),
    summary: "Pesaje seguro en zonas con riesgo de explosión, con homologaciones ATEX e IECEx.",
    description:
      "La BBA256x es una báscula de sobremesa intrínsecamente segura para pesar en entornos con riesgo de explosión, como zonas químicas o farmacéuticas. Su construcción en acero inoxidable y sus homologaciones ATEX e IECEx la preparan para condiciones adversas, incluida la exposición a humedad y productos químicos agresivos.",
    capacity: { min: 3, max: 150 },
    protection: "IP66 indicador · IP68/IP69K plataforma",
    environments: ["lavado", "atex"],
    features: [
      "Homologaciones ATEX e IECEx",
      "Registro automático de transacciones para la trazabilidad",
      "Preconfigurada para una instalación rápida y fácil limpieza",
    ],
    specs: [
      { label: "Capacidades", value: "De 3 a 150 kg, según el modelo" },
      { label: "Resolución", value: "OIML clase III, 3000e (hasta 15 000 d recomendadas)" },
      { label: "Protección", value: "IP66 indicador, IP68/IP69K plataforma" },
      { label: "Plataformas", value: "De 228 × 228 mm a 400 × 500 mm" },
      { label: "Material", value: "Acero inoxidable AISI 304; celda de carga sellada herméticamente" },
      { label: "Alimentación", value: "Integrada, 187–250 V CA, 50/60 Hz" },
    ],
  },

  /* Plataformas de pesaje */
  {
    slug: "pba220",
    category: "balanzas-industriales",
    family: "plataformas",
    model: "PBA220",
    type: "Plataforma de pesaje",
    image: pba220,
    brochure: brochure("pba220"),
    summary: "Plataforma económica y robusta para inventarios, envíos y recepción de mercancías en ambientes secos.",
    description:
      "La PBA220 es una plataforma de pesaje económica, robusta y versátil para tareas de pesaje en entornos secos, como inventarios, control de envíos y recepción de mercancías. Es compatible con todos los terminales analógicos de METTLER TOLEDO.",
    capacity: { min: 6, max: 300 },
    protection: "IP65 (celda de carga)",
    environments: ["seco"],
    features: [
      "Modelos cuadrados y rectangulares",
      "Topes de sobrecarga y patas ajustables con amortiguación",
      "Compatible con todos los terminales analógicos METTLER TOLEDO",
    ],
    specs: [
      { label: "Capacidades", value: "De 6 a 300 kg" },
      { label: "Resolución", value: "Clase III OIML (3000e) / NTEP (3000d)" },
      { label: "Bastidor", value: "Acero pintado" },
      { label: "Plato de carga", value: "Acero inoxidable AISI 304" },
      { label: "Celda de carga", value: "Aluminio, IP65" },
      { label: "Homologación", value: "OIML y NTEP" },
    ],
  },
  {
    slug: "pbd555",
    category: "balanzas-industriales",
    family: "plataformas",
    model: "PBD555",
    type: "Plataforma digital de pesaje",
    image: pbk785pbd555,
    brochure: brochure("pbk785-pbd555"),
    summary: "Plataforma digital precalibrada con celda de galgas METTLER TOLEDO y resolución aprobada de hasta 7500e.",
    description: `La PBD555 utiliza la celda de carga de galgas extensométricas de METTLER TOLEDO, con una resolución aprobada de hasta 7500e. ${SHARED_DIGITAL}`,
    capacity: { min: 3, max: 35 },
    protection: "IP65 opcional",
    environments: ["seco"],
    features: [
      "Precalibrada y lista para conectar y pesar",
      "Resolución aprobada de hasta 7500e",
      "Protección contra sobrecargas y nivelación ergonómica",
    ],
    specs: [
      { label: "Capacidades", value: "De 3 a 35 kg" },
      { label: "Celda de carga", value: "Galgas extensométricas METTLER TOLEDO" },
      { label: "Resolución aprobada", value: "Hasta 7500e" },
      { label: "Interfaz", value: "Digital SICSpro" },
      { label: "Protección", value: "IP65 opcional" },
    ],
  },
  {
    slug: "pbk785",
    category: "balanzas-industriales",
    family: "plataformas",
    model: "PBK785",
    type: "Plataforma digital de alta precisión",
    image: pbk785pbd555,
    brochure: brochure("pbk785-pbd555"),
    summary: "Tecnología de compensación de fuerza MonoBloc® con resolución aprobada de hasta 61 000e.",
    description: `La PBK785 utiliza la tecnología de compensación de fuerza MonoBloc®, con una resolución aprobada de hasta 61 000e (OIML). ${SHARED_DIGITAL}`,
    capacity: { min: 0.61, max: 35.1 },
    protection: "IP65 opcional",
    environments: ["seco"],
    features: [
      "Totalmente digital para una excelente precisión",
      "Precalibrada y lista para su uso inmediato",
      "Aprobada por OIML con hasta 61 000e",
    ],
    specs: [
      { label: "Capacidades", value: "De 610 g a 35,1 kg" },
      { label: "Tecnología", value: "Compensación de fuerza MonoBloc®" },
      { label: "Resolución aprobada", value: "Hasta 61 000e (OIML)" },
      { label: "Interfaz", value: "Digital SICSpro" },
      { label: "Protección", value: "IP65 opcional" },
    ],
  },
  {
    slug: "pbd655",
    category: "balanzas-industriales",
    family: "plataformas",
    model: "PBD655",
    type: "Plataforma digital de pesaje",
    image: pbd655,
    brochure: brochure("pbd655"),
    summary: "Plataforma digital robusta y económica, con resolución certificable de 6000e para entornos duros y con polvo.",
    description:
      "La serie PBD655 es extremadamente robusta y duradera, diseñada para una operación simple y confiable. Incorpora una celda METTLER TOLEDO exclusiva con resolución certificable de 6000e OIML y un convertidor A/D rápido y estable para pesar y contar con precisión. Viene precalibrada y con protección IP65.",
    protection: "IP65",
    environments: ["seco"],
    features: [
      "Diseño «enchufar y pesar» para una configuración rápida",
      "Señal robusta con cable blindado y conector M12 industrial",
      "Apta para pesaje dinámico gracias a su rápida actualización",
      "Accesorios: columnas, carros y tapas especiales",
    ],
    specs: [
      { label: "Modelos", value: "PBD655-A, -BB, -B, -BC y -CC" },
      { label: "Resolución", value: "6000e OIML certificable" },
      { label: "Plato de pesaje", value: "Acero inoxidable satinado" },
      { label: "Protección", value: "IP65" },
      { label: "Alimentación", value: "6 a 18 V CC" },
    ],
  },
  {
    slug: "pbd659",
    category: "balanzas-industriales",
    family: "plataformas",
    model: "PBD659",
    type: "Plataforma higiénica",
    image: pbd659pba639,
    brochure: brochure("pbd659-pba639"),
    summary: "Plataforma de acero inoxidable IP68/IP69K para áreas húmedas y de lavado frecuente.",
    description: `La PBD659 está diseñada para entornos húmedos y de lavado frecuente, ideal para aplicaciones con estándares de higiene elevados. ${SHARED_HYGIENIC}`,
    protection: "IP68 / IP69K",
    environments: ["lavado", "atex"],
    features: [
      "Diseño que evita la acumulación de humedad y se limpia rápido",
      "Varias capacidades y tamaños",
      "Certificación ATEX/IECEx opcional para áreas peligrosas",
    ],
    specs: [
      { label: "Material", value: "Acero inoxidable AISI 304" },
      { label: "Protección", value: "IP68 / IP69K" },
      { label: "Homologación", value: "OIML y NTEP" },
      { label: "Zonas peligrosas", value: "ATEX/IECEx opcional" },
    ],
  },
  {
    slug: "pba639",
    category: "balanzas-industriales",
    family: "plataformas",
    model: "PBA639",
    type: "Plataforma higiénica",
    image: pbd659pba639,
    brochure: brochure("pbd659-pba639"),
    summary: "Plataforma higiénica para ambientes húmedos con requisitos de limpieza rigurosos.",
    description: `La PBA639 está diseñada para ambientes húmedos con requisitos de higiene rigurosos y procesos que exigen alta confiabilidad y durabilidad. ${SHARED_HYGIENIC}`,
    protection: "IP68 / IP69K",
    environments: ["lavado", "atex"],
    features: [
      "Superficie de carga fácil de limpiar, rugosidad Ra ≤ 0,8 µm",
      "Compatible con terminales analógicos",
      "Certificación ATEX/IECEx opcional para zonas peligrosas",
    ],
    specs: [
      { label: "Material", value: "Acero inoxidable AISI 304" },
      { label: "Protección", value: "IP68 / IP69K" },
      { label: "Superficie", value: "Rugosidad Ra ≤ 0,8 µm" },
      { label: "Temperatura de operación", value: "De −10 °C a +40 °C" },
      { label: "Zonas peligrosas", value: "ATEX/IECEx opcional" },
    ],
  },
  {
    slug: "pba757",
    category: "balanzas-industriales",
    family: "plataformas",
    model: "PBA757",
    type: "Plataforma de pesaje",
    image: pba757,
    brochure: brochure("pba757"),
    summary: "Plataforma rígida para pesaje estático y dinámico: recuento, control de peso y verificación de envases.",
    description:
      "La PBA757 está diseñada para aplicaciones industriales estáticas y dinámicas. Construida en acero inoxidable y equipada con celdas de carga analógicas de alto rendimiento, garantiza resultados rápidos y precisos incluso en condiciones adversas, con un diseño que minimiza los errores por vibraciones, impactos o cambios de temperatura.",
    capacity: { min: 60, max: 300 },
    protection: "IP65",
    environments: ["seco", "atex"],
    features: [
      "Pesaje preciso aun con la carga descentrada",
      "Resolución certificable de 6000e, hasta 60 000 d sin uso legal",
      "Certificación ATEX categoría 3GD (zonas 2/22)",
      "Accesorios: soportes, columnas y transportadores de rodillos",
    ],
    specs: [
      { label: "Modelos", value: "PBA757-B (400 × 500 mm, 60–120 kg) y PBA757-CC (600 × 800 mm, 120–300 kg)" },
      { label: "Resolución", value: "6000e certificable; hasta 60 000 d sin uso legal" },
      { label: "Protección", value: "IP65" },
      { label: "Zonas peligrosas", value: "ATEX categoría 3GD, zonas 2/22" },
      { label: "Compatibilidad", value: "Terminales analógicos y digitales" },
    ],
  },
  {
    slug: "pba436",
    category: "balanzas-industriales",
    family: "plataformas",
    model: "PBA436",
    type: "Plataforma de pesaje",
    image: pba436,
    brochure: brochure("pba436"),
    summary: "Plataforma de acero inoxidable con diseño higiénico abierto para entornos de lavado suave.",
    description:
      "La PBA436 combina durabilidad, precisión y diseño higiénico para entornos con lavado suave. Su bastidor abierto facilita la limpieza y minimiza los riesgos de contaminación, mientras los topes de sobrecarga protegen la celda de carga.",
    capacity: { min: 3, max: 600 },
    protection: "IP65",
    environments: ["humedo"],
    features: [
      "Bastidor abierto que facilita la limpieza",
      "Topes de sobrecarga ajustables de forma independiente",
      "Kit higiénico opcional, sin roscas abiertas",
    ],
    specs: [
      { label: "Capacidades", value: "De 3 a 600 kg, clase III (3000e)" },
      { label: "Tamaños", value: "7 estándar, de 228 × 228 mm a 600 × 800 mm" },
      { label: "Material", value: "Acero inoxidable" },
      { label: "Protección", value: "IP65" },
      { label: "Temperatura de operación", value: "De −10 °C a +50 °C" },
      { label: "Compatibilidad", value: "Indicadores analógicos" },
    ],
  },
  {
    slug: "pba439",
    category: "balanzas-industriales",
    family: "plataformas",
    model: "PBA439",
    type: "Plataforma higiénica",
    image: pba439,
    brochure: brochure("pba439"),
    summary: "Plataforma de acero inoxidable IP68/IP69K para lavado intensivo y altos estándares de limpieza.",
    description:
      "La PBA439 está diseñada para entornos industriales con altos estándares de limpieza. Fabricada en acero inoxidable, con protección IP68/IP69K, es ideal para ambientes húmedos y procesos con lavado intensivo, con un diseño higiénico que minimiza la contaminación.",
    capacity: { min: 6, max: 600 },
    protection: "IP68 / IP69K",
    environments: ["lavado", "atex"],
    features: [
      "Diseño higiénico para una limpieza eficiente",
      "Certificaciones OIML y NTEP",
      "Apta para áreas peligrosas, zonas 1/21 y 2/22",
    ],
    specs: [
      { label: "Capacidades", value: "De 6 a 600 kg" },
      { label: "Tamaños", value: "De 240 × 300 mm a 600 × 800 mm" },
      { label: "Protección", value: "IP68 / IP69K" },
      { label: "Homologación", value: "OIML y NTEP" },
      { label: "Zonas peligrosas", value: "Zonas 1/21 y 2/22" },
      { label: "Interfaz", value: "Analógica" },
    ],
  },
  {
    slug: "pbd769",
    category: "balanzas-industriales",
    family: "plataformas",
    model: "PBD769",
    type: "Plataforma higiénica",
    image: pbd769,
    brochure: brochure("pbd769"),
    summary: "Plataforma higiénica de alta resolución para pesaje dinámico en ambientes húmedos y de lavado.",
    description:
      "La PBD769 combina precisión, durabilidad y facilidad de limpieza para entornos industriales exigentes. Fabricada en acero inoxidable con protección IP66/IP68, resiste ambientes húmedos y lavados intensivos con un rendimiento fiable.",
    capacity: { min: 60, max: 300 },
    protection: "IP66 / IP68",
    environments: ["humedo", "lavado"],
    features: [
      "Absorción de impactos para pesajes dinámicos precisos",
      "Hasta 150 000 divisiones de resolución",
      "Actualización de hasta 90 lecturas por segundo",
    ],
    specs: [
      { label: "Capacidades", value: "De 60 a 300 kg" },
      { label: "Resolución", value: "Hasta 150 000 divisiones" },
      { label: "Protección", value: "IP66 / IP68" },
      { label: "Material", value: "Acero inoxidable" },
      { label: "Interfaces", value: "SICSpro e IDNet" },
    ],
  },
  {
    slug: "pbk9-pfk9",
    category: "balanzas-industriales",
    family: "plataformas",
    model: "PBK9 / PFK9",
    type: "Plataformas de pesaje",
    image: pbk9pfk9,
    brochure: brochure("pbk9-pfk9"),
    summary: "Plataformas de alta resolución para áreas húmedas, polvorientas y peligrosas, de 0,6 kg a 3 t.",
    description:
      "Las plataformas PBK9 y PFK9 están diseñadas para entornos industriales difíciles, incluidas las áreas húmedas, polvorientas y peligrosas. En acero inoxidable con protección IP68/IP69K, son ideales para aplicaciones de alta precisión como el conteo de piezas, la formulación de mezclas y el llenado.",
    capacity: { min: 0.6, max: 3000 },
    protection: "IP68 / IP69K",
    environments: ["lavado", "atex"],
    features: [
      "Pesaje dinámico, conteo de piezas, formulación y llenado",
      "Hasta 750 000 divisiones de resolución",
      "Integración con sistemas de automatización y terminales METTLER TOLEDO",
    ],
    specs: [
      { label: "Capacidades", value: "De 0,6 kg a 3 t" },
      { label: "Resolución", value: "Hasta 750 000 divisiones" },
      { label: "Homologación", value: "OIML clase II y III, NTEP, ATEX/IECEx" },
      { label: "Material", value: "Acero inoxidable AISI 304" },
      { label: "Protección", value: "IP68 / IP69K" },
    ],
  },

  /* Básculas de camiones */
  {
    slug: "powercell-pdx",
    category: "basculas-de-camiones",
    model: "POWERCELL PDX",
    type: "Báscula de camiones",
    image: powercellPdx,
    summary: "Básculas de camiones con celdas digitales POWERCELL PDX para controlar grandes volúmenes con la más alta precisión.",
    description:
      "La tecnología, durabilidad y exactitud de las básculas de camiones POWERCELL PDX de METTLER TOLEDO permiten controlar grandes volúmenes transportados con la más alta precisión. Cada celda digitaliza su propia señal y se conecta en red con el terminal, que supervisa el sistema y alerta ante cualquier anomalía antes de que afecte la medición.",
    environments: [],
    features: [
      "Celdas que convierten la señal a digital, sin cajas de conexión analógicas",
      "Supervisión de cada celda con alertas antes de que una falla afecte la medición",
      "Peso estable integrado a sus sistemas para emitir tickets y reportes",
      "Instalación, mantenimiento y renovación a cargo de nuestro equipo técnico",
    ],
    specs: [
      { label: "Celdas de carga", value: "POWERCELL PDX digitales" },
      { label: "Conexión", value: "Red digital en cadena hacia el terminal" },
      { label: "Diagnóstico", value: "Supervisión continua de cada celda" },
      { label: "Integración", value: "Tickets, reportes y conexión con sus sistemas" },
    ],
  },
];

/* ─── Consultas ─────────────────────────────────────────────────────────── */

export function getProduct(category: string, slug: string): Product | undefined {
  return PRODUCTS.find((product) => product.category === category && product.slug === slug);
}

export const productsIn = (category: CategorySlug) => PRODUCTS.filter((product) => product.category === category);

/** Otros modelos de la misma familia (o categoría), para la ficha del producto */
export function relatedProducts(product: Product, limit = 4) {
  return PRODUCTS.filter(
    (other) =>
      other.slug !== product.slug &&
      other.category === product.category &&
      (product.family ? other.family === product.family : true)
  ).slice(0, limit);
}

