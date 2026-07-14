import { createSchedulazione } from "@/models/schedulazione";
import type {
  CreateSchedulazioneInput,
  Schedulazione,
} from "@/types/schedulazione";

const schedulazioniStore: Schedulazione[] = [];
let seeded = false;

function daysFromNow(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function daysAgo(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().slice(0, 10);
}

const SEED_DATA: CreateSchedulazioneInput[] = [
  {
    titolo: "Conferma prenotazione",
    clienteId: "mock-c1",
    clienteNome: "Marco Rossi",
    tourId: "tour-1",
    tourNome: "Tour del Giappone — Primavera 2026",
    tipo: "email",
    data: daysFromNow(2),
    ora: "10:00",
    stato: "programmata",
  },
  {
    titolo: "Promemoria partenza",
    clienteId: "mock-c2",
    clienteNome: "Laura Bianchi",
    tourId: "tour-1",
    tourNome: "Tour del Giappone — Primavera 2026",
    tipo: "whatsapp",
    data: daysFromNow(5),
    ora: "14:30",
    stato: "programmata",
  },
  {
    titolo: "Reminder saldo",
    clienteId: "mock-c3",
    clienteNome: "Giulia Verdi",
    tourId: "tour-3",
    tourNome: "Trekking Himalaya",
    tipo: "reminder",
    data: daysFromNow(1),
    ora: "09:00",
    stato: "programmata",
  },
  {
    titolo: "Itinerario dettagliato",
    clienteId: "mock-c1",
    clienteNome: "Marco Rossi",
    tourId: "tour-1",
    tourNome: "Tour del Giappone — Primavera 2026",
    tipo: "email",
    data: daysAgo(3),
    ora: "11:00",
    stato: "inviata",
  },
  {
    titolo: "Documenti richiesti",
    clienteId: "mock-c4",
    clienteNome: "Andrea Neri",
    tourId: "tour-3",
    tourNome: "Trekking Himalaya",
    tipo: "whatsapp",
    data: daysAgo(5),
    ora: "16:00",
    stato: "inviata",
  },
  {
    titolo: "Checklist pre-partenza",
    clienteId: "mock-c2",
    clienteNome: "Laura Bianchi",
    tourId: "tour-1",
    tourNome: "Tour del Giappone — Primavera 2026",
    tipo: "reminder",
    data: daysAgo(1),
    ora: "08:30",
    stato: "inviata",
  },
  {
    titolo: "Reinvio conferma",
    clienteId: "mock-c3",
    clienteNome: "Giulia Verdi",
    tourId: null,
    tourNome: null,
    tipo: "email",
    data: daysAgo(7),
    ora: "10:15",
    stato: "fallita",
  },
  {
    titolo: "Messaggio benvenuto",
    clienteId: "mock-c4",
    clienteNome: "Andrea Neri",
    tourId: "tour-2",
    tourNome: "Bali Esotica 2026",
    tipo: "whatsapp",
    data: daysAgo(10),
    ora: "12:00",
    stato: "fallita",
  },
  {
    titolo: "Bozza saldo viaggio",
    clienteId: "mock-c1",
    clienteNome: "Marco Rossi",
    tourId: "tour-1",
    tourNome: "Tour del Giappone — Primavera 2026",
    tipo: "email",
    data: daysFromNow(7),
    ora: "15:00",
    stato: "bozza",
  },
  {
    titolo: "Bozza reminder documenti",
    clienteId: "mock-c2",
    clienteNome: "Laura Bianchi",
    tourId: "tour-3",
    tourNome: "Trekking Himalaya",
    tipo: "reminder",
    data: daysFromNow(10),
    ora: "09:30",
    stato: "bozza",
  },
];

function seedSchedulazioni(): void {
  if (seeded) return;
  schedulazioniStore.push(...SEED_DATA.map(createSchedulazione));
  seeded = true;
}

export function listSchedulazioniMock(): Schedulazione[] {
  seedSchedulazioni();
  return [...schedulazioniStore];
}

export function createSchedulazioneMock(
  input: CreateSchedulazioneInput,
): Schedulazione {
  seedSchedulazioni();
  const item = createSchedulazione(input);
  schedulazioniStore.unshift(item);
  return item;
}

export function resetSchedulazioniMockForTests(): void {
  schedulazioniStore.length = 0;
  seeded = false;
}
