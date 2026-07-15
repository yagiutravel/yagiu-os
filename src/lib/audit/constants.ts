import type {
  AuditLogAzioneTipo,
  AuditLogEntitaTipo,
} from "@/types/audit-log";

export const AUDIT_UTENTE_SISTEMA = "Sistema Yagiu OS";

export type RecordAuditLogInput = {
  azione: string;
  tipo: AuditLogEntitaTipo;
  azioneTipo: AuditLogAzioneTipo;
  entitaId?: string | null;
  entitaLabel: string;
  utente?: string;
};
