import {
  mapDbMetodoPagamentoToUi,
  mapDbTipoPagamentoToUi,
  mapUiMetodoPagamentoToDb,
  mapUiTipoPagamentoToDb,
} from "@/lib/tour/db-enums";
import { centsToEuros, eurosToCents } from "@/lib/tour/payment-amount";
import type { TourPaymentRow } from "@/types/database";
import type { TourPaymentUpdate } from "@/types/database";
import type {
  CreatePagamentoInput,
  Pagamento,
  UpdatePagamentoInput,
} from "@/types/pagamento";

export function mapTourPaymentRowToPagamento(row: TourPaymentRow): Pagamento {
  return {
    id: row.id,
    tourId: row.tour_id,
    partecipazioneId: row.participant_id,
    importo: centsToEuros(row.importo_cents),
    data: row.data,
    metodo: mapDbMetodoPagamentoToUi(row.metodo),
    tipo: mapDbTipoPagamentoToUi(row.tipo),
    creatoIl: row.created_at,
    aggiornatoIl: row.updated_at,
  };
}

export function mapCreatePagamentoInputToInsert(
  input: CreatePagamentoInput,
  organizationId: string,
) {
  return {
    organization_id: organizationId,
    tour_id: input.tourId,
    participant_id: input.partecipazioneId,
    importo_cents: eurosToCents(input.importo),
    data: input.data,
    metodo: mapUiMetodoPagamentoToDb(input.metodo),
    tipo: mapUiTipoPagamentoToDb(input.tipo),
  };
}

export function mapUpdatePagamentoInputToUpdate(
  input: UpdatePagamentoInput,
): TourPaymentUpdate {
  const payload: TourPaymentUpdate = {};

  if (input.importo !== undefined) {
    payload.importo_cents = eurosToCents(input.importo);
  }
  if (input.data !== undefined) payload.data = input.data;
  if (input.metodo !== undefined) {
    payload.metodo = mapUiMetodoPagamentoToDb(input.metodo);
  }
  if (input.tipo !== undefined) {
    payload.tipo = mapUiTipoPagamentoToDb(input.tipo);
  }

  return payload;
}
