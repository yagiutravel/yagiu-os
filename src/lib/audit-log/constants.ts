import type { AuditLogEntitaTipo } from "@/types/audit-log";

export const AUDIT_LOG_TIPO_FILTRI: Array<{
  value: AuditLogEntitaTipo | "tutti";
  label: string;
}> = [
  { value: "tutti", label: "Tutti" },
  { value: "cliente", label: "Cliente" },
  { value: "pagamento", label: "Pagamento" },
  { value: "camera", label: "Camera" },
  { value: "tour", label: "Tour" },
  { value: "documento", label: "Documento" },
  { value: "partecipante", label: "Partecipante" },
  { value: "comunicazione", label: "Comunicazione" },
  { value: "template_email", label: "Template email" },
  { value: "checklist", label: "Checklist" },
  { value: "preventivo", label: "Preventivo" },
  { value: "auth", label: "Autenticazione" },
  { value: "utente", label: "Utente" },
  { value: "generale", label: "Generale" },
];

export const AUDIT_LOG_TIPO_LABELS: Record<AuditLogEntitaTipo, string> = {
  cliente: "Cliente",
  pagamento: "Pagamento",
  camera: "Camera",
  tour: "Tour",
  documento: "Documento",
  partecipante: "Partecipante",
  comunicazione: "Comunicazione",
  template_email: "Template email",
  checklist: "Checklist",
  preventivo: "Preventivo",
  auth: "Autenticazione",
  utente: "Utente",
  generale: "Generale",
};
