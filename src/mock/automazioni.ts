import { createAutomazione } from "@/models/automazione";
import type {
  Automazione,
  CreateAutomazioneInput,
} from "@/types/automazione";

const automazioniStore: Automazione[] = [];
let seeded = false;

function hoursAgo(hours: number): string {
  const date = new Date();
  date.setHours(date.getHours() - hours);
  return date.toISOString();
}

function daysAgo(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString();
}

const SEED_DATA: Array<CreateAutomazioneInput & { ultimaEsecuzione?: string }> =
  [
    {
      nome: "Reminder saldo in sospeso",
      trigger: "saldo_mancante",
      azione: "invia_reminder",
      stato: "attivo",
      ultimaEsecuzione: hoursAgo(6),
    },
    {
      nome: "Avviso scadenza passaporto",
      trigger: "passaporto_scadenza",
      azione: "crea_notifica",
      stato: "attivo",
      ultimaEsecuzione: daysAgo(1),
    },
    {
      nome: "Email pre-partenza",
      trigger: "una_settimana_mancante",
      azione: "invia_email",
      stato: "attivo",
      ultimaEsecuzione: daysAgo(2),
    },
    {
      nome: "Richiesta recensione post-tour",
      trigger: "tour_terminato",
      azione: "invia_richiesta_recensione",
      stato: "attivo",
      ultimaEsecuzione: daysAgo(5),
    },
    {
      nome: "Reminder saldo — secondo invio",
      trigger: "saldo_mancante",
      azione: "invia_email",
      stato: "inattivo",
      ultimaEsecuzione: daysAgo(14),
    },
    {
      nome: "Notifica documenti mancanti",
      trigger: "passaporto_scadenza",
      azione: "invia_reminder",
      stato: "inattivo",
      ultimaEsecuzione: daysAgo(30),
    },
    {
      nome: "Bozza follow-up partenza",
      trigger: "una_settimana_mancante",
      azione: "invia_reminder",
      stato: "bozza",
    },
    {
      nome: "Bozza recensione tour",
      trigger: "tour_terminato",
      azione: "invia_richiesta_recensione",
      stato: "bozza",
    },
  ];

function seedAutomazioni(): void {
  if (seeded) return;

  for (const item of SEED_DATA) {
    const { ultimaEsecuzione, ...input } = item;
    const created = createAutomazione(input);
    if (ultimaEsecuzione) {
      created.ultimaEsecuzione = ultimaEsecuzione;
    }
    automazioniStore.push(created);
  }

  seeded = true;
}

export function listAutomazioniMock(): Automazione[] {
  seedAutomazioni();
  return [...automazioniStore];
}

export function createAutomazioneMock(
  input: CreateAutomazioneInput,
): Automazione {
  seedAutomazioni();
  const item = createAutomazione(input);
  automazioniStore.unshift(item);
  return item;
}

export function resetAutomazioniMockForTests(): void {
  automazioniStore.length = 0;
  seeded = false;
}
