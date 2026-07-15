import { getSupabaseClient } from "@/config/supabase";
import { mapNotificheToViews, mapNotificaRowToNotifica } from "@/mappers/notifica.mapper";
import {
  listNotificheMock,
  markAllNotificheAsReadMock,
  markNotificaAsReadMock,
} from "@/mock/notifiche";
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
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .order("data", { ascending: false })
    .limit(200);

  if (error) {
    if (
      error.code === "PGRST205" ||
      error.message.includes("Could not find the table")
    ) {
      return null;
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
  if (rows) return mapNotificheToViews(rows);
  return mapNotificheToViews(listNotificheMock());
}

export async function getNotificheNonLetteCount(): Promise<number> {
  const rows = await fetchNotificheFromSupabase();
  if (rows) return countNotificheNonLette(rows);
  return countNotificheNonLette(listNotificheMock());
}

export async function markNotificaAsRead(id: string): Promise<NotificaView | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from(TABLE)
    .update({ letta: true })
    .eq("id", id)
    .select("*")
    .maybeSingle();

  if (!error && data) {
    return mapNotificheToViews([
      mapNotificaRowToNotifica({
        ...data,
        tipo: data.tipo as NotificaTipo,
      }),
    ])[0];
  }

  const updated = markNotificaAsReadMock(id);
  if (!updated) return null;
  return mapNotificheToViews([updated])[0];
}

export async function markAllNotificheAsRead(): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase.from(TABLE).update({ letta: true }).eq("letta", false);

  if (error) {
    markAllNotificheAsReadMock();
  }
}

export function filterNotifiche(
  notifiche: NotificaView[],
  stato: NotificaStatoFiltro,
  tipo: NotificaTipo | "tutti",
): NotificaView[] {
  return notifiche.filter((item) => {
    const matchesStato =
      stato === "tutte" ||
      (stato === "lette" && item.letta) ||
      (stato === "non_lette" && !item.letta);

    const matchesTipo = tipo === "tutti" || item.tipo === tipo;

    return matchesStato && matchesTipo;
  });
}
