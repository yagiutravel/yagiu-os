import type {
  InviaWhatsAppForm,
  InviaWhatsAppFormErrors,
  WhatsAppStato,
  WhatsAppVariabile,
} from "@/types/whatsapp";

export const WHATSAPP_VARIABILI: WhatsAppVariabile[] = [
  "nome",
  "tour",
  "partenza",
];

export const WHATSAPP_PREVIEW_VALUES: Record<WhatsAppVariabile, string> = {
  nome: "Marco Rossi",
  tour: "Dolomiti Explorer",
  partenza: "15 settembre 2026",
};

export const WHATSAPP_EMOJI = ["👋", "✈️", "🌏", "📅", "✅", "🙏", "😊", "🎒"];

export const WHATSAPP_STATO_LABELS: Record<WhatsAppStato, string> = {
  inviato: "Inviato",
  consegnato: "Consegnato",
  letto: "Letto",
  in_coda: "In coda",
  fallito: "Fallito",
};

export const EMPTY_INVIA_WHATSAPP_FORM: InviaWhatsAppForm = {
  messaggio: "",
  templateId: "",
};

export function createWhatsAppId(prefix: string): string {
  return `${prefix}-${crypto.randomUUID()}`;
}

export function variabileToken(variabile: WhatsAppVariabile): string {
  return `{{${variabile}}}`;
}

export function sostituisciVariabiliWhatsApp(
  testo: string,
  valori: Record<WhatsAppVariabile, string>,
): string {
  let risultato = testo;
  for (const variabile of WHATSAPP_VARIABILI) {
    risultato = risultato.replaceAll(variabileToken(variabile), valori[variabile]);
  }
  return risultato;
}

export function validateInviaWhatsAppForm(
  form: InviaWhatsAppForm,
): InviaWhatsAppFormErrors {
  const errors: InviaWhatsAppFormErrors = {};
  if (!form.messaggio.trim()) {
    errors.messaggio = "Il messaggio è obbligatorio.";
  }
  return errors;
}

export function hasInviaWhatsAppFormErrors(
  errors: InviaWhatsAppFormErrors,
): boolean {
  return Object.keys(errors).length > 0;
}

export function formatWhatsAppData(isoDate: string): string {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("it-IT", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatWhatsAppOra(isoDate: string): string {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleTimeString("it-IT", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function buildAnteprimaWhatsApp(messaggio: string, max = 80): string {
  const plain = messaggio.trim();
  if (plain.length <= max) return plain;
  return `${plain.slice(0, max)}…`;
}
