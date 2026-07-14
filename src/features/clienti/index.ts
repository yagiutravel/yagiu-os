/** Modulo Clienti — API pubblica del dominio CRM. */
export * from "@/types/cliente";
export * from "@/types/cliente-documento";
export * from "@/types/cliente-questionario";
export * from "@/types/cliente-timeline";

export type { ClienteScheda } from "@/types/cliente-scheda/scheda";

export {
  getClienti,
  getCliente,
  createCliente,
  updateCliente,
  deleteCliente,
} from "@/services/clienti.service";

export {
  getDocumentiByClienteId,
} from "@/services/cliente-documento.service";

export {
  getQuestionarioByClienteId,
} from "@/services/cliente-questionario.service";

export { getClienteTimeline as getTimelineByClienteId } from "@/services/cliente-timeline.service";

export { useClientiModal } from "@/hooks/useClientiModal";
