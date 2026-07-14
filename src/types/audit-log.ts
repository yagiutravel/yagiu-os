export type AuditLogEntitaTipo =
  | "cliente"
  | "pagamento"
  | "camera"
  | "tour"
  | "documento"
  | "partecipante"
  | "comunicazione"
  | "template_email"
  | "checklist"
  | "generale";

export type AuditLogAzioneTipo =
  | "creato"
  | "modificato"
  | "aggiornato"
  | "eliminato"
  | "assegnato"
  | "cambiato"
  | "inviato"
  | "completato";

/** Record audit log — pronto per tabella Supabase `audit_log`. */
export type AuditLogEntry = {
  id: string;
  utente: string;
  azione: string;
  tipo: AuditLogEntitaTipo;
  azioneTipo: AuditLogAzioneTipo;
  entitaId: string | null;
  entitaLabel: string;
  data: string;
  creatoIl: string;
};

export type AuditLogView = AuditLogEntry & {
  dataFormattata: string;
  oraFormattata: string;
};

/** Shape prevista per Supabase — non collegata ancora. */
export type AuditLogRow = {
  id: string;
  utente: string;
  azione: string;
  tipo: AuditLogEntitaTipo;
  azione_tipo: AuditLogAzioneTipo;
  entita_id: string | null;
  entita_label: string;
  data: string;
  creato_il: string;
};
