import type {
  EmailTemplate,
  EmailTemplateForm,
  EmailTemplateFormErrors,
  EmailTemplatePreviewValues,
  EmailTemplateVariabile,
} from "@/types/email-template";
import { EMAIL_TEMPLATE_VARIABILI } from "@/lib/email-template/constants";

export const EMAIL_TEMPLATE_PREVIEW_VALUES: EmailTemplatePreviewValues = {
  nome: "Marco Rossi",
  tour: "Dolomiti Explorer",
  partenza: "15 settembre 2026",
  saldo: "€ 1.250",
  guida: "Laura Bianchi",
  telefono: "+39 333 987 6543",
};

export function createEmailTemplateId(): string {
  return `etpl-${crypto.randomUUID()}`;
}

export function createEmailTemplate(
  data: Omit<EmailTemplate, "id" | "creatoIl" | "aggiornatoIl">,
): EmailTemplate {
  const now = new Date().toISOString();

  return {
    id: createEmailTemplateId(),
    ...data,
    creatoIl: now,
    aggiornatoIl: now,
  };
}

export function duplicateEmailTemplate(template: EmailTemplate): EmailTemplate {
  return createEmailTemplate({
    titolo: `${template.titolo} (copia)`,
    oggetto: template.oggetto,
    corpoHtml: template.corpoHtml,
    categoria: template.categoria,
  });
}

export function variabileToken(variabile: EmailTemplateVariabile): string {
  return `{{${variabile}}}`;
}

export function sostituisciVariabili(
  testo: string,
  valori: EmailTemplatePreviewValues,
): string {
  let risultato = testo;

  for (const variabile of EMAIL_TEMPLATE_VARIABILI) {
    risultato = risultato.replaceAll(
      variabileToken(variabile),
      valori[variabile],
    );
  }

  return risultato;
}

export function renderAnteprimaTemplate(
  oggetto: string,
  corpoHtml: string,
  valori: EmailTemplatePreviewValues = EMAIL_TEMPLATE_PREVIEW_VALUES,
): { oggetto: string; corpoHtml: string } {
  return {
    oggetto: sostituisciVariabili(oggetto, valori),
    corpoHtml: sostituisciVariabili(corpoHtml, valori),
  };
}

export function validateEmailTemplateForm(
  form: EmailTemplateForm,
): EmailTemplateFormErrors {
  const errors: EmailTemplateFormErrors = {};

  if (!form.titolo.trim()) {
    errors.titolo = "Il titolo è obbligatorio.";
  }

  if (!form.oggetto.trim()) {
    errors.oggetto = "L'oggetto è obbligatorio.";
  }

  if (!form.corpoHtml.trim()) {
    errors.corpoHtml = "Il corpo del messaggio è obbligatorio.";
  }

  return errors;
}

export function hasEmailTemplateFormErrors(
  errors: EmailTemplateFormErrors,
): boolean {
  return Object.keys(errors).length > 0;
}
