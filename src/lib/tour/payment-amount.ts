/** Conversione importi pagamento UI (euro) ↔ DB (centesimi). */
export function eurosToCents(amount: number): number {
  return Math.round(amount * 100);
}

export function centsToEuros(cents: number): number {
  return cents / 100;
}
