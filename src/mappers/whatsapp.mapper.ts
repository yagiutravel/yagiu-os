import {
  formatWhatsAppData,
  formatWhatsAppOra,
} from "@/models/whatsapp";
import type { WhatsAppConversazioneRow as WhatsAppConversazioneDbRow } from "@/types/database";
import type {
  WhatsAppConversazione,
  WhatsAppConversazioneView,
  WhatsAppInvio,
  WhatsAppInvioRow,
  WhatsAppStato,
  WhatsAppTemplate,
} from "@/types/whatsapp";

export function mapConversazioneToView(
  conversazione: WhatsAppConversazione,
): WhatsAppConversazioneView {
  return {
    ...conversazione,
    dataFormattata: formatWhatsAppData(conversazione.data),
    oraFormattata: formatWhatsAppOra(conversazione.data),
  };
}

export function mapConversazioniToViews(
  conversazioni: WhatsAppConversazione[],
): WhatsAppConversazioneView[] {
  return conversazioni.map(mapConversazioneToView);
}

export function mapWhatsAppConversazioneRowToConversazione(
  row: WhatsAppConversazioneDbRow & { cliente_nome?: string },
): WhatsAppConversazione {
  return {
    id: row.id,
    clienteId: row.cliente_id,
    clienteNome: row.cliente_nome ?? "",
    numero: row.numero,
    ultimoMessaggio: row.ultimo_messaggio,
    data: row.data,
    stato: row.stato as WhatsAppStato,
    aggiornatoIl: row.aggiornato_il,
  };
}

export function mapWhatsAppInvioRowToInvio(row: WhatsAppInvioRow): WhatsAppInvio {
  return {
    id: row.id,
    clienteId: row.cliente_id,
    numero: row.numero,
    messaggio: row.messaggio,
    templateId: row.template_id,
    utente: row.utente,
    inviatoIl: row.inviato_il,
    creatoIl: row.creato_il,
  };
}

export function mapWhatsAppTemplateRowToTemplate(row: {
  id: string;
  titolo: string;
  messaggio: string;
}): WhatsAppTemplate {
  return {
    id: row.id,
    titolo: row.titolo,
    messaggio: row.messaggio,
  };
}
