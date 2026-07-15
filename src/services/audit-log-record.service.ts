import { getSupabaseClient } from "@/config/supabase";
import { AUDIT_UTENTE_SISTEMA } from "@/lib/audit/constants";
import type { RecordAuditLogInput } from "@/lib/audit/constants";
import type { AuditLogRow } from "@/types/audit-log";

export class AuditLogRecordError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuditLogRecordError";
  }
}

const TABLE = "audit_log";

function handleSupabaseError(operation: string, error: { message: string; code?: string }) {
  throw new AuditLogRecordError(
    `[${operation}] ${error.message}${error.code ? ` (${error.code})` : ""}`,
  );
}

export async function recordAuditLog(input: RecordAuditLogInput): Promise<void> {
  const supabase = getSupabaseClient();

  const { error } = await supabase.from(TABLE).insert({
    utente: input.utente ?? AUDIT_UTENTE_SISTEMA,
    azione: input.azione,
    tipo: input.tipo,
    azione_tipo: input.azioneTipo,
    entita_id: input.entitaId ?? null,
    entita_label: input.entitaLabel,
  });

  if (error) {
    if (
      error.code === "PGRST205" ||
      error.message.includes("Could not find the table")
    ) {
      return;
    }
    handleSupabaseError("recordAuditLog", error);
  }
}

export async function fetchAuditLogRows(limit = 200): Promise<AuditLogRow[]> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .order("data", { ascending: false })
    .limit(limit);

  if (error) {
    if (
      error.code === "PGRST205" ||
      error.message.includes("Could not find the table")
    ) {
      return [];
    }
    handleSupabaseError("fetchAuditLogRows", error);
  }

  return (data ?? []) as AuditLogRow[];
}
