import {
  createWhatsAppId,
  WHATSAPP_PREVIEW_VALUES,
} from "@/models/whatsapp";
import type {
  WhatsAppConversazione,
  WhatsAppInvio,
  WhatsAppTemplate,
} from "@/types/whatsapp";

const conversazioniStore: WhatsAppConversazione[] = [];
const inviiStore: WhatsAppInvio[] = [];
let seeded = false;

const TEMPLATES: WhatsAppTemplate[] = [
  {
    id: "wtpl-1",
    titolo: "Promemoria partenza",
    messaggio:
      "Ciao {{nome}}! 👋 Manca poco per {{tour}} in partenza il {{partenza}}. Tutto pronto?",
  },
  {
    id: "wtpl-2",
    titolo: "Richiesta documenti",
    messaggio:
      "Buongiorno {{nome}}, per {{tour}} ci servono i documenti aggiornati. Grazie! 📄",
  },
  {
    id: "wtpl-3",
    titolo: "Conferma iscrizione",
    messaggio:
      "Ciao {{nome}}! ✅ Iscrizione confermata per {{tour}} — partenza {{partenza}}.",
  },
];

function hoursAgo(hours: number): string {
  const date = new Date();
  date.setHours(date.getHours() - hours);
  return date.toISOString();
}

function seedConversazioni(
  clienti: Array<{ id: string; nome: string; telefono: string }>,
): void {
  if (seeded) return;

  const fallback = [
    { id: "mock-wa-1", nome: "Marco Rossi", telefono: "+39 340 123 4567" },
    { id: "mock-wa-2", nome: "Laura Bianchi", telefono: "+39 333 987 6543" },
    { id: "mock-wa-3", nome: "Giulia Verdi", telefono: "+39 347 555 1212" },
    { id: "mock-wa-4", nome: "Andrea Neri", telefono: "+39 320 444 8899" },
  ];

  const source = clienti.length > 0 ? clienti : fallback;
  const stati: WhatsAppConversazione["stato"][] = [
    "letto",
    "consegnato",
    "inviato",
    "in_coda",
  ];
  const messaggi = [
    "Grazie per le info sul tour! Ci vediamo presto ✈️",
    "Ho caricato i documenti, confermate ricezione?",
    "A che ora è il punto di ritrovo per {{partenza}}?",
    "Perfetto, procedo con il saldo questa settimana.",
  ];

  source.slice(0, 6).forEach((cliente, index) => {
    const now = hoursAgo(index * 5 + 2);
    conversazioniStore.push({
      id: createWhatsAppId("wconv"),
      clienteId: cliente.id,
      clienteNome: cliente.nome,
      numero: cliente.telefono || `+39 3${index}0 000 0000`,
      ultimoMessaggio: messaggi[index % messaggi.length].replace(
        "{{partenza}}",
        WHATSAPP_PREVIEW_VALUES.partenza,
      ),
      data: now,
      stato: stati[index % stati.length],
      aggiornatoIl: now,
    });
  });

  seeded = true;
}

export function seedWhatsAppMock(
  clienti: Array<{ id: string; nome: string; telefono: string }>,
): void {
  seedConversazioni(clienti);
}

export function listWhatsAppConversazioniMock(): WhatsAppConversazione[] {
  return [...conversazioniStore].sort(
    (a, b) => new Date(b.data).getTime() - new Date(a.data).getTime(),
  );
}

export function listWhatsAppTemplatesMock(): WhatsAppTemplate[] {
  return [...TEMPLATES];
}

export function findConversazioneByClienteIdMock(
  clienteId: string,
): WhatsAppConversazione | undefined {
  return conversazioniStore.find((item) => item.clienteId === clienteId);
}

export function insertWhatsAppInvioMock(input: {
  clienteId: string;
  clienteNome: string;
  numero: string;
  messaggio: string;
  templateId: string | null;
  utente: string;
}): WhatsAppInvio {
  const now = new Date().toISOString();
  const invio: WhatsAppInvio = {
    id: createWhatsAppId("winv"),
    clienteId: input.clienteId,
    numero: input.numero,
    messaggio: input.messaggio,
    templateId: input.templateId,
    utente: input.utente,
    inviatoIl: now,
    creatoIl: now,
  };

  inviiStore.unshift(invio);

  const existing = findConversazioneByClienteIdMock(input.clienteId);
  if (existing) {
    existing.ultimoMessaggio = input.messaggio;
    existing.data = now;
    existing.stato = "inviato";
    existing.aggiornatoIl = now;
  } else {
    conversazioniStore.unshift({
      id: createWhatsAppId("wconv"),
      clienteId: input.clienteId,
      clienteNome: input.clienteNome,
      numero: input.numero,
      ultimoMessaggio: input.messaggio,
      data: now,
      stato: "inviato",
      aggiornatoIl: now,
    });
  }

  return invio;
}

export function resetWhatsAppMockForTests(): void {
  conversazioniStore.length = 0;
  inviiStore.length = 0;
  seeded = false;
}
