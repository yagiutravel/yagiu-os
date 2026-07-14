import { getTourSync } from "@/services/tour.service";
import type { Cliente } from "@/types/cliente";
import type {
  PartecipazioneTour,
  PartecipazioneTourView,
  TourClienteView,
} from "@/types/tour-partecipazione";

const EMPTY_CLIENTE_DISPLAY = {
  clienteNome: "Cliente non trovato",
  clienteEmail: "—",
  clienteStato: "Prospect" as const,
};

export function mapClienteToPartecipazioneView(
  partecipazione: PartecipazioneTour,
  clienti: Cliente[],
): PartecipazioneTourView {
  const cliente = clienti.find((item) => item.id === partecipazione.clienteId);

  if (!cliente) {
    return { ...partecipazione, ...EMPTY_CLIENTE_DISPLAY };
  }

  return {
    ...partecipazione,
    clienteNome: cliente.nome,
    clienteEmail: cliente.email,
    clienteStato: cliente.stato,
  };
}

export function mapPartecipazioniToViews(
  partecipazioni: PartecipazioneTour[],
  clienti: Cliente[],
): PartecipazioneTourView[] {
  return partecipazioni.map((item) =>
    mapClienteToPartecipazioneView(item, clienti),
  );
}

export function mapPartecipazioneToTourClienteView(
  partecipazione: PartecipazioneTour,
): TourClienteView | null {
  const tour = getTourSync(partecipazione.tourId);
  if (!tour) return null;

  const anno = new Date(`${tour.dataPartenza}T00:00:00`).getFullYear();

  return {
    partecipazioneId: partecipazione.id,
    tourId: tour.id,
    nomeTour: tour.nomeTour,
    destinazione: tour.destinazione,
    anno,
    ruolo: partecipazione.ruolo,
    statoTour: tour.stato,
  };
}

export function mapPartecipazioniToTourClienteViews(
  partecipazioni: PartecipazioneTour[],
): TourClienteView[] {
  return partecipazioni
    .map(mapPartecipazioneToTourClienteView)
    .filter((item): item is TourClienteView => item !== null)
    .sort((a, b) => b.anno - a.anno);
}
