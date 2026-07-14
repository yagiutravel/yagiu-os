import {
  COMUNICAZIONE_EVENTI_ORDINE,
  COMUNICAZIONE_EVENTO_LABELS,
  createComunicazione,
  createComunicazioneEvento,
} from "@/models/comunicazione";
import type {
  Comunicazione,
  ComunicazioneEventoTimeline,
  ComunicazioneEventoTipo,
} from "@/types/comunicazione";

const comunicazioniStore: Comunicazione[] = [];
const eventiStore: ComunicazioneEventoTimeline[] = [];
let seeded = false;

function daysAgo(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString();
}

function daysAhead(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString();
}

function buildEventiForCliente(
  clienteId: string,
  completatiFinoA: number,
): ComunicazioneEventoTimeline[] {
  return COMUNICAZIONE_EVENTI_ORDINE.map((tipo, index) => {
    const completato = index < completatiFinoA;
    const giorni = (completatiFinoA - index) * 3;

    return createComunicazioneEvento({
      clienteId,
      tipo,
      titolo: COMUNICAZIONE_EVENTO_LABELS[tipo],
      descrizione: completato
        ? `${COMUNICAZIONE_EVENTO_LABELS[tipo]} — completato.`
        : `${COMUNICAZIONE_EVENTO_LABELS[tipo]} — in attesa.`,
      completato,
      data: completato ? daysAgo(Math.max(giorni, 1)) : null,
    });
  });
}

function seedComunicazioniForCliente(
  clienteId: string,
  clienteNome: string,
  completatiFinoA: number,
): void {
  eventiStore.push(...buildEventiForCliente(clienteId, completatiFinoA));

  const pendingTypes: Array<{
    tipo: ComunicazioneEventoTipo;
    canale: Comunicazione["canale"];
    stato: Comunicazione["stato"];
    oggetto: string;
    anteprima: string;
    programmataIl: string | null;
    inviataIl: string | null;
  }> = [];

  if (completatiFinoA < 9) {
    const nextTipo = COMUNICAZIONE_EVENTI_ORDINE[completatiFinoA];

    pendingTypes.push({
      tipo: nextTipo,
      canale: "email",
      stato: "in_coda",
      oggetto: `${COMUNICAZIONE_EVENTO_LABELS[nextTipo]} — ${clienteNome}`,
      anteprima: `Gentile ${clienteNome}, le scriviamo per aggiornarla sullo stato del viaggio.`,
      programmataIl: null,
      inviataIl: null,
    });
  }

  if (completatiFinoA < 7) {
    pendingTypes.push({
      tipo: "reminder_partenza",
      canale: "reminder",
      stato: "programmata",
      oggetto: `Reminder partenza — ${clienteNome}`,
      anteprima: "Promemoria automatico: mancano 7 giorni alla partenza.",
      programmataIl: daysAhead(3),
      inviataIl: null,
    });
  }

  if (completatiFinoA >= 3 && completatiFinoA < 8) {
    pendingTypes.push({
      tipo: "saldo_richiesto",
      canale: "whatsapp",
      stato: completatiFinoA >= 5 ? "consegnata" : "in_coda",
      oggetto: `Saldo viaggio — ${clienteNome}`,
      anteprima: `Ciao ${clienteNome.split(" ")[0]}, ti ricordiamo il saldo del viaggio.`,
      programmataIl: null,
      inviataIl: completatiFinoA >= 5 ? daysAgo(2) : null,
    });
  }

  if (completatiFinoA >= 1) {
    pendingTypes.push({
      tipo: "conferma_prenotazione_inviata",
      canale: "email",
      stato: "inviata",
      oggetto: `Conferma prenotazione — ${clienteNome}`,
      anteprima: "La sua prenotazione è stata confermata. In allegato il riepilogo.",
      programmataIl: null,
      inviataIl: daysAgo(completatiFinoA * 4),
    });
  }

  for (const item of pendingTypes) {
    comunicazioniStore.push(
      createComunicazione({
        clienteId,
        canale: item.canale,
        tipo: item.tipo,
        stato: item.stato,
        oggetto: item.oggetto,
        anteprima: item.anteprima,
        programmataIl: item.programmataIl,
        inviataIl: item.inviataIl,
      }),
    );
  }
}

export function seedComunicazioniMock(
  clienti: Array<{ id: string; nome: string }>,
): void {
  if (seeded) return;

  const fallbackClienti = [
    { id: "mock-cliente-1", nome: "Marco Rossi" },
    { id: "mock-cliente-2", nome: "Laura Bianchi" },
    { id: "mock-cliente-3", nome: "Giulia Verdi" },
    { id: "mock-cliente-4", nome: "Andrea Neri" },
  ];

  const source = clienti.length > 0 ? clienti : fallbackClienti;
  const progressions = [9, 6, 4, 2];

  source.slice(0, 4).forEach((cliente, index) => {
    seedComunicazioniForCliente(
      cliente.id,
      cliente.nome,
      progressions[index] ?? 3,
    );
  });

  seeded = true;
}

export function listComunicazioniMock(): Comunicazione[] {
  return [...comunicazioniStore];
}

export function insertComunicazioneEmailMock(input: {
  clienteId: string;
  oggetto: string;
  anteprima: string;
}): Comunicazione {
  const now = new Date().toISOString();

  const comunicazione = createComunicazione({
    clienteId: input.clienteId,
    canale: "email",
    tipo: "conferma_prenotazione_inviata",
    stato: "inviata",
    oggetto: input.oggetto,
    anteprima: input.anteprima,
    programmataIl: null,
    inviataIl: now,
  });

  comunicazioniStore.unshift(comunicazione);
  return comunicazione;
}

export function insertComunicazioneWhatsAppMock(input: {
  clienteId: string;
  oggetto: string;
  anteprima: string;
}): Comunicazione {
  const now = new Date().toISOString();

  const comunicazione = createComunicazione({
    clienteId: input.clienteId,
    canale: "whatsapp",
    tipo: "saldo_richiesto",
    stato: "consegnata",
    oggetto: input.oggetto,
    anteprima: input.anteprima,
    programmataIl: null,
    inviataIl: now,
  });

  comunicazioniStore.unshift(comunicazione);
  return comunicazione;
}

export function listEventiByClienteIdMock(
  clienteId: string,
): ComunicazioneEventoTimeline[] {
  return eventiStore
    .filter((evento) => evento.clienteId === clienteId)
    .sort(
      (a, b) =>
        COMUNICAZIONE_EVENTI_ORDINE.indexOf(a.tipo) -
        COMUNICAZIONE_EVENTI_ORDINE.indexOf(b.tipo),
    );
}

export function listEventiMock(): ComunicazioneEventoTimeline[] {
  return [...eventiStore];
}

export function resetComunicazioniMockForTests(): void {
  comunicazioniStore.length = 0;
  eventiStore.length = 0;
  seeded = false;
}
