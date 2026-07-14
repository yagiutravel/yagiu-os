import type { DomainSnapshot } from "@/domain/types/snapshot";
import type { AnalyticsSummary } from "@/domain/types/analytics";
import { DOMAIN_ETA_MEDIA_PLACEHOLDER } from "@/domain/constants";
import { roundPercent } from "@/domain/helpers/format";
import { isTourCompleted, isTourFuture } from "@/domain/helpers/tour";
import {
  isClienteAttivo,
  isClienteInattivo,
  isClienteProspect,
} from "@/domain/helpers/cliente";
import { getTourFillPercent } from "@/domain/helpers/tour";
import { getRoomingTotals } from "@/domain/selectors/camera.selectors";
import { getClientsWithAtLeastTwoTrips } from "@/domain/selectors/cliente.selectors";

export function computeAnalyticsSummary(
  snapshot: DomainSnapshot,
  now = new Date(),
): AnalyticsSummary {
  const rooming = getRoomingTotals(snapshot);
  const postiTotali = rooming.postiOccupati + rooming.postiDisponibili;

  const riempimenti = snapshot.activeTours.map(getTourFillPercent);
  const riempimentoMedio =
    riempimenti.length > 0
      ? Math.round(
          riempimenti.reduce((sum, value) => sum + value, 0) /
            riempimenti.length,
        )
      : 0;

  const viaggiPerCliente = snapshot.clienti.map(
    (cliente) =>
      snapshot.partecipazioniByClienteId.get(cliente.id)?.length ?? 0,
  );
  const numeroMedioViaggiPerCliente =
    viaggiPerCliente.length > 0
      ? Math.round(
          (viaggiPerCliente.reduce((sum, value) => sum + value, 0) /
            viaggiPerCliente.length) *
            10,
        ) / 10
      : 0;

  return {
    numeroClienti: snapshot.clienti.length,
    numeroTour: snapshot.tours.length,
    numeroTourAttivi: snapshot.activeTours.length,
    numeroTourConclusi: snapshot.tours.filter(isTourCompleted).length,
    numeroTourFuturi: snapshot.tours.filter((tour) =>
      isTourFuture(tour, now),
    ).length,
    riempimentoMedio,
    numeroPartecipanti: snapshot.allPartecipazioni.length,
    clientiAttivi: snapshot.clienti.filter(isClienteAttivo).length,
    clientiInattivi: snapshot.clienti.filter(isClienteInattivo).length,
    clientiProspect: snapshot.clienti.filter(isClienteProspect).length,
    tassoOccupazioneCamere: roundPercent(
      rooming.postiOccupati,
      postiTotali,
    ),
    numeroCamere: rooming.camere,
    postiCameraOccupati: rooming.postiOccupati,
    postiCameraDisponibili: rooming.postiDisponibili,
    numeroMedioViaggiPerCliente,
    clientiConAlmenoDueViaggi: getClientsWithAtLeastTwoTrips(snapshot).length,
    etaMediaViaggiatori: DOMAIN_ETA_MEDIA_PLACEHOLDER,
  };
}
