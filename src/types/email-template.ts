export type EmailTemplateCategoria =
  | "prenotazione"
  | "pagamenti"
  | "documenti"
  | "partenza"
  | "post_viaggio"
  | "generale";

export type EmailTemplateVariabile =
  | "nome"
  | "tour"
  | "partenza"
  | "saldo"
  | "guida"
  | "telefono";

/** Record template email — pronto per tabella Supabase `email_templates`. */
export type EmailTemplate = {
  id: string;
  titolo: string;
  oggetto: string;
  corpoHtml: string;
  categoria: EmailTemplateCategoria;
  creatoIl: string;
  aggiornatoIl: string;
};

export type EmailTemplateForm = {
  titolo: string;
  oggetto: string;
  corpoHtml: string;
  categoria: EmailTemplateCategoria;
};

export type EmailTemplateFormErrors = Partial<
  Record<keyof EmailTemplateForm, string>
>;

export type EmailTemplatePreviewValues = Record<EmailTemplateVariabile, string>;

/** Shape prevista per Supabase — non collegata ancora. */
export type EmailTemplateRow = {
  id: string;
  titolo: string;
  oggetto: string;
  corpo_html: string;
  categoria: EmailTemplateCategoria;
  creato_il: string;
  aggiornato_il: string;
};
