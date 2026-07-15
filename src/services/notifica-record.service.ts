import { getOrganizationId } from "@/config/organization";
import { getAuthenticatedUserId } from "@/auth/session-store";
import { getSupabaseClient } from "@/config/supabase";
import { isDevMissingTableNoOp } from "@/lib/supabase/missing-table";
import type { NotificaTipo } from "@/types/notifica";

export class NotificaRecordError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NotificaRecordError";
  }
}

const TABLE = "notifiche";

function handleSupabaseError(operation: string, error: { message: string; code?: string }) {
  throw new NotificaRecordError(
    `[${operation}] ${error.message}${error.code ? ` (${error.code})` : ""}`,
  );
}

export type RecordNotificaInput = {
  tipo: NotificaTipo;
  titolo: string;
  messaggio: string;
  href?: string | null;
  userId?: string | null;
};

export async function recordNotifica(input: RecordNotificaInput): Promise<void> {
  const supabase = getSupabaseClient();
  const organizationId = await getOrganizationId();

  const { error } = await supabase.from(TABLE).insert({
    organization_id: organizationId,
    user_id: input.userId ?? getAuthenticatedUserId(),
    tipo: input.tipo,
    titolo: input.titolo,
    messaggio: input.messaggio,
    href: input.href ?? null,
    letta: false,
  });

  if (error) {
    if (isDevMissingTableNoOp("notifica-record", TABLE, "recordNotifica", error)) {
      return;
    }
    handleSupabaseError("recordNotifica", error);
  }
}
