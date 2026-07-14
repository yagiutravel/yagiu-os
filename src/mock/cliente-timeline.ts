import { createClienteTimelineEvento } from "@/models/cliente-timeline";
import type { ClienteTimelineEvento } from "@/types/cliente-timeline";

const eventiStore: ClienteTimelineEvento[] = [];
const seededClienti = new Set<string>();

function daysAgo(days: number, hour = 10): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(hour, 0, 0, 0);
  return date.toISOString();
}

function seedTimelineForCliente(
  clienteId: string,
  nomeCliente: string,
): void {
  if (seededClienti.has(clienteId)) return;

  const isEven = clienteId.charCodeAt(clienteId.length - 1) % 2 === 0;
  const tour = isEven ? "Dolomiti Explorer" : "Giappone Primavera 2026";
  const staff = isEven ? "Laura Bianchi" : "Marco Rossi";
  const guida = isEven ? "Andrea Neri" : "Giulia Verdi";

  eventiStore.push(
    createClienteTimelineEvento({
      clienteId,
      tipo: "tour_concluso",
      titolo: "Tour concluso",
      descrizione: `${nomeCliente} ha completato il tour ${isEven ? "Bali 2025" : "Toscana 2025"} con feedback positivo.`,
      data: daysAgo(180, 18),
      utente: guida,
    }),
    createClienteTimelineEvento({
      clienteId,
      tipo: "checklist_completata",
      titolo: "Checklist pre-partenza completata",
      descrizione: "Tutti gli item della checklist operativa sono stati verificati e chiusi.",
      data: daysAgo(14, 16),
      utente: staff,
    }),
    createClienteTimelineEvento({
      clienteId,
      tipo: "whatsapp_inviato",
      titolo: "Promemoria partenza via WhatsApp",
      descrizione: `Inviato messaggio WhatsApp a ${nomeCliente} con punto di ritrovo e orario.`,
      data: daysAgo(10, 9),
      utente: staff,
    }),
    createClienteTimelineEvento({
      clienteId,
      tipo: "email_inviata",
      titolo: "Itinerario dettagliato inviato",
      descrizione: `Email con itinerario giorno per giorno, lista bagaglio e info pre-partenza.`,
      data: daysAgo(21, 14),
      utente: staff,
    }),
    createClienteTimelineEvento({
      clienteId,
      tipo: "camera_assegnata",
      titolo: "Camera assegnata",
      descrizione: isEven
        ? "Assegnata camera doppia — Hotel Alpino, piano 3."
        : "Assegnata camera singola — Ryokan Sakura, Kyoto.",
      data: daysAgo(28, 11),
      utente: staff,
    }),
    createClienteTimelineEvento({
      clienteId,
      tipo: "documento_caricato",
      titolo: "Passaporto caricato",
      descrizione: "Documento verificato dal team operativo. Validità confermata.",
      data: daysAgo(35, 10),
      utente: staff,
    }),
    createClienteTimelineEvento({
      clienteId,
      tipo: "pagamento",
      titolo: isEven ? "Saldo ricevuto" : "Acconto ricevuto",
      descrizione: isEven
        ? "Registrato saldo di € 1.250,00 tramite bonifico."
        : "Registrato acconto di € 1.500,00 tramite carta.",
      data: daysAgo(42, 15),
      utente: staff,
    }),
    createClienteTimelineEvento({
      clienteId,
      tipo: "iscritto_tour",
      titolo: "Iscrizione al tour confermata",
      descrizione: `${nomeCliente} iscritto al tour ${tour}.`,
      data: daysAgo(60, 10),
      utente: staff,
    }),
    createClienteTimelineEvento({
      clienteId,
      tipo: "cliente_creato",
      titolo: "Cliente creato",
      descrizione: `Anagrafica di ${nomeCliente} creata nel gestionale.`,
      data: daysAgo(90, 9),
      utente: "Sistema",
    }),
  );

  seededClienti.add(clienteId);
}

export function seedClienteTimelineMock(
  clienteId: string,
  nomeCliente: string,
): void {
  seedTimelineForCliente(clienteId, nomeCliente);
}

export function listEventiByClienteIdMock(
  clienteId: string,
  nomeCliente: string,
): ClienteTimelineEvento[] {
  seedTimelineForCliente(clienteId, nomeCliente);
  return eventiStore.filter((evento) => evento.clienteId === clienteId);
}

export function insertClienteTimelineEmailMock(input: {
  clienteId: string;
  oggetto: string;
  descrizione: string;
  utente: string;
}): ClienteTimelineEvento {
  const evento = createClienteTimelineEvento({
    clienteId: input.clienteId,
    tipo: "email_inviata",
    titolo: input.oggetto,
    descrizione: input.descrizione,
    data: new Date().toISOString(),
    utente: input.utente,
  });

  eventiStore.unshift(evento);
  return evento;
}

export function insertClienteTimelineWhatsAppMock(input: {
  clienteId: string;
  titolo: string;
  descrizione: string;
  utente: string;
}): ClienteTimelineEvento {
  const evento = createClienteTimelineEvento({
    clienteId: input.clienteId,
    tipo: "whatsapp_inviato",
    titolo: input.titolo,
    descrizione: input.descrizione,
    data: new Date().toISOString(),
    utente: input.utente,
  });

  eventiStore.unshift(evento);
  return evento;
}

export function listEventiMock(): ClienteTimelineEvento[] {
  return [...eventiStore];
}

export function resetClienteTimelineMockForTests(): void {
  eventiStore.length = 0;
  seededClienti.clear();
}
