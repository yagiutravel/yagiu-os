import { getAuthenticatedUserLabel } from "@/auth/session-store";
import { getSupabaseClient } from "@/config/supabase";
import { isDevMissingTableNoOp } from "@/lib/supabase/missing-table";
import { mapClienteTimelineEventoRowToEvento } from "@/mappers/cliente-timeline.mapper";
import type { ClienteTimelineEventoTipo } from "@/types/cliente-timeline";

export class ClienteTimelineEventError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ClienteTimelineEventError";
  }
}

const TABLE = "cliente_timeline_eventi";

function handleSupabaseError(operation: string, error: { message: string; code?: string }) {
  throw new ClienteTimelineEventError(
    `[${operation}] ${error.message}${error.code ? ` (${error.code})` : ""}`,
  );
}

export type RecordClienteTimelineInput = {
  clienteId: string;
  tipo: ClienteTimelineEventoTipo;
  titolo: string;
  descrizione?: string;
  utente?: string;
};

function mapTimelineRow(row: {
  id: string;
  cliente_id: string;
  tipo: string;
  titolo: string;
  descrizione: string;
  data: string;
  utente: string;
  creato_il: string;
}) {
  return mapClienteTimelineEventoRowToEvento({
    id: row.id,
    cliente_id: row.cliente_id,
    tipo: row.tipo as ClienteTimelineEventoTipo,
    titolo: row.titolo,
    descrizione: row.descrizione,
    data: row.data,
    utente: row.utente,
    creato_il: row.creato_il,
  });
}

export async function recordClienteTimelineEvent(
  input: RecordClienteTimelineInput,
): Promise<void> {
  const supabase = getSupabaseClient();

  const { error } = await supabase.from(TABLE).insert({
    cliente_id: input.clienteId,
    tipo: input.tipo,
    titolo: input.titolo,
    descrizione: input.descrizione?.trim() ?? "",
    utente: input.utente ?? getAuthenticatedUserLabel(),
  });

  if (error) {
    if (
      isDevMissingTableNoOp(
        "cliente-timeline",
        TABLE,
        "recordClienteTimelineEvent",
        error,
      )
    ) {
      return;
    }
    handleSupabaseError("recordClienteTimelineEvent", error);
  }
}

export async function fetchClienteTimelineEventi(clienteId: string) {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("cliente_id", clienteId)
    .order("data", { ascending: false });

  if (error) {
    if (
      isDevMissingTableNoOp(
        "cliente-timeline",
        TABLE,
        "fetchClienteTimelineEventi",
        error,
      )
    ) {
      return [];
    }
    handleSupabaseError("fetchClienteTimelineEventi", error);
  }

  return (data ?? []).map((row) => mapTimelineRow(row));
}

export async function listClienteTimelineEventi() {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .order("data", { ascending: false })
    .limit(500);

  if (error) {
    if (
      isDevMissingTableNoOp(
        "cliente-timeline",
        TABLE,
        "listClienteTimelineEventi",
        error,
      )
    ) {
      return [];
    }
    handleSupabaseError("listClienteTimelineEventi", error);
  }

  return (data ?? []).map((row) => mapTimelineRow(row));
}
