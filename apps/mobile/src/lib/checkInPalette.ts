import raw from '../data/checkInPaletteColors.json';

type Entry = { color: string };

const PALETTE: string[] = (raw as Entry[])
  .map((e) => e.color.trim())
  .filter((c) => /^#[0-9A-Fa-f]{6}$/.test(c));

/** Duas cores distintas da paleta para o gradiente do check-in (overlay / banner). */
export function randomCheckInGradient(): readonly [string, string] {
  const n = PALETTE.length;
  if (n < 2) {
    const c = PALETTE[0] ?? '#4ECDC4';
    return [c, c];
  }
  let i = Math.floor(Math.random() * n);
  let j = Math.floor(Math.random() * n);
  let guard = 0;
  while (j === i && guard++ < 32) {
    j = Math.floor(Math.random() * n);
  }
  if (j === i) {
    j = (i + 1) % n;
  }
  return [PALETTE[i], PALETTE[j]];
}

/** Hex #RRGGBB → rgba para fundos suaves no banner. */
export function hexToRgba(hex: string, alpha: number): string {
  const h = hex.replace('#', '');
  const full = h.length === 3 ? h.split('').map((ch) => ch + ch).join('') : h;
  const n = parseInt(full, 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return `rgba(${r},${g},${b},${alpha})`;
}
