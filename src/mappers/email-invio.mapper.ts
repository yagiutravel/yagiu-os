import type { EmailInvio } from "@/types/email-invio";
import type { EmailInvioRow } from "@/types/database";

export function mapEmailInvioRowToInvio(row: EmailInvioRow): EmailInvio {
  return {
    id: row.id,
    clienteId: row.cliente_id,
    destinatario: row.destinatario,
    oggetto: row.oggetto,
    messaggio: row.messaggio,
    templateId: row.template_id,
    allegati: row.allegati,
    utente: row.utente,
    inviataIl: row.inviata_il,
    creatoIl: row.creato_il,
  };
}
