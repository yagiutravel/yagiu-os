import {
  getAuthenticatedOrganizationId,
  getAuthenticatedUserId,
  getAuthenticatedUserLabel,
} from "@/auth/session-store";
import { getOrganizationId } from "@/config/organization";
import { getSupabaseClient } from "@/config/supabase";
import { isDevMissingTableNoOp } from "@/lib/supabase/missing-table";
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
  const organizationId =
    getAuthenticatedOrganizationId() ?? (await getOrganizationId());
  const userId = getAuthenticatedUserId();

  const { error } = await supabase.from(TABLE).insert({
    organization_id: organizationId,
    user_id: userId,
    utente: input.utente ?? getAuthenticatedUserLabel(),
    azione: input.azione,
    tipo: input.tipo,
    azione_tipo: input.azioneTipo,
    entita_id: input.entitaId ?? null,
    entita_label: input.entitaLabel,
  });

  if (error) {
    if (isDevMissingTableNoOp("audit-log-record", TABLE, "recordAuditLog", error)) {
      return;
    }
    handleSupabaseError("recordAuditLog", error);
  }
}

export async function fetchAuditLogRows(limit = 200): Promise<AuditLogRow[]> {
  const supabase = getSupabaseClient();
  const organizationId = await getOrganizationId();

  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("organization_id", organizationId)
    .order("data", { ascending: false })
    .limit(limit);

  if (error) {
    if (isDevMissingTableNoOp("audit-log-record", TABLE, "fetchAuditLogRows", error)) {
      return [];
    }
    handleSupabaseError("fetchAuditLogRows", error);
  }

  return (data ?? []) as AuditLogRow[];
}
