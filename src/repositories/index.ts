/**
 * Repository layer — astrazione dati per multi-tenant.
 * Delega ai service esistenti senza modificare il comportamento.
 */
export {
  getClienti,
  getCliente,
  createCliente,
  updateCliente,
  deleteCliente,
} from "@/services/clienti.service";

export {
  getPartecipazioniByTourId,
  getTourByClienteId,
  createPartecipazione,
  updatePartecipazione,
  deletePartecipazione,
  getPartecipazioneById,
} from "@/services/tour-partecipazione.service";

export {
  getCamereByTourId,
  getRoomingRiepilogoByTourId,
  createCamera,
  updateCamera,
  deleteCamera,
} from "@/services/camera.service";

export {
  getPagamentiByTourId,
  createPagamento,
  updatePagamento,
  deletePagamento,
} from "@/services/pagamento.service";

export {
  getDashboardData,
  searchDashboard,
  invalidateDashboardCache,
} from "@/services/dashboard.service";

export {
  getDocumentiByClienteId,
} from "@/services/cliente-documento.service";

export {
  getComunicazioniDashboardData,
} from "@/services/comunicazione.service";

export {
  getEmailTemplates,
  createEmailTemplate,
  updateEmailTemplate,
  deleteEmailTemplate,
} from "@/services/email-template.service";

export {
  searchGlobal,
  getGlobalSearchIndex,
  invalidateGlobalSearchIndex,
} from "@/services/global-search.service";

export {
  getNotifiche,
  markNotificaAsRead,
  markAllNotificheAsRead,
} from "@/services/notifica.service";

export {
  getAuditLogEntries,
  filterAuditLogEntries,
} from "@/services/audit-log.service";

export {
  getTours,
  getActiveTours,
  getTour,
  getTourDettaglio,
  createTour,
  updateTour,
  archiveTour,
  deleteTour,
} from "@/services/tour.service";

export {
  organizationService,
  workspaceService,
  membershipService,
  roleService,
  permissionService,
  permissionEngine,
  roleEngine,
  tenantContextProvider,
  getDefaultTenantContext,
} from "@/tenant";
