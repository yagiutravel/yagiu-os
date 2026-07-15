import {
  calcolaImportoResiduo,
  calcolaStatoPagamento,
  parsePrezzoTour,
} from "@/models/pagamento";
import { mapTourPaymentRowToPagamento } from "@/mappers/tour-payment.mapper";
import { mapPartecipazioneToTourClienteView } from "@/mappers/tour-partecipazione.mapper";
import type { TourPaymentRow } from "@/types/database";
import type { Tour } from "@/types/tour";
import type {
  PartecipazioneTour,
  PartecipazioneTourView,
} from "@/types/tour-partecipazione";
import type {
  ClientePagamentiData,
  ClientePagamentiRiepilogo,
  ClienteTourPagamentoView,
  Pagamento,
  PartecipantePagamentoView,
  TourPagamentiData,
  TourPagamentiRiepilogo,
} from "@/types/pagamento";

function sumByTipo(pagamenti: Pagamento[], tipo: Pagamento["tipo"]): number {
  return pagamenti
    .filter((item) => item.tipo === tipo)
    .reduce((sum, item) => sum + item.importo, 0);
}

export function mapPartecipantePagamentoView(
  partecipazione: PartecipazioneTourView,
  pagamenti: Pagamento[],
  quotaTotale: number,
): PartecipantePagamentoView {
  const partecipantePagamenti = pagamenti
    .filter((item) => item.partecipazioneId === partecipazione.id)
    .sort((a, b) => b.data.localeCompare(a.data));

  const accontoVersato = sumByTipo(partecipantePagamenti, "Acconto");
  const saldoVersato = sumByTipo(partecipantePagamenti, "Saldo");

  return {
    partecipazioneId: partecipazione.id,
    clienteId: partecipazione.clienteId,
    clienteNome: partecipazione.clienteNome,
    quotaTotale,
    accontoVersato,
    saldoVersato,
    importoResiduo: calcolaImportoResiduo(
      quotaTotale,
      accontoVersato,
      saldoVersato,
    ),
    statoPagamento: calcolaStatoPagamento(
      quotaTotale,
      accontoVersato,
      saldoVersato,
    ),
    pagamenti: partecipantePagamenti,
  };
}

export function mapPartecipantiPagamentoViews(
  partecipazioni: PartecipazioneTourView[],
  pagamenti: Pagamento[],
  prezzoTour: string,
): PartecipantePagamentoView[] {
  const quotaTotale = parsePrezzoTour(prezzoTour);

  return partecipazioni
    .map((item) =>
      mapPartecipantePagamentoView(item, pagamenti, quotaTotale),
    )
    .sort((a, b) => a.clienteNome.localeCompare(b.clienteNome, "it"));
}

export function computeTourPagamentiRiepilogo(
  partecipanti: PartecipantePagamentoView[],
): TourPagamentiRiepilogo {
  const totaleTour = partecipanti.reduce(
    (sum, item) => sum + item.quotaTotale,
    0,
  );
  const incassato = partecipanti.reduce(
    (sum, item) => sum + item.accontoVersato + item.saldoVersato,
    0,
  );

  return {
    totaleTour,
    incassato,
    residuoDaIncassare: Math.max(totaleTour - incassato, 0),
    clientiPagati: partecipanti.filter(
      (item) => item.statoPagamento === "Saldo completato",
    ).length,
    clientiSaldoAperto: partecipanti.filter(
      (item) => item.statoPagamento !== "Saldo completato",
    ).length,
  };
}

export function mapTourPagamentiData(
  partecipazioni: PartecipazioneTourView[],
  pagamenti: Pagamento[],
  prezzoTour: string,
): TourPagamentiData {
  const partecipanti = mapPartecipantiPagamentoViews(
    partecipazioni,
    pagamenti,
    prezzoTour,
  );

  return {
    partecipanti,
    riepilogo: computeTourPagamentiRiepilogo(partecipanti),
  };
}

/** Mapper Supabase tour_payments. */
export function mapPagamentoRowToPagamento(row: TourPaymentRow): Pagamento {
  return mapTourPaymentRowToPagamento(row);
}

function toPartecipazioneTourView(
  partecipazione: PartecipazioneTour,
): PartecipazioneTourView {
  return {
    ...partecipazione,
    clienteNome: "",
    clienteEmail: "",
    clienteStato: "Attivo",
  };
}

export function computeClientePagamentiRiepilogo(
  perTour: ClienteTourPagamentoView[],
): ClientePagamentiRiepilogo {
  const totaleVersato = perTour.reduce(
    (sum, item) =>
      sum + item.partecipante.accontoVersato + item.partecipante.saldoVersato,
    0,
  );
  const importoResiduo = perTour.reduce(
    (sum, item) => sum + item.partecipante.importoResiduo,
    0,
  );
  const numeroPagamenti = perTour.reduce(
    (sum, item) => sum + item.partecipante.pagamenti.length,
    0,
  );
  const tourConSaldoAperto = perTour.filter(
    (item) => item.partecipante.statoPagamento !== "Saldo completato",
  ).length;

  return {
    totaleVersato,
    importoResiduo,
    numeroPagamenti,
    tourConSaldoAperto,
  };
}

export function mapClientePagamentiData(
  partecipazioni: PartecipazioneTour[],
  pagamenti: Pagamento[],
  toursById: Map<string, Tour>,
): ClientePagamentiData {
  const perTour = partecipazioni
    .map((partecipazione) => {
      const tourView = mapPartecipazioneToTourClienteView(
        partecipazione,
        toursById,
      );
      if (!tourView) return null;

      const tour = toursById.get(partecipazione.tourId);
      if (!tour) return null;

      const partecipante = mapPartecipantePagamentoView(
        toPartecipazioneTourView(partecipazione),
        pagamenti,
        parsePrezzoTour(tour.prezzo),
      );

      return {
        tourId: tourView.tourId,
        nomeTour: tourView.nomeTour,
        destinazione: tourView.destinazione,
        anno: tourView.anno,
        statoTour: tourView.statoTour,
        partecipante,
      };
    })
    .filter((item): item is ClienteTourPagamentoView => item !== null)
    .sort(
      (a, b) =>
        b.anno - a.anno ||
        a.nomeTour.localeCompare(b.nomeTour, "it"),
    );

  return {
    perTour,
    riepilogo: computeClientePagamentiRiepilogo(perTour),
  };
}
