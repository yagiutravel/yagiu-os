import type { ClienteRow, ClienteInsert, ClienteUpdate } from "@/types/database";
import type {
  Cliente,
  ClienteStato,
  CreateClienteInput,
  UpdateClienteInput,
} from "@/types/cliente";

const EMPTY_DISPLAY = "—";
const DEFAULT_STATO: ClienteStato = "Prospect";

function toDisplayValue(value: string | null | undefined): string {
  const trimmed = value?.trim();
  return trimmed ? trimmed : EMPTY_DISPLAY;
}

function toNullableValue(value: string | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function toClienteStato(value: string | null | undefined): ClienteStato {
  if (value === "Attivo" || value === "Inattivo" || value === "Prospect") {
    return value;
  }
  return DEFAULT_STATO;
}

export function mapRowToCliente(row: ClienteRow): Cliente {
  return {
    id: row.id,
    nome: row.nome,
    email: toDisplayValue(row.email),
    telefono: toDisplayValue(row.telefono),
    azienda: toDisplayValue(row.azienda),
    stato: toClienteStato(row.stato),
    creatoIl: row.created_at.split("T")[0],
  };
}

export function mapCreateInputToInsert(data: CreateClienteInput): ClienteInsert {
  return {
    nome: data.nome.trim(),
    email: data.email.trim().toLowerCase(),
    telefono: toNullableValue(data.telefono),
    azienda: toNullableValue(data.azienda),
    stato: data.stato,
  };
}

export function mapUpdateInputToUpdate(data: UpdateClienteInput): ClienteUpdate {
  const payload: ClienteUpdate = {};

  if (data.nome !== undefined) payload.nome = data.nome.trim();
  if (data.email !== undefined) payload.email = data.email.trim().toLowerCase();
  if (data.telefono !== undefined) payload.telefono = toNullableValue(data.telefono);
  if (data.azienda !== undefined) payload.azienda = toNullableValue(data.azienda);
  if (data.stato !== undefined) payload.stato = data.stato;

  return payload;
}

export function mapRowsToClienti(rows: ClienteRow[]): Cliente[] {
  return rows.map(mapRowToCliente);
}
