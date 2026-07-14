/** Record invio email — pronto per tabella Supabase `email_invii`. */
export type EmailInvio = {
  id: string;
  clienteId: string;
  destinatario: string;
  oggetto: string;
  messaggio: string;
  templateId: string | null;
  allegati: string[];
  utente: string;
  inviataIl: string;
  creatoIl: string;
};

export type InviaEmailInput = {
  clienteId: string;
  clienteNome: string;
  destinatario: string;
  oggetto: string;
  messaggio: string;
  templateId: string | null;
  allegati: string[];
  utente: string;
};

export type InviaEmailForm = {
  destinatario: string;
  oggetto: string;
  templateId: string;
  messaggio: string;
  allegati: string[];
};

export type InviaEmailFormErrors = Partial<
  Record<"destinatario" | "oggetto" | "messaggio", string>
>;

export type MockAllegato = {
  id: string;
  nome: string;
  dimensione: string;
};

/** Shape prevista per Supabase — non collegata ancora. */
export type EmailInvioRow = {
  id: string;
  cliente_id: string;
  destinatario: string;
  oggetto: string;
  messaggio: string;
  template_id: string | null;
  allegati: string[];
  utente: string;
  inviata_il: string;
  creato_il: string;
};
