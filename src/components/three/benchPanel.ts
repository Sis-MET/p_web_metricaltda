// Dibuja el panel frontal de la BPA121 en dos canvas:
// `color` (panel impreso + LEDs) y `glow` (solo lo que se ilumina, para el emissiveMap).

export const PANEL_W = 1024;
export const PANEL_H = 192;

const SEGMENTS: Record<string, string> = {
  "0": "abcdef",
  "1": "bc",
  "2": "abged",
  "3": "abgcd",
  "4": "fgbc",
  "5": "afgcd",
  "6": "afgedc",
  "7": "abc",
  "8": "abcdefg",
  "9": "abcdfg",
  "-": "g",
  O: "abcdef",
  F: "aefg",
  " ": "",
};

const LED_ON = "#ff3b30";
const LED_OFF = "rgba(255, 60, 48, 0.07)";

type Cell = { ch: string; dot: boolean };

/** "1.250" → 6 posiciones alineadas a la derecha, con el punto decimal en la cifra anterior */
function toCells(text: string, count = 6): Cell[] {
  const cells: Cell[] = [];
  for (const ch of text) {
    if (ch === "." && cells.length) cells[cells.length - 1].dot = true;
    else cells.push({ ch, dot: false });
  }
  while (cells.length < count) cells.unshift({ ch: " ", dot: false });
  return cells.slice(-count);
}

function drawDigit(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, cell: Cell, lit: boolean, glowOnly: boolean) {
  const t = w * 0.18;
  const half = h / 2;
  const seg: Record<string, [number, number, number, number]> = {
    a: [t, 0, w - 2 * t, t],
    b: [w - t, t, t, half - 1.5 * t],
    c: [w - t, half + 0.5 * t, t, half - 1.5 * t],
    d: [t, h - t, w - 2 * t, t],
    e: [0, half + 0.5 * t, t, half - 1.5 * t],
    f: [0, t, t, half - 1.5 * t],
    g: [t, half - t / 2, w - 2 * t, t],
  };
  const on = SEGMENTS[cell.ch] ?? "";

  ctx.save();
  // Inclinación típica de los displays de 7 segmentos
  ctx.translate(x, y);
  ctx.transform(1, 0, -0.1, 1, h * 0.1, 0);
  for (const [name, [sx, sy, sw, sh]] of Object.entries(seg)) {
    const isOn = lit && on.includes(name);
    if (glowOnly && !isOn) continue;
    ctx.fillStyle = isOn ? LED_ON : LED_OFF;
    ctx.beginPath();
    ctx.roundRect(sx + 1.5, sy + 1.5, sw - 3, sh - 3, t / 2);
    ctx.fill();
  }
  if (cell.dot || !glowOnly) {
    const isOn = lit && cell.dot;
    if (!glowOnly || isOn) {
      ctx.fillStyle = isOn ? LED_ON : LED_OFF;
      ctx.beginPath();
      ctx.arc(w + t * 0.9, h - t / 2, t * 0.55, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}

export type PanelState = { text: string; stable: boolean; zero: boolean; on: boolean };

function drawDisplay(ctx: CanvasRenderingContext2D, state: PanelState, glowOnly: boolean) {
  const cells = toCells(state.text);
  const digitW = 44;
  const digitH = 66;
  const gap = 22;
  const right = 560;
  const top = 77;
  cells.forEach((cell, i) => {
    const x = right - (cells.length - i) * (digitW + gap);
    drawDigit(ctx, x, top, digitW, digitH, cell, state.on, glowOnly);
  });

  // Indicadores: estable (verde) y →0← / g / kg / Net (rojos)
  const indicators = [
    { x: 196, on: state.on && state.zero },
    { x: 310, on: false },
    { x: 410, on: state.on },
    { x: 510, on: false },
  ];
  const lamp = (x: number, y: number, r: number, color: string, on: boolean) => {
    if (glowOnly && !on) return;
    ctx.fillStyle = on ? color : "rgba(0,0,0,0.35)";
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  };
  lamp(118, 96, 8, "#3ee08f", state.on && state.stable);
  indicators.forEach((ind) => lamp(ind.x, 162, 5, LED_ON, ind.on));
}

export function drawPanel(color: CanvasRenderingContext2D, glow: CanvasRenderingContext2D, state: PanelState) {
  // ── Panel impreso ──
  const bg = color.createLinearGradient(0, 0, 0, PANEL_H);
  bg.addColorStop(0, "#2a50b4");
  bg.addColorStop(1, "#1c3c92");
  color.fillStyle = bg;
  color.fillRect(0, 0, PANEL_W, PANEL_H);

  color.fillStyle = "#ffffff";
  color.font = "italic 800 34px Arial, Helvetica, sans-serif";
  color.textBaseline = "alphabetic";
  // Con margen superior: el borde redondeado del panel recorta los primeros píxeles
  color.fillText("METTLER TOLEDO", 150, 54);
  color.font = "italic 400 24px Arial, Helvetica, sans-serif";
  color.fillStyle = "rgba(255,255,255,0.85)";
  color.fillText("BPA121", 470, 54);

  // Ventana del display
  color.fillStyle = "#120607";
  color.beginPath();
  color.roundRect(150, 66, 430, 88, 10);
  color.fill();

  // Leyendas de los indicadores
  color.font = "600 15px Arial, Helvetica, sans-serif";
  color.fillStyle = "rgba(255,255,255,0.85)";
  color.textAlign = "center";
  [
    ["→0←", 196],
    ["g", 310],
    ["Kg", 410],
    ["Net", 510],
  ].forEach(([label, x]) => color.fillText(String(label), Number(x), 186));
  color.textAlign = "start";

  // Botones
  const button = (x: number, y: number, lines: string[]) => {
    const g = color.createRadialGradient(x - 10, y - 12, 4, x, y, 38);
    g.addColorStop(0, "#ffffff");
    g.addColorStop(1, "#d9dee6");
    color.fillStyle = g;
    color.beginPath();
    color.ellipse(x, y, 44, 34, 0, 0, Math.PI * 2);
    color.fill();
    color.fillStyle = "#1c3c92";
    color.textAlign = "center";
    color.font = "700 17px Arial, Helvetica, sans-serif";
    lines.forEach((line, i) => color.fillText(line, x, y + (i - (lines.length - 1) / 2) * 18 + 6));
    color.textAlign = "start";
  };
  button(790, 66, ["→0←", "ON/OFF"]);
  button(770, 146, ["→T←"]);

  // Tecla circular de encendido a la izquierda
  color.fillStyle = "#eef1f5";
  color.beginPath();
  color.arc(70, 120, 24, 0, Math.PI * 2);
  color.fill();

  drawDisplay(color, state, false);

  // ── Capa de brillo ──
  glow.fillStyle = "#000000";
  glow.fillRect(0, 0, PANEL_W, PANEL_H);
  drawDisplay(glow, state, true);
}
