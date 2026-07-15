import { getSupabaseClient } from "@/config/supabase";
import { AUDIT_UTENTE_SISTEMA } from "@/lib/audit/constants";
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

export async function recordClienteTimelineEvent(
  input: RecordClienteTimelineInput,
): Promise<void> {
  const supabase = getSupabaseClient();

  const { error } = await supabase.from(TABLE).insert({
    cliente_id: input.clienteId,
    tipo: input.tipo,
    titolo: input.titolo,
    descrizione: input.descrizione?.trim() ?? "",
    utente: input.utente ?? AUDIT_UTENTE_SISTEMA,
  });

  if (error) {
    if (
      error.code === "PGRST205" ||
      error.message.includes("Could not find the table")
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
      error.code === "PGRST205" ||
      error.message.includes("Could not find the table")
    ) {
      return [];
    }
    handleSupabaseError("fetchClienteTimelineEventi", error);
  }

  return (data ?? []).map((row) =>
    mapClienteTimelineEventoRowToEvento({
      id: row.id,
      cliente_id: row.cliente_id,
      tipo: row.tipo as ClienteTimelineEventoTipo,
      titolo: row.titolo,
      descrizione: row.descrizione,
      data: row.data,
      utente: row.utente,
      creato_il: row.creato_il,
    }),
  );
}
