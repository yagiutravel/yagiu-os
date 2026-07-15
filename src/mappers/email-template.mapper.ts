import type { EmailTemplate, EmailTemplateCategoria } from "@/types/email-template";
import type { EmailTemplateRow } from "@/types/database";

export function mapEmailTemplateRowToTemplate(row: EmailTemplateRow): EmailTemplate {
  return {
    id: row.id,
    titolo: row.titolo,
    oggetto: row.oggetto,
    corpoHtml: row.corpo_html,
    categoria: row.categoria as EmailTemplateCategoria,
    creatoIl: row.creato_il,
    aggiornatoIl: row.aggiornato_il,
  };
}
