import type { DomainSnapshot } from "@/domain/types/snapshot";
import type {
  ClientReadyToTravel,
  UpcomingDeparture,
} from "@/domain/types/analytics";
import type { OperationalAlert } from "@/domain/types/alerts";
import { computeAnalyticsSummary } from "@/domain/analytics/analytics";
import { evaluateAllRules } from "@/domain/rules/engine";
import {
  getUpcomingDepartures,
  getToursNearlyComplete,
} from "@/domain/selectors/tour.selectors";
import {
  getMissingDocuments,
  getOutstandingPayments,
  getUnpaidBalances,
} from "@/domain/selectors/partecipazione.selectors";
import {
  getIncompleteCamere,
  getRoomAvailability,
} from "@/domain/selectors/camera.selectors";
import {
  getClientsWithAtLeastTwoTrips,
  getLongInactiveClients,
} from "@/domain/selectors/cliente.selectors";
import { getDashboardSummary } from "@/domain/selectors/dashboard.selectors";

export function findUpcomingDepartures(
  snapshot: DomainSnapshot,
  withinDays?: number,
): UpcomingDeparture[] {
  if (withinDays !== undefined) {
    return getUpcomingDepartures(snapshot, 20).filter(
      (item) => item.giorniMancanti <= withinDays,
    );
  }
  return getUpcomingDepartures(snapshot);
}

export function findMissingDocuments(snapshot: DomainSnapshot) {
  return getMissingDocuments(snapshot);
}

export function findUnpaidBalances(snapshot: DomainSnapshot) {
  return getUnpaidBalances(snapshot);
}

export function findOutstandingPayments(snapshot: DomainSnapshot) {
  return getOutstandingPayments(snapshot);
}

export function findIncompleteRooms(snapshot: DomainSnapshot) {
  return getIncompleteCamere(snapshot);
}

export function findRoomAvailability(snapshot: DomainSnapshot, tourId?: string) {
  return getRoomAvailability(snapshot, tourId);
}

export function findToursNeedingAttention(snapshot: DomainSnapshot) {
  return {
    upcoming: getUpcomingDepartures(snapshot, 5),
    nearlyComplete: getToursNearlyComplete(snapshot),
    incompleteRooms: getIncompleteCamere(snapshot),
    unpaidBalances: getUnpaidBalances(snapshot),
    missingDocuments: getMissingDocuments(snapshot),
  };
}

export function findClientsReadyToTravel(
  snapshot: DomainSnapshot,
): ClientReadyToTravel[] {
  const results: ClientReadyToTravel[] = [];

  for (const partecipazione of snapshot.allPartecipazioni) {
    const cliente = snapshot.clientiById.get(partecipazione.clienteId);
    const tour = snapshot.toursById.get(partecipazione.tourId);
    if (!cliente || !tour) continue;

    const pagamentoOk = partecipazione.pagamento === "Saldo ricevuto";
    const documentiOk = partecipazione.documenti === "Verificati";
    const questionarioOk = partecipazione.questionario === "Compilato";

    results.push({
      clienteId: cliente.id,
      nome: cliente.nome,
      tourId: tour.id,
      nomeTour: tour.nomeTour,
      pagamentoOk,
      documentiOk,
      questionarioOk,
      pronto: pagamentoOk && documentiOk && questionarioOk,
    });
  }

  return results.filter((item) => item.pronto);
}

export function findOperationalAlerts(
  snapshot: DomainSnapshot,
  now = new Date(),
): OperationalAlert[] {
  return evaluateAllRules(snapshot, { now });
}

export function findClientsWithRepeatTravel(snapshot: DomainSnapshot) {
  return getClientsWithAtLeastTwoTrips(snapshot);
}

export function findLongInactiveClients(snapshot: DomainSnapshot) {
  return getLongInactiveClients(snapshot);
}

export function findAnalytics(snapshot: DomainSnapshot) {
  return computeAnalyticsSummary(snapshot);
}

export function findDashboardSummary(snapshot: DomainSnapshot) {
  return getDashboardSummary(snapshot);
}

/** Punto di accesso principale per l'AI — carica snapshot ed esegue query. */
export type DomainQueryCatalog = {
  findUpcomingDepartures: typeof findUpcomingDepartures;
  findMissingDocuments: typeof findMissingDocuments;
  findUnpaidBalances: typeof findUnpaidBalances;
  findOutstandingPayments: typeof findOutstandingPayments;
  findIncompleteRooms: typeof findIncompleteRooms;
  findRoomAvailability: typeof findRoomAvailability;
  findToursNeedingAttention: typeof findToursNeedingAttention;
  findClientsReadyToTravel: typeof findClientsReadyToTravel;
  findOperationalAlerts: typeof findOperationalAlerts;
  findClientsWithRepeatTravel: typeof findClientsWithRepeatTravel;
  findLongInactiveClients: typeof findLongInactiveClients;
  findAnalytics: typeof findAnalytics;
  findDashboardSummary: typeof findDashboardSummary;
};

export const domainQueries: DomainQueryCatalog = {
  findUpcomingDepartures,
  findMissingDocuments,
  findUnpaidBalances,
  findOutstandingPayments,
  findIncompleteRooms,
  findRoomAvailability,
  findToursNeedingAttention,
  findClientsReadyToTravel,
  findOperationalAlerts,
  findClientsWithRepeatTravel,
  findLongInactiveClients,
  findAnalytics,
  findDashboardSummary,
};
