import type { InviaEmailForm, InviaEmailFormErrors } from "@/types/email-invio";

export const MOCK_ALLEGATI_DISPONIBILI = [
  { id: "itinerario", nome: "itinerario-viaggio.pdf", dimensione: "245 KB" },
  { id: "contratto", nome: "contratto-prenotazione.pdf", dimensione: "128 KB" },
  { id: "assicurazione", nome: "assicurazione-viaggio.pdf", dimensione: "89 KB" },
  { id: "lista-bagaglio", nome: "lista-bagaglio.pdf", dimensione: "56 KB" },
];

export const EMPTY_INVIA_EMAIL_FORM: InviaEmailForm = {
  destinatario: "",
  oggetto: "",
  templateId: "",
  messaggio: "",
  allegati: [],
};

export function createEmailInvioId(): string {
  return `einv-${crypto.randomUUID()}`;
}

export function htmlToPlainText(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function validateInviaEmailForm(
  form: InviaEmailForm,
): InviaEmailFormErrors {
  const errors: InviaEmailFormErrors = {};

  if (!form.destinatario.trim()) {
    errors.destinatario = "Il destinatario è obbligatorio.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.destinatario.trim())) {
    errors.destinatario = "Inserisci un indirizzo email valido.";
  }

  if (!form.oggetto.trim()) {
    errors.oggetto = "L'oggetto è obbligatorio.";
  }

  if (!form.messaggio.trim()) {
    errors.messaggio = "Il messaggio è obbligatorio.";
  }

  return errors;
}

export function hasInviaEmailFormErrors(errors: InviaEmailFormErrors): boolean {
  return Object.keys(errors).length > 0;
}

export function buildAnteprimaMessaggio(messaggio: string, max = 120): string {
  const plain = messaggio.trim();
  if (plain.length <= max) return plain;
  return `${plain.slice(0, max)}…`;
}
