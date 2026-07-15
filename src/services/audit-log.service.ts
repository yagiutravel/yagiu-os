import { fetchAuditLogRows } from "@/services/audit-log-record.service";
import { mapAuditLogEntriesToViews, mapAuditLogRowToEntry } from "@/mappers/audit-log.mapper";
import { listAuditLogMock } from "@/mock/audit-log";
import type { AuditLogEntitaTipo, AuditLogView } from "@/types/audit-log";

export class AuditLogServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuditLogServiceError";
  }
}

export async function getAuditLogEntries(): Promise<AuditLogView[]> {
  const rows = await fetchAuditLogRows();
  if (rows.length > 0) {
    return mapAuditLogEntriesToViews(rows.map(mapAuditLogRowToEntry));
  }
  return mapAuditLogEntriesToViews(listAuditLogMock());
}

export function filterAuditLogEntries(
  entries: AuditLogView[],
  search: string,
  tipo: AuditLogEntitaTipo | "tutti",
): AuditLogView[] {
  const query = search.trim().toLowerCase();

  return entries.filter((entry) => {
    const matchesTipo = tipo === "tutti" || entry.tipo === tipo;
    if (!matchesTipo) return false;
    if (!query) return true;

    return (
      entry.azione.toLowerCase().includes(query) ||
      entry.utente.toLowerCase().includes(query) ||
      entry.entitaLabel.toLowerCase().includes(query)
    );
  });
}
