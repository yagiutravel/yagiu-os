import { mapConversazioniToViews } from "@/mappers/whatsapp.mapper";
import { insertComunicazioneWhatsAppMock } from "@/mock/comunicazioni";
import { insertClienteTimelineWhatsAppMock } from "@/mock/cliente-timeline";
import {
  insertWhatsAppInvioMock,
  listWhatsAppConversazioniMock,
  listWhatsAppTemplatesMock,
  seedWhatsAppMock,
} from "@/mock/whatsapp";
import { buildAnteprimaWhatsApp } from "@/models/whatsapp";
import { getClienti } from "@/services/clienti.service";
import type {
  InviaWhatsAppInput,
  WhatsAppConversazioneView,
  WhatsAppInvio,
  WhatsAppTemplate,
} from "@/types/whatsapp";

export class WhatsAppServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "WhatsAppServiceError";
  }
}

async function ensureWhatsAppSeeded(): Promise<void> {
  try {
    const clienti = await getClienti();
    seedWhatsAppMock(
      clienti.map((item) => ({
        id: item.id,
        nome: item.nome,
        telefono: item.telefono,
      })),
    );
  } catch {
    seedWhatsAppMock([]);
  }
}

export async function getWhatsAppConversazioni(): Promise<
  WhatsAppConversazioneView[]
> {
  await ensureWhatsAppSeeded();
  return mapConversazioniToViews(listWhatsAppConversazioniMock());
}

export async function getWhatsAppTemplates(): Promise<WhatsAppTemplate[]> {
  await ensureWhatsAppSeeded();
  return listWhatsAppTemplatesMock();
}

export type InviaWhatsAppResult = {
  invio: WhatsAppInvio;
};

export async function inviaWhatsAppSimulato(
  input: InviaWhatsAppInput,
): Promise<InviaWhatsAppResult> {
  await new Promise((resolve) => setTimeout(resolve, 500));
  await ensureWhatsAppSeeded();

  const invio = insertWhatsAppInvioMock(input);

  insertClienteTimelineWhatsAppMock({
    clienteId: input.clienteId,
    titolo: "WhatsApp inviato",
    descrizione: `Messaggio inviato a ${input.numero}: "${buildAnteprimaWhatsApp(input.messaggio, 60)}"`,
    utente: input.utente,
  });

  insertComunicazioneWhatsAppMock({
    clienteId: input.clienteId,
    oggetto: `WhatsApp — ${input.clienteNome}`,
    anteprima: buildAnteprimaWhatsApp(input.messaggio),
  });

  return { invio };
}

export function filterWhatsAppConversazioni(
  conversazioni: WhatsAppConversazioneView[],
  search: string,
): WhatsAppConversazioneView[] {
  const query = search.trim().toLowerCase();
  if (!query) return conversazioni;

  return conversazioni.filter(
    (item) =>
      item.clienteNome.toLowerCase().includes(query) ||
      item.numero.includes(query) ||
      item.ultimoMessaggio.toLowerCase().includes(query),
  );
}
