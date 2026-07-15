import { getSupabaseClient } from "@/config/supabase";
import { getOrganizationId } from "@/config/organization";
import {
  mapCreatePagamentoInputToInsert,
  mapTourPaymentRowToPagamento,
  mapUpdatePagamentoInputToUpdate,
} from "@/mappers/tour-payment.mapper";
import {
  mapClientePagamentiData,
  mapTourPagamentiData,
} from "@/mappers/pagamento.mapper";
import { mapParticipantRowToPartecipazione } from "@/mappers/tour-participant.mapper";
import { recordAuditLog } from "@/services/audit-log-record.service";
import { recordNotifica } from "@/services/notifica-record.service";
import { recordTourTimelineEvent } from "@/services/tour-timeline.service";
import { getPartecipazioniByTourId } from "@/services/tour-partecipazione.service";
import { getActiveTours, getTour, getTours, warmTourCache } from "@/services/tour.service";
import type { TourParticipantRow, TourPaymentRow } from "@/types/database";
import type { TourStato } from "@/types/tour";
import type {
  ClientePagamentiData,
  CreatePagamentoInput,
  Pagamento,
  TourPagamentiData,
  TourPagamentiRiepilogo,
  UpdatePagamentoInput,
} from "@/types/pagamento";

const PARTICIPANTS_TABLE = "tour_participants";

async function buildPagamentoAuditLabel(
  tourId: string,
  tipo: Pagamento["tipo"],
): Promise<string> {
  const tour = await getTour(tourId);
  return tour ? `${tipo} ${tour.nomeTour}` : tipo;
}

export class PagamentoServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PagamentoServiceError";
  }
}

const TABLE = "tour_payments";

function handleSupabaseError(operation: string, error: { message: string; code?: string }) {
  throw new PagamentoServiceError(
    `[${operation}] ${error.message}${error.code ? ` (${error.code})` : ""}`,
  );
}

async function fetchPagamentiByTourId(tourId: string): Promise<Pagamento[]> {
  const organizationId = await getOrganizationId();
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("organization_id", organizationId)
    .eq("tour_id", tourId)
    .order("data", { ascending: false });

  if (error) handleSupabaseError("fetchPagamentiByTourId", error);

  return ((data ?? []) as TourPaymentRow[]).map(mapTourPaymentRowToPagamento);
}

async function buildTourPagamentiData(tourId: string): Promise<TourPagamentiData> {
  const [partecipazioni, pagamenti, tour] = await Promise.all([
    getPartecipazioniByTourId(tourId),
    fetchPagamentiByTourId(tourId),
    getTour(tourId),
  ]);

  return mapTourPagamentiData(
    partecipazioni,
    pagamenti,
    tour?.prezzo ?? "€ 0",
  );
}

export async function getPagamentiByTourId(
  tourId: string,
): Promise<TourPagamentiData> {
  return buildTourPagamentiData(tourId);
}

export async function listAllPagamenti(): Promise<Pagamento[]> {
  const organizationId = await getOrganizationId();
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("organization_id", organizationId)
    .order("data", { ascending: false });

  if (error) handleSupabaseError("listAllPagamenti", error);

  return ((data ?? []) as TourPaymentRow[]).map(mapTourPaymentRowToPagamento);
}

export async function createPagamento(
  input: CreatePagamentoInput,
): Promise<TourPagamentiData> {
  if (!input.importo || input.importo <= 0) {
    throw new PagamentoServiceError("Inserisci un importo valido.");
  }

  if (!input.data) {
    throw new PagamentoServiceError("Inserisci la data del pagamento.");
  }

  const organizationId = await getOrganizationId();
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from(TABLE)
    .insert(mapCreatePagamentoInputToInsert(input, organizationId))
    .select("*")
    .single();

  if (error) handleSupabaseError("createPagamento", error);

  const pagamento = mapTourPaymentRowToPagamento(data as TourPaymentRow);
  const entitaLabel = await buildPagamentoAuditLabel(input.tourId, pagamento.tipo);

  await recordTourTimelineEvent({
    tourId: input.tourId,
    tipo: "pagamento",
    titolo: `${input.tipo} registrato`,
    descrizione: `Pagamento di € ${input.importo} tramite ${input.metodo}.`,
  });

  await recordAuditLog({
    azione: "Pagamento registrato",
    tipo: "pagamento",
    azioneTipo: "creato",
    entitaId: pagamento.id,
    entitaLabel,
  });

  const partecipazioni = await getPartecipazioniByTourId(input.tourId);
  const partecipazione = partecipazioni.find(
    (item) => item.id === input.partecipazioneId,
  );
  const tour = await getTour(input.tourId);
  const versamento =
    pagamento.tipo === "Acconto" ? "l'acconto" : "il saldo";

  await recordNotifica({
    tipo: "pagamento_ricevuto",
    titolo: "Pagamento ricevuto",
    messaggio: `${partecipazione?.clienteNome ?? "Cliente"} ha versato ${versamento} di € ${pagamento.importo.toLocaleString("it-IT")} per ${tour?.nomeTour ?? "Tour"}.`,
    href: `/tour/${input.tourId}`,
  });

  return buildTourPagamentiData(input.tourId);
}

export async function updatePagamento(
  id: string,
  input: UpdatePagamentoInput,
): Promise<TourPagamentiData> {
  if (input.importo !== undefined && input.importo <= 0) {
    throw new PagamentoServiceError("Inserisci un importo valido.");
  }

  const organizationId = await getOrganizationId();
  const supabase = getSupabaseClient();

  const { data: current, error: fetchError } = await supabase
    .from(TABLE)
    .select("*")
    .eq("id", id)
    .eq("organization_id", organizationId)
    .maybeSingle();

  if (fetchError) handleSupabaseError("updatePagamentoFetch", fetchError);
  if (!current) {
    throw new PagamentoServiceError("Pagamento non trovato.");
  }

  const { error } = await supabase
    .from(TABLE)
    .update(mapUpdatePagamentoInputToUpdate(input))
    .eq("id", id)
    .eq("organization_id", organizationId);

  if (error) handleSupabaseError("updatePagamento", error);

  const pagamento = mapTourPaymentRowToPagamento(current as TourPaymentRow);
  const tipo = input.tipo ?? pagamento.tipo;
  const entitaLabel = await buildPagamentoAuditLabel(current.tour_id as string, tipo);

  await recordAuditLog({
    azione: "Pagamento aggiornato",
    tipo: "pagamento",
    azioneTipo: "aggiornato",
    entitaId: id,
    entitaLabel,
  });

  return buildTourPagamentiData(current.tour_id as string);
}

export async function deletePagamento(id: string): Promise<TourPagamentiData> {
  const organizationId = await getOrganizationId();
  const supabase = getSupabaseClient();

  const { data: current, error: fetchError } = await supabase
    .from(TABLE)
    .select("*")
    .eq("id", id)
    .eq("organization_id", organizationId)
    .maybeSingle();

  if (fetchError) handleSupabaseError("deletePagamentoFetch", fetchError);
  if (!current) {
    throw new PagamentoServiceError("Pagamento non trovato.");
  }

  const pagamento = mapTourPaymentRowToPagamento(current as TourPaymentRow);
  const entitaLabel = await buildPagamentoAuditLabel(
    current.tour_id as string,
    pagamento.tipo,
  );

  const { error } = await supabase
    .from(TABLE)
    .delete()
    .eq("id", id)
    .eq("organization_id", organizationId);

  if (error) handleSupabaseError("deletePagamento", error);

  await recordAuditLog({
    azione: "Pagamento eliminato",
    tipo: "pagamento",
    azioneTipo: "eliminato",
    entitaId: id,
    entitaLabel,
  });

  return buildTourPagamentiData(current.tour_id as string);
}

export async function getPagamentoById(
  id: string,
): Promise<Pagamento | null> {
  const organizationId = await getOrganizationId();
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("id", id)
    .eq("organization_id", organizationId)
    .maybeSingle();

  if (error) handleSupabaseError("getPagamentoById", error);
  if (!data) return null;

  return mapTourPaymentRowToPagamento(data as TourPaymentRow);
}

export type PagamentoOverviewItem = {
  tourId: string;
  nomeTour: string;
  stato: TourStato;
  riepilogo: TourPagamentiRiepilogo;
};

const EMPTY_CLIENTE_PAGAMENTI: ClientePagamentiData = {
  perTour: [],
  riepilogo: {
    totaleVersato: 0,
    importoResiduo: 0,
    numeroPagamenti: 0,
    tourConSaldoAperto: 0,
  },
};

export async function getPagamentiByClienteId(
  clienteId: string,
): Promise<ClientePagamentiData> {
  const organizationId = await getOrganizationId();
  const supabase = getSupabaseClient();

  const { data: participantRows, error: participantError } = await supabase
    .from(PARTICIPANTS_TABLE)
    .select("*")
    .eq("organization_id", organizationId)
    .eq("cliente_id", clienteId)
    .order("created_at", { ascending: false });

  if (participantError) {
    handleSupabaseError("getPagamentiByClienteIdParticipants", participantError);
  }

  const partecipazioni = ((participantRows ?? []) as TourParticipantRow[]).map(
    mapParticipantRowToPartecipazione,
  );

  if (partecipazioni.length === 0) {
    return EMPTY_CLIENTE_PAGAMENTI;
  }

  const participantIds = partecipazioni.map((item) => item.id);

  const { data: paymentRows, error: paymentError } = await supabase
    .from(TABLE)
    .select("*")
    .eq("organization_id", organizationId)
    .in("participant_id", participantIds)
    .order("data", { ascending: false });

  if (paymentError) {
    handleSupabaseError("getPagamentiByClienteIdPayments", paymentError);
  }

  const pagamenti = ((paymentRows ?? []) as TourPaymentRow[]).map(
    mapTourPaymentRowToPagamento,
  );

  await warmTourCache();
  const tours = await getTours();
  const toursById = new Map(tours.map((tour) => [tour.id, tour]));

  return mapClientePagamentiData(partecipazioni, pagamenti, toursById);
}

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
