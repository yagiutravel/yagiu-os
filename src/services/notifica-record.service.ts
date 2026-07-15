import { getSupabaseClient } from "@/config/supabase";
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
};

export async function recordNotifica(input: RecordNotificaInput): Promise<void> {
  const supabase = getSupabaseClient();

  const { error } = await supabase.from(TABLE).insert({
    tipo: input.tipo,
    titolo: input.titolo,
    messaggio: input.messaggio,
    href: input.href ?? null,
    letta: false,
  });

  if (error) {
    if (
      error.code === "PGRST205" ||
      error.message.includes("Could not find the table")
    ) {
      return;
    }
    handleSupabaseError("recordNotifica", error);
  }
}
