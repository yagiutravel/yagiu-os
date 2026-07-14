import { mapTourPagamentiData } from "@/mappers/pagamento.mapper";
import {
  deletePagamentoMock,
  findPagamentoByIdMock,
  insertPagamentoMock,
  listPagamentiByTourIdMock,
  seedPagamentiMock,
  updatePagamentoMock,
} from "@/mock/pagamenti";
import { listPartecipazioniMock } from "@/mock/tour-partecipazioni";
import { getPartecipazioniByTourId } from "@/services/tour-partecipazione.service";
import { getActiveTours, getTourSync } from "@/services/tour.service";
import type { TourStato } from "@/types/tour";
import type {
  CreatePagamentoInput,
  Pagamento,
  TourPagamentiData,
  TourPagamentiRiepilogo,
  UpdatePagamentoInput,
} from "@/types/pagamento";

export class PagamentoServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PagamentoServiceError";
  }
}

async function ensurePagamentiSeeded(tourId: string) {
  await getPartecipazioniByTourId(tourId);
  seedPagamentiMock(listPartecipazioniMock());
}

function getPrezzoTour(tourId: string): string {
  const tour = getTourSync(tourId);
  return tour?.prezzo ?? "€ 0";
}

async function buildTourPagamentiData(tourId: string): Promise<TourPagamentiData> {
  const partecipazioni = await getPartecipazioniByTourId(tourId);
  const pagamenti = listPagamentiByTourIdMock(tourId);
  return mapTourPagamentiData(
    partecipazioni,
    pagamenti,
    getPrezzoTour(tourId),
  );
}

export async function getPagamentiByTourId(
  tourId: string,
): Promise<TourPagamentiData> {
  await ensurePagamentiSeeded(tourId);
  return buildTourPagamentiData(tourId);
}

export async function createPagamento(
  input: CreatePagamentoInput,
): Promise<TourPagamentiData> {
  await ensurePagamentiSeeded(input.tourId);

  if (!input.importo || input.importo <= 0) {
    throw new PagamentoServiceError("Inserisci un importo valido.");
  }

  if (!input.data) {
    throw new PagamentoServiceError("Inserisci la data del pagamento.");
  }

  insertPagamentoMock(input);
  return buildTourPagamentiData(input.tourId);
}

export async function updatePagamento(
  id: string,
  input: UpdatePagamentoInput,
): Promise<TourPagamentiData> {
  const current = findPagamentoByIdMock(id);
  if (!current) {
    throw new PagamentoServiceError("Pagamento non trovato.");
  }

  if (input.importo !== undefined && input.importo <= 0) {
    throw new PagamentoServiceError("Inserisci un importo valido.");
  }

  const updated = updatePagamentoMock(id, input);
  if (!updated) {
    throw new PagamentoServiceError("Pagamento non trovato.");
  }

  return buildTourPagamentiData(current.tourId);
}

export async function deletePagamento(id: string): Promise<TourPagamentiData> {
  const current = findPagamentoByIdMock(id);
  if (!current) {
    throw new PagamentoServiceError("Pagamento non trovato.");
  }

  const deleted = deletePagamentoMock(id);
  if (!deleted) {
    throw new PagamentoServiceError("Pagamento non trovato.");
  }

  return buildTourPagamentiData(current.tourId);
}

export async function getPagamentoById(
  id: string,
): Promise<Pagamento | null> {
  const pagamento = findPagamentoByIdMock(id);
  if (!pagamento) return null;
  await ensurePagamentiSeeded(pagamento.tourId);
  return pagamento;
}

export type PagamentoOverviewItem = {
  tourId: string;
  nomeTour: string;
  stato: TourStato;
  riepilogo: TourPagamentiRiepilogo;
};

export async function getPagamentiOverview(): Promise<PagamentoOverviewItem[]> {
  const tours = await getActiveTours();
  const items: PagamentoOverviewItem[] = [];

  for (const tour of tours) {
    const data = await getPagamentiByTourId(tour.id);
    items.push({
      tourId: tour.id,
      nomeTour: tour.nomeTour,
      stato: tour.stato,
      riepilogo: data.riepilogo,
    });
  }

  return items.sort((a, b) => a.nomeTour.localeCompare(b.nomeTour, "it"));
}
