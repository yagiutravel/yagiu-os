import { getOrganizationId } from "@/config/organization";
import { getAuthenticatedUserId } from "@/auth/session-store";
import { getSupabaseClient } from "@/config/supabase";
import { mapNotificheToViews, mapNotificaRowToNotifica } from "@/mappers/notifica.mapper";
import { countNotificheNonLette } from "@/models/notifica";
import type {
  NotificaStatoFiltro,
  NotificaTipo,
  NotificaView,
} from "@/types/notifica";

export class NotificaServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NotificaServiceError";
  }
}

const TABLE = "notifiche";

async function fetchNotificheFromSupabase() {
  const supabase = getSupabaseClient();
  const organizationId = await getOrganizationId();
  const userId = getAuthenticatedUserId();

  let query = supabase
    .from(TABLE)
    .select("*")
    .eq("organization_id", organizationId)
    .order("data", { ascending: false })
    .limit(200);

  if (userId) {
    query = query.or(`user_id.is.null,user_id.eq.${userId}`);
  }

  const { data, error } = await query;

  if (error) {
    if (
      error.code === "PGRST205" ||
      error.message.includes("Could not find the table")
    ) {
      return [];
    }
    throw new NotificaServiceError(error.message);
  }

  return (data ?? []).map((row) =>
    mapNotificaRowToNotifica({
      ...row,
      tipo: row.tipo as NotificaTipo,
    }),
  );
}

export async function getNotifiche(): Promise<NotificaView[]> {
  const rows = await fetchNotificheFromSupabase();
  return mapNotificheToViews(rows);
}

export async function getNotificheNonLetteCount(): Promise<number> {
  const rows = await fetchNotificheFromSupabase();
  return countNotificheNonLette(rows);
}

export async function markNotificaAsRead(id: string): Promise<NotificaView | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from(TABLE)
    .update({ letta: true })
    .eq("id", id)
    .select("*")
    .maybeSingle();

  if (error) throw new NotificaServiceError(error.message);
  if (!data) return null;

  return mapNotificheToViews([
    mapNotificaRowToNotifica({
      ...data,
      tipo: data.tipo as NotificaTipo,
    }),
  ])[0];
}

export async function markAllNotificheAsRead(): Promise<void> {
  const supabase = getSupabaseClient();
  const organizationId = await getOrganizationId();
  const { error } = await supabase
    .from(TABLE)
    .update({ letta: true })
    .eq("organization_id", organizationId)
    .eq("letta", false);

  if (error) throw new NotificaServiceError(error.message);
}

export function filterNotifiche(
  notifiche: NotificaView[],
  stato: NotificaStatoFiltro,
  tipo: NotificaTipo | "tutti" = "tutti",
): NotificaView[] {
  const byStato =
    stato === "tutte"
      ? notifiche
      : stato === "non_lette"
        ? notifiche.filter((n) => !n.letta)
        : notifiche.filter((n) => n.letta);

  if (tipo === "tutti") return byStato;
  return byStato.filter((n) => n.tipo === tipo);
}
