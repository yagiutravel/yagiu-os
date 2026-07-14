import type { AuditLogEntry } from "@/types/audit-log";

export function createAuditLogId(): string {
  return `alog-${crypto.randomUUID()}`;
}

export function createAuditLogEntry(
  data: Omit<AuditLogEntry, "id" | "creatoIl">,
): AuditLogEntry {
  return {
    id: createAuditLogId(),
    ...data,
    creatoIl: data.data,
  };
}

export function formatAuditLogData(isoDate: string): string {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("it-IT", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatAuditLogOra(isoDate: string): string {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleTimeString("it-IT", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function sortAuditLogEntries(
  entries: AuditLogEntry[],
): AuditLogEntry[] {
  return [...entries].sort(
    (a, b) => new Date(b.data).getTime() - new Date(a.data).getTime(),
  );
}
