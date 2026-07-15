import {
  formatAuditLogData,
  formatAuditLogOra,
  sortAuditLogEntries,
} from "@/models/audit-log";
import type {
  AuditLogEntry,
  AuditLogRow,
  AuditLogView,
} from "@/types/audit-log";

export function mapAuditLogEntryToView(entry: AuditLogEntry): AuditLogView {
  return {
    ...entry,
    dataFormattata: formatAuditLogData(entry.data),
    oraFormattata: formatAuditLogOra(entry.data),
  };
}

export function mapAuditLogEntriesToViews(
  entries: AuditLogEntry[],
): AuditLogView[] {
  return sortAuditLogEntries(entries).map(mapAuditLogEntryToView);
}

/** Mapper Supabase audit_log → dominio UI. */
export function mapAuditLogRowToEntry(row: AuditLogRow): AuditLogEntry {
  return {
    id: row.id,
    utente: row.utente,
    azione: row.azione,
    tipo: row.tipo,
    azioneTipo: row.azione_tipo,
    entitaId: row.entita_id,
    entitaLabel: row.entita_label,
    data: row.data,
    creatoIl: row.creato_il,
  };
}
