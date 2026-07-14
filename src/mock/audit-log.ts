import { createAuditLogEntry } from "@/models/audit-log";
import type { AuditLogEntry } from "@/types/audit-log";

const auditStore: AuditLogEntry[] = [];
let seeded = false;

function hoursAgo(hours: number): string {
  const date = new Date();
  date.setHours(date.getHours() - hours);
  return date.toISOString();
}

function daysAgo(days: number, hour = 10): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(hour, 30, 0, 0);
  return date.toISOString();
}

function seedAuditLog(): void {
  if (seeded) return;

  const entries: Array<Omit<AuditLogEntry, "id" | "creatoIl">> = [
    {
      utente: "Laura Bianchi",
      azione: "Marco Rossi modificato",
      tipo: "cliente",
      azioneTipo: "modificato",
      entitaId: "cliente-1",
      entitaLabel: "Marco Rossi",
      data: hoursAgo(1),
    },
    {
      utente: "Marco Rossi",
      azione: "Pagamento aggiornato",
      tipo: "pagamento",
      azioneTipo: "aggiornato",
      entitaId: "pay-1",
      entitaLabel: "Acconto tour Dolomiti",
      data: hoursAgo(3),
    },
    {
      utente: "Giulia Verdi",
      azione: "Camera cambiata",
      tipo: "camera",
      azioneTipo: "cambiato",
      entitaId: "cam-2",
      entitaLabel: "Camera 203 — Hotel Alpino",
      data: hoursAgo(5),
    },
    {
      utente: "Laura Bianchi",
      azione: "Tour creato",
      tipo: "tour",
      azioneTipo: "creato",
      entitaId: "tour-4",
      entitaLabel: "Giappone Autunno 2026",
      data: hoursAgo(8),
    },
    {
      utente: "Andrea Neri",
      azione: "Documento eliminato",
      tipo: "documento",
      azioneTipo: "eliminato",
      entitaId: "doc-5",
      entitaLabel: "Visto scaduto — Laura Bianchi",
      data: hoursAgo(12),
    },
    {
      utente: "Marco Rossi",
      azione: "Partecipante aggiunto al tour",
      tipo: "partecipante",
      azioneTipo: "creato",
      entitaId: "part-3",
      entitaLabel: "Giulia Verdi — Dolomiti Explorer",
      data: daysAgo(1, 14),
    },
    {
      utente: "Laura Bianchi",
      azione: "Email inviata a Marco Rossi",
      tipo: "comunicazione",
      azioneTipo: "inviato",
      entitaId: "comm-1",
      entitaLabel: "Conferma prenotazione",
      data: daysAgo(1, 16),
    },
    {
      utente: "Giulia Verdi",
      azione: "Template email duplicato",
      tipo: "template_email",
      azioneTipo: "creato",
      entitaId: "etpl-2",
      entitaLabel: "Richiesta saldo (copia)",
      data: daysAgo(2, 9),
    },
    {
      utente: "Andrea Neri",
      azione: "Checklist pre-partenza completata",
      tipo: "checklist",
      azioneTipo: "completato",
      entitaId: "tour-1",
      entitaLabel: "Dolomiti Explorer",
      data: daysAgo(2, 17),
    },
    {
      utente: "Marco Rossi",
      azione: "Giulia Verdi modificata",
      tipo: "cliente",
      azioneTipo: "modificato",
      entitaId: "cliente-2",
      entitaLabel: "Giulia Verdi",
      data: daysAgo(3, 11),
    },
    {
      utente: "Laura Bianchi",
      azione: "Pagamento registrato",
      tipo: "pagamento",
      azioneTipo: "creato",
      entitaId: "pay-4",
      entitaLabel: "Saldo Giappone Primavera",
      data: daysAgo(4, 15),
    },
    {
      utente: "Sistema",
      azione: "Backup automatico completato",
      tipo: "generale",
      azioneTipo: "completato",
      entitaId: null,
      entitaLabel: "Backup giornaliero",
      data: daysAgo(5, 3),
    },
  ];

  auditStore.push(...entries.map(createAuditLogEntry));
  seeded = true;
}

export function listAuditLogMock(): AuditLogEntry[] {
  seedAuditLog();
  return [...auditStore];
}

export function resetAuditLogMockForTests(): void {
  auditStore.length = 0;
  seeded = false;
}
