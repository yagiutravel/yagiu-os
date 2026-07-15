import {
  calcolaImportoResiduo,
  calcolaStatoPagamento,
  parsePrezzoTour,
} from "@/models/pagamento";
import { mapTourPaymentRowToPagamento } from "@/mappers/tour-payment.mapper";
import type { TourPaymentRow } from "@/types/database";
import type { PartecipazioneTourView } from "@/types/tour-partecipazione";
import type {
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
