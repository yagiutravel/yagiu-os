export type WhatsAppStato = "inviato" | "consegnato" | "letto" | "in_coda" | "fallito";

export type WhatsAppVariabile = "nome" | "tour" | "partenza";

/** Conversazione WhatsApp per cliente — pronto per tabella Supabase `whatsapp_conversazioni`. */
export type WhatsAppConversazione = {
  id: string;
  clienteId: string;
  clienteNome: string;
  numero: string;
  ultimoMessaggio: string;
  data: string;
  stato: WhatsAppStato;
  aggiornatoIl: string;
};

export type WhatsAppConversazioneView = WhatsAppConversazione & {
  dataFormattata: string;
  oraFormattata: string;
};

export type WhatsAppTemplate = {
  id: string;
  titolo: string;
  messaggio: string;
};

export type WhatsAppInvio = {
  id: string;
  clienteId: string;
  numero: string;
  messaggio: string;
  templateId: string | null;
  utente: string;
  inviatoIl: string;
  creatoIl: string;
};

export type InviaWhatsAppInput = {
  clienteId: string;
  clienteNome: string;
  numero: string;
  messaggio: string;
  templateId: string | null;
  utente: string;
};

export type InviaWhatsAppForm = {
  messaggio: string;
  templateId: string;
};

export type InviaWhatsAppFormErrors = Partial<
  Record<"messaggio" | "numero", string>
>;

/** Shape prevista per Supabase — non collegata ancora. */
export type WhatsAppConversazioneRow = {
  id: string;
  cliente_id: string;
  numero: string;
  ultimo_messaggio: string;
  data: string;
  stato: WhatsAppStato;
  aggiornato_il: string;
};

export type WhatsAppInvioRow = {
  id: string;
  cliente_id: string;
  numero: string;
  messaggio: string;
  template_id: string | null;
  utente: string;
  inviato_il: string;
  creato_il: string;
};

export type WhatsAppTemplateRow = {
  id: string;
  titolo: string;
  messaggio: string;
  creato_il: string;
  aggiornato_il: string;
};
