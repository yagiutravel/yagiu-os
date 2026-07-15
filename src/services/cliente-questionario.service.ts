import { getSupabaseClient } from "@/config/supabase";
import { isDevMissingTableNoOp } from "@/lib/supabase/missing-table";
import {
  mapClienteQuestionarioRowToQuestionario,
  mapQuestionarioToView,
} from "@/mappers/cliente-questionario.mapper";
import type { ClienteQuestionarioView } from "@/types/cliente-questionario";

export class ClienteQuestionarioServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ClienteQuestionarioServiceError";
  }
}

const TABLE = "cliente_questionari";

function handleSupabaseError(
  operation: string,
  error: { message: string; code?: string },
): never {
  throw new ClienteQuestionarioServiceError(
    `[${operation}] ${error.message}${error.code ? ` (${error.code})` : ""}`,
  );
}

export async function getQuestionarioByClienteId(
  clienteId: string,
): Promise<ClienteQuestionarioView | null> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("cliente_id", clienteId)
    .maybeSingle();

  if (error) {
    if (
      isDevMissingTableNoOp(
        "cliente-questionario",
        TABLE,
        "getQuestionarioByClienteId",
        error,
      )
    ) {
      return null;
    }
    handleSupabaseError("getQuestionarioByClienteId", error);
  }

  if (!data) {
    return null;
  }

  return mapQuestionarioToView(mapClienteQuestionarioRowToQuestionario(data));
}

export async function listQuestionari(): Promise<ClienteQuestionarioView[]> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .order("aggiornato_il", { ascending: false });

  if (error) {
    if (
      isDevMissingTableNoOp(
        "cliente-questionario",
        TABLE,
        "listQuestionari",
        error,
      )
    ) {
      return [];
    }
    handleSupabaseError("listQuestionari", error);
  }

  return (data ?? []).map((row) =>
    mapQuestionarioToView(mapClienteQuestionarioRowToQuestionario(row)),
  );
}
