import type { Cliente } from "@/types/cliente";
import type { Tour } from "@/types/tour";
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
  toursById: Map<string, Tour>,
): TourClienteView | null {
  const tour = toursById.get(partecipazione.tourId);
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

export function mapPartecipazioniToTourClienteViewsWithTours(
  partecipazioni: PartecipazioneTour[],
  tours: Tour[],
): TourClienteView[] {
  const toursById = new Map(tours.map((tour) => [tour.id, tour]));

  return partecipazioni
    .map((item) => mapPartecipazioneToTourClienteView(item, toursById))
    .filter((item): item is TourClienteView => item !== null)
    .sort((a, b) => b.anno - a.anno);
}
