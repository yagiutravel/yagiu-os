import { getSupabaseClient } from "@/config/supabase";
import { isDevMissingTableNoOp } from "@/lib/supabase/missing-table";
import { mapClienteNoteStaffRowToNotaStaff } from "@/mappers/note-staff.mapper";
import type { ClienteNoteStaffRow } from "@/types/database";
import type { NotaStaff } from "@/types/note-staff";

export class ClienteNoteStaffServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ClienteNoteStaffServiceError";
  }
}

const TABLE = "cliente_note_staff";

function handleSupabaseError(
  operation: string,
  error: { message: string; code?: string },
): never {
  throw new ClienteNoteStaffServiceError(
    `[${operation}] ${error.message}${error.code ? ` (${error.code})` : ""}`,
  );
}

export async function getNoteStaffByClienteId(
  clienteId: string,
): Promise<NotaStaff[]> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("cliente_id", clienteId)
    .order("data", { ascending: false });

  if (error) {
    if (
      isDevMissingTableNoOp(
        "cliente-note-staff",
        TABLE,
        "getNoteStaffByClienteId",
        error,
      )
    ) {
      return [];
    }
    handleSupabaseError("getNoteStaffByClienteId", error);
  }

  return ((data ?? []) as ClienteNoteStaffRow[]).map(
    mapClienteNoteStaffRowToNotaStaff,
  );
}
