import type { DashboardSalutoPeriodo } from "@/types/dashboard";

export const DASHBOARD_USER_NAME = "Martino";

export const IMPORTO_ACCONTO_MEDIO = 850;
export const IMPORTO_SALDO_MEDIO = 2400;

export const AVVISO_LIVELLO_EMOJI = {
  critico: "🔴",
  attenzione: "🟠",
  avviso: "🟡",
  info: "🔵",
  success: "🟢",
} as const;

export function getSalutoPeriodo(date = new Date()): DashboardSalutoPeriodo {
  const hour = date.getHours();
  if (hour < 12) return "mattina";
  if (hour < 18) return "pomeriggio";
  return "sera";
}

export function getSalutoTesto(periodo: DashboardSalutoPeriodo): string {
  if (periodo === "mattina") return "Buongiorno";
  if (periodo === "pomeriggio") return "Buon pomeriggio";
  return "Buonasera";
}

export function formatGiorniMancanti(giorni: number): string {
  if (giorni === 0) return "Oggi";
  if (giorni === 1) return "Domani";
  return `${giorni} giorni`;
}

export function formatImportoEuro(importo: number): string {
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(importo);
}

export function formatOraRelativa(isoDate: string, now = new Date()): string {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return "—";

  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 1) return "Adesso";
  if (diffMin < 60) return `${diffMin} min fa`;

  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours} ore fa`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return "Ieri";
  if (diffDays < 7) return `${diffDays} giorni fa`;

  return date.toLocaleDateString("it-IT", {
    day: "numeric",
    month: "short",
  });
}

export function calcolaGiorniMancanti(
  dataPartenza: string,
  now = new Date(),
): number {
  const partenza = new Date(`${dataPartenza}T00:00:00`);
  const oggi = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diff = partenza.getTime() - oggi.getTime();
  return Math.max(0, Math.ceil(diff / 86400000));
}
