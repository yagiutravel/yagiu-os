import { getSupabaseClient } from "@/config/supabase";
import { isDevMissingTableNoOp } from "@/lib/supabase/missing-table";
import {
  mapClienteDocumentiData,
  mapClienteDocumentoRowToDocumento,
} from "@/mappers/cliente-documento.mapper";
import type { ClienteDocumentiData, ClienteDocumento } from "@/types/cliente-documento";
import type { ClienteDocumentoRow } from "@/types/database";

export class ClienteDocumentoServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ClienteDocumentoServiceError";
  }
}

const TABLE = "cliente_documenti";

function handleSupabaseError(
  operation: string,
  error: { message: string; code?: string },
): never {
  throw new ClienteDocumentoServiceError(
    `[${operation}] ${error.message}${error.code ? ` (${error.code})` : ""}`,
  );
}

export async function getDocumentiByClienteId(
  clienteId: string,
): Promise<ClienteDocumentiData> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("cliente_id", clienteId)
    .order("aggiornato_il", { ascending: false });

  if (error) {
    if (
      isDevMissingTableNoOp(
        "cliente-documento",
        TABLE,
        "getDocumentiByClienteId",
        error,
      )
    ) {
      return { documenti: [] };
    }
    handleSupabaseError("getDocumentiByClienteId", error);
  }

  const documenti = ((data ?? []) as ClienteDocumentoRow[]).map(
    mapClienteDocumentoRowToDocumento,
  );

  return mapClienteDocumentiData(documenti);
}

export async function listAllDocumenti(): Promise<ClienteDocumento[]> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .order("aggiornato_il", { ascending: false });

  if (error) {
    if (
      isDevMissingTableNoOp(
        "cliente-documento",
        TABLE,
        "listAllDocumenti",
        error,
      )
    ) {
      return [];
    }
    handleSupabaseError("listAllDocumenti", error);
  }

  return ((data ?? []) as ClienteDocumentoRow[]).map(
    mapClienteDocumentoRowToDocumento,
  );
}
