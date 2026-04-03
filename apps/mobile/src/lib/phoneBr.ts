/** Brasil: armazenamos sempre dígitos E.164 começando em 55 (ex.: 5511987654321). */

export const BR_PLACEHOLDER_MOBILE = '(11) 98765-4321';

export const BR_PHONE_HELPER = 'DDD + número do celular (só números, com DDD)';

/** Formata DDD + número enquanto digita (até 11 dígitos locais). */
export function maskBrazilLocalDigits(raw: string): string {
  const x = raw.replace(/\D/g, '').slice(0, 11);
  if (x.length === 0) return '';
  if (x.length <= 2) return `(${x}`;
  const ddd = x.slice(0, 2);
  const r = x.slice(2);
  if (r.length === 0) return `(${ddd})`;
  if (r.length <= 8) {
    if (r.length <= 4) return `(${ddd}) ${r}`;
    return `(${ddd}) ${r.slice(0, 4)}-${r.slice(4)}`;
  }
  return `(${ddd}) ${r.slice(0, 5)}-${r.slice(5)}`;
}

/** Extrai só dígitos locais (sem 55) a partir do que o usuário digita ou de E.164 guardado. */
export function extractLocalDigits(input: string): string {
  let d = input.replace(/\D/g, '');
  if (d.startsWith('55') && d.length > 2) d = d.slice(2);
  while (d.startsWith('0')) d = d.slice(1);
  return d.slice(0, 11);
}

/** Converte DDD + número (10 ou 11 dígitos) ou E.164 já com 55 para 55 + DDD + número. */
export function normalizeToBrazilE164(input: string): string | null {
  let d = input.replace(/\D/g, '');
  if (!d) return null;
  if (d.startsWith('55')) {
    if (d.length >= 12 && d.length <= 13) return d;
    return null;
  }
  while (d.startsWith('0')) d = d.slice(1);
  if (d.length >= 10 && d.length <= 11) return `55${d}`;
  return null;
}

/** Exibição amigável a partir de E.164 só dígitos. */
export function formatBrazilDisplay(e164Digits: string): string {
  const d = e164Digits.replace(/\D/g, '');
  if (!d.startsWith('55') || d.length < 12) return e164Digits;
  const local = d.slice(2);
  const ddd = local.slice(0, 2);
  const rest = local.slice(2);
  if (rest.length === 8) return `+55 (${ddd}) ${rest.slice(0, 4)}-${rest.slice(4)}`;
  if (rest.length === 9) return `+55 (${ddd}) ${rest.slice(0, 5)}-${rest.slice(5)}`;
  return `+55 ${local}`;
}
