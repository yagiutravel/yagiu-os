import {
  formatWhatsAppData,
  formatWhatsAppOra,
} from "@/models/whatsapp";
import type {
  WhatsAppConversazione,
  WhatsAppConversazioneRow,
  WhatsAppConversazioneView,
  WhatsAppInvio,
  WhatsAppInvioRow,
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
  row: WhatsAppConversazioneRow & { cliente_nome?: string },
): WhatsAppConversazione {
  return {
    id: row.id,
    clienteId: row.cliente_id,
    clienteNome: row.cliente_nome ?? "",
    numero: row.numero,
    ultimoMessaggio: row.ultimo_messaggio,
    data: row.data,
    stato: row.stato,
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
