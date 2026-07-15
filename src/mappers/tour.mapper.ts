import {
  mapDbTourStatoToUi,
  mapUiTourStatoToDb,
} from "@/lib/tour/db-enums";
import { formatCentsToPrezzo, parsePrezzoToCents } from "@/lib/tour/price";
import type { TourStaffRow, TourRow, TourStatsRow } from "@/types/database";
import type { CreateTourInput, Tour, UpdateTourInput } from "@/types/tour";

export function mapTourRowToTour(
  row: TourRow,
  stats: Pick<TourStatsRow, "numero_partecipanti"> | null,
  tourLeader: string,
): Tour {
  return {
    id: row.id,
    nomeTour: row.nome,
    destinazione: row.destinazione,
    dataPartenza: row.data_partenza,
    dataRitorno: row.data_ritorno,
    stato: mapDbTourStatoToUi(row.stato),
    numeroPartecipanti: stats?.numero_partecipanti ?? 0,
    capienzaMassima: row.capienza_massima,
    tourLeader,
    prezzo: formatCentsToPrezzo(row.prezzo_cents, row.valuta),
    descrizione: row.descrizione,
    creatoIl: row.created_at,
    aggiornatoIl: row.updated_at,
  };
}

export function mapCreateTourInputToInsert(
  input: CreateTourInput,
  organizationId: string,
  slug: string,
): {
  tour: Omit<import("@/types/database").TourInsert, "id">;
  tourLeader: string;
} {
  return {
    tour: {
      organization_id: organizationId,
      nome: input.nomeTour.trim(),
      slug,
      destinazione: input.destinazione.trim(),
      descrizione: input.descrizione.trim(),
      stato: mapUiTourStatoToDb(input.stato),
      data_partenza: input.dataPartenza,
      data_ritorno: input.dataRitorno,
      capienza_massima: input.capienzaMassima,
      prezzo_cents: parsePrezzoToCents(input.prezzo),
      valuta: "EUR",
    },
    tourLeader: input.tourLeader.trim(),
  };
}

export function mapUpdateTourInputToUpdate(
  input: UpdateTourInput,
): import("@/types/database").TourUpdate {
  const payload: import("@/types/database").TourUpdate = {};

  if (input.nomeTour !== undefined) payload.nome = input.nomeTour.trim();
  if (input.destinazione !== undefined) {
    payload.destinazione = input.destinazione.trim();
  }
  if (input.descrizione !== undefined) {
    payload.descrizione = input.descrizione.trim();
  }
  if (input.stato !== undefined) payload.stato = mapUiTourStatoToDb(input.stato);
  if (input.dataPartenza !== undefined) payload.data_partenza = input.dataPartenza;
  if (input.dataRitorno !== undefined) payload.data_ritorno = input.dataRitorno;
  if (input.capienzaMassima !== undefined) {
    payload.capienza_massima = input.capienzaMassima;
  }
  if (input.prezzo !== undefined) {
    payload.prezzo_cents = parsePrezzoToCents(input.prezzo);
  }

  return payload;
}

export function mapTourLeaderStaffInsert(
  organizationId: string,
  tourId: string,
  nome: string,
): import("@/types/database").TourStaffInsert {
  return {
    organization_id: organizationId,
    tour_id: tourId,
    ruolo: "tour_leader",
    nome,
    ordine: 0,
  };
}

export function pickTourLeaderName(staff: TourStaffRow[]): string {
  const leader =
    staff.find((item) => item.ruolo === "tour_leader") ??
    staff.sort((a, b) => a.ordine - b.ordine)[0];
  return leader?.nome ?? "—";
}
