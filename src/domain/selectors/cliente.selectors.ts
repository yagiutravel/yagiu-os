import type { DomainSnapshot } from "@/domain/types/snapshot";
import {
  isClienteAttivo,
  isClienteInattivo,
  isClienteInattivoDaLungoPeriodo,
  isClienteProspect,
  isNuovoCliente,
  sortClientiByName,
} from "@/domain/helpers/cliente";
import type { Cliente } from "@/types/cliente";
import type { PartecipazioneTour } from "@/types/tour-partecipazione";

export function getAllClienti(snapshot: DomainSnapshot): Cliente[] {
  return snapshot.clienti;
}

export function getClienteById(
  snapshot: DomainSnapshot,
  clienteId: string,
): Cliente | undefined {
  return snapshot.clientiById.get(clienteId);
}

export function getActiveClients(snapshot: DomainSnapshot): Cliente[] {
  return snapshot.clienti.filter(isClienteAttivo);
}

export function getInactiveClients(snapshot: DomainSnapshot): Cliente[] {
  return snapshot.clienti.filter(isClienteInattivo);
}

export function getProspectClients(snapshot: DomainSnapshot): Cliente[] {
  return snapshot.clienti.filter(isClienteProspect);
}

export function getNewClients(
  snapshot: DomainSnapshot,
  withinDays = 7,
  now = new Date(),
): Cliente[] {
  return snapshot.clienti.filter((cliente) =>
    isNuovoCliente(cliente, withinDays, now),
  );
}

export function getLongInactiveClients(
  snapshot: DomainSnapshot,
  inactiveDays = 365,
  now = new Date(),
): Cliente[] {
  return snapshot.clienti.filter((cliente) =>
    isClienteInattivoDaLungoPeriodo(cliente, inactiveDays, now),
  );
}

export function getClientsByTour(
  snapshot: DomainSnapshot,
  tourId: string,
): Cliente[] {
  const partecipazioni = snapshot.partecipazioniByTourId.get(tourId) ?? [];
  const clienti = partecipazioni
    .map((item) => snapshot.clientiById.get(item.clienteId))
    .filter((item): item is Cliente => item !== undefined);

  return sortClientiByName(clienti);
}

export function getPartecipazioniByCliente(
  snapshot: DomainSnapshot,
  clienteId: string,
): PartecipazioneTour[] {
  return snapshot.partecipazioniByClienteId.get(clienteId) ?? [];
}

export function getClientsWithMinTrips(
  snapshot: DomainSnapshot,
  minTrips: number,
): Cliente[] {
  return snapshot.clienti.filter((cliente) => {
    const trips = snapshot.partecipazioniByClienteId.get(cliente.id)?.length ?? 0;
    return trips >= minTrips;
  });
}

export function getClientsWithAtLeastTwoTrips(
  snapshot: DomainSnapshot,
): Cliente[] {
  return getClientsWithMinTrips(snapshot, 2);
}
