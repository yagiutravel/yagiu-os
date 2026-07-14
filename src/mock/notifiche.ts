import { createNotifica } from "@/models/notifica";
import type { Notifica } from "@/types/notifica";

const notificheStore: Notifica[] = [];
let seeded = false;

function hoursAgo(hours: number): string {
  const date = new Date();
  date.setHours(date.getHours() - hours);
  return date.toISOString();
}

function daysAgo(days: number, hour = 10): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(hour, 0, 0, 0);
  return date.toISOString();
}

function seedNotifiche(): void {
  if (seeded) return;

  const entries: Array<Omit<Notifica, "id" | "creatoIl">> = [
    {
      tipo: "saldo_mancante",
      titolo: "Saldo mancante",
      messaggio: "Marco Rossi — Dolomiti Explorer: saldo di € 1.250,00 da incassare.",
      href: "/tour/tour-1",
      letta: false,
      data: hoursAgo(1),
    },
    {
      tipo: "documento_scadenza",
      titolo: "Documento in scadenza",
      messaggio: "Passaporto di Laura Bianchi scade tra 45 giorni.",
      href: "/clienti/2",
      letta: false,
      data: hoursAgo(3),
    },
    {
      tipo: "tour_partenza",
      titolo: "Tour in partenza",
      messaggio: "Dolomiti Explorer parte tra 7 giorni — 12 partecipanti confermati.",
      href: "/tour/tour-1",
      letta: false,
      data: hoursAgo(5),
    },
    {
      tipo: "camera_incompleta",
      titolo: "Camera incompleta",
      messaggio: "Camera 203 — Hotel Alpino: 1 posto libero, assegnazione incompleta.",
      href: "/tour/tour-1",
      letta: false,
      data: hoursAgo(8),
    },
    {
      tipo: "pagamento_ricevuto",
      titolo: "Pagamento ricevuto",
      messaggio: "Giulia Verdi ha versato l'acconto di € 1.500,00 per Giappone Primavera.",
      href: "/tour/tour-3",
      letta: true,
      data: hoursAgo(12),
    },
    {
      tipo: "cliente_nuovo",
      titolo: "Cliente nuovo",
      messaggio: "Andrea Neri aggiunto all'anagrafica come Prospect.",
      href: "/clienti/4",
      letta: true,
      data: daysAgo(1, 14),
    },
    {
      tipo: "saldo_mancante",
      titolo: "Saldo mancante",
      messaggio: "Giulia Verdi — Giappone Primavera: 3 partecipanti con saldo pendente.",
      href: "/tour/tour-3",
      letta: true,
      data: daysAgo(2, 9),
    },
    {
      tipo: "tour_partenza",
      titolo: "Tour in partenza",
      messaggio: "Giappone Primavera 2026 — checklist pre-partenza al 80%.",
      href: "/tour/tour-3",
      letta: true,
      data: daysAgo(3, 11),
    },
  ];

  notificheStore.push(...entries.map(createNotifica));
  seeded = true;
}

export function listNotificheMock(): Notifica[] {
  seedNotifiche();
  return [...notificheStore];
}

export function findNotificaByIdMock(id: string): Notifica | undefined {
  seedNotifiche();
  return notificheStore.find((item) => item.id === id);
}

export function markNotificaAsReadMock(id: string): Notifica | null {
  seedNotifiche();
  const index = notificheStore.findIndex((item) => item.id === id);
  if (index === -1) return null;

  notificheStore[index] = {
    ...notificheStore[index],
    letta: true,
  };
  return notificheStore[index];
}

export function markAllNotificheAsReadMock(): void {
  seedNotifiche();
  for (let i = 0; i < notificheStore.length; i += 1) {
    notificheStore[i] = { ...notificheStore[i], letta: true };
  }
}

export function resetNotificheMockForTests(): void {
  notificheStore.length = 0;
  seeded = false;
}
