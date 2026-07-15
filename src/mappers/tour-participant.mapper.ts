import {
  mapDbDocumentiToUi,
  mapDbIscrizioneToUi,
  mapDbPagamentoToUi,
  mapDbQuestionarioToUi,
  mapDbRuoloToUi,
  mapUiDocumentiToDb,
  mapUiIscrizioneToDb,
  mapUiPagamentoToDb,
  mapUiQuestionarioToDb,
  mapUiRuoloToDb,
} from "@/lib/tour/db-enums";
import type {
  TourParticipantInsert,
  TourParticipantRow,
  TourParticipantUpdate,
} from "@/types/database";
import type {
  CreatePartecipazioneTourInput,
  PartecipazioneTour,
  UpdatePartecipazioneTourInput,
} from "@/types/tour-partecipazione";

export function mapParticipantRowToPartecipazione(
  row: TourParticipantRow,
): PartecipazioneTour {
  return {
    id: row.id,
    tourId: row.tour_id,
    clienteId: row.cliente_id,
    statoIscrizione: mapDbIscrizioneToUi(row.stato_iscrizione),
    ruolo: mapDbRuoloToUi(row.ruolo),
    pagamento: mapDbPagamentoToUi(row.pagamento),
    documenti: mapDbDocumentiToUi(row.documenti),
    questionario: mapDbQuestionarioToUi(row.questionario),
    note: row.note,
    creatoIl: row.created_at,
    aggiornatoIl: row.updated_at,
  };
}

export function mapCreatePartecipazioneInputToInsert(
  input: CreatePartecipazioneTourInput,
  organizationId: string,
): TourParticipantInsert {
  return {
    organization_id: organizationId,
    tour_id: input.tourId,
    cliente_id: input.clienteId,
    stato_iscrizione: mapUiIscrizioneToDb(input.statoIscrizione ?? "Iscritto"),
    ruolo: mapUiRuoloToDb(input.ruolo),
    pagamento: mapUiPagamentoToDb(input.pagamento),
    documenti: mapUiDocumentiToDb(input.documenti),
    questionario: mapUiQuestionarioToDb(input.questionario),
    note: input.note?.trim() ?? "",
  };
}

export function mapUpdatePartecipazioneInputToUpdate(
  input: UpdatePartecipazioneTourInput,
): TourParticipantUpdate {
  const payload: TourParticipantUpdate = {};

  if (input.statoIscrizione !== undefined) {
    payload.stato_iscrizione = mapUiIscrizioneToDb(input.statoIscrizione);
  }
  if (input.ruolo !== undefined) payload.ruolo = mapUiRuoloToDb(input.ruolo);
  if (input.pagamento !== undefined) {
    payload.pagamento = mapUiPagamentoToDb(input.pagamento);
  }
  if (input.documenti !== undefined) {
    payload.documenti = mapUiDocumentiToDb(input.documenti);
  }
  if (input.questionario !== undefined) {
    payload.questionario = mapUiQuestionarioToDb(input.questionario);
  }
  if (input.note !== undefined) payload.note = input.note.trim();

  return payload;
}
