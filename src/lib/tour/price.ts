export function parsePrezzoToCents(prezzo: string): number {
  const normalized = prezzo.replace(/\s/g, "").replace(",", ".");
  const match = normalized.match(/(\d+(?:\.\d+)?)/);
  if (!match) return 0;

  const amount = Number.parseFloat(match[1]);
  if (Number.isNaN(amount)) return 0;

  return Math.round(amount * 100);
}

export function formatCentsToPrezzo(cents: number, valuta = "EUR"): string {
  const amount = cents / 100;
  const formatted = new Intl.NumberFormat("it-IT", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);

  if (valuta === "EUR") return `€ ${formatted}`;
  return `${formatted} ${valuta}`;
}
