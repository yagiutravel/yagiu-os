/**
 * Modulo Marketing — comunicazioni, email, WhatsApp, automazioni, programmazione.
 * API pubblica per canali e workflow di comunicazione.
 */
export * from "@/types/comunicazione";
export * from "@/types/email-template";
export * from "@/types/email-invio";
export * from "@/types/whatsapp";
export * from "@/types/schedulazione";
export * from "@/types/automazione";

export {
  getComunicazioniDashboardData,
} from "@/services/comunicazione.service";

export {
  getEmailTemplates,
  createEmailTemplate,
  updateEmailTemplate,
  deleteEmailTemplate,
} from "@/services/email-template.service";

export { inviaEmailSimulata } from "@/services/email-invio.service";

export {
  getWhatsAppConversazioni,
  filterWhatsAppConversazioni,
  inviaWhatsAppSimulato,
} from "@/services/whatsapp.service";

export {
  getSchedulazioni,
  getSchedulazioneRiepilogo,
  createSchedulazione,
  filterSchedulazioni,
} from "@/services/schedulazione.service";

export {
  getAutomazioni,
  getAutomazioneRiepilogo,
  createAutomazione,
  filterAutomazioni,
} from "@/services/automazione.service";
