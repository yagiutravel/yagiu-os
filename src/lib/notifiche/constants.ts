import type { NotificaTipo } from "@/types/notifica";

export const NOTIFICA_TIPO_FILTRI: Array<{
  value: NotificaTipo | "tutti";
  label: string;
}> = [
  { value: "tutti", label: "Tutti" },
  { value: "saldo_mancante", label: "Saldo mancante" },
  { value: "documento_scadenza", label: "Documento in scadenza" },
  { value: "tour_partenza", label: "Tour in partenza" },
  { value: "camera_incompleta", label: "Camera incompleta" },
  { value: "pagamento_ricevuto", label: "Pagamento ricevuto" },
  { value: "cliente_nuovo", label: "Cliente nuovo" },
];

export const NOTIFICA_STATO_FILTRI: Array<{
  value: "tutte" | "lette" | "non_lette";
  label: string;
}> = [
  { value: "tutte", label: "Tutte" },
  { value: "non_lette", label: "Non lette" },
  { value: "lette", label: "Lette" },
];

export const NOTIFICA_TIPO_LABELS: Record<NotificaTipo, string> = {
  saldo_mancante: "Saldo mancante",
  documento_scadenza: "Documento in scadenza",
  tour_partenza: "Tour in partenza",
  camera_incompleta: "Camera incompleta",
  pagamento_ricevuto: "Pagamento ricevuto",
  cliente_nuovo: "Cliente nuovo",
};
