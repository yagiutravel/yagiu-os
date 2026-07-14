import {
  formatNotificaData,
  formatNotificaOra,
  sortNotifiche,
} from "@/models/notifica";
import type { Notifica, NotificaRow, NotificaView } from "@/types/notifica";

export function mapNotificaToView(notifica: Notifica): NotificaView {
  return {
    ...notifica,
    dataFormattata: formatNotificaData(notifica.data),
    oraFormattata: formatNotificaOra(notifica.data),
  };
}

export function mapNotificheToViews(notifiche: Notifica[]): NotificaView[] {
  return sortNotifiche(notifiche).map(mapNotificaToView);
}

/** Mapper Supabase — pronto per integrazione futura. */
export function mapNotificaRowToNotifica(row: NotificaRow): Notifica {
  return {
    id: row.id,
    tipo: row.tipo,
    titolo: row.titolo,
    messaggio: row.messaggio,
    href: row.href,
    letta: row.letta,
    data: row.data,
    creatoIl: row.creato_il,
  };
}
