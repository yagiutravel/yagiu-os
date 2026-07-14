import { mapNotificheToViews } from "@/mappers/notifica.mapper";
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

export async function getNotifiche(): Promise<NotificaView[]> {
  return mapNotificheToViews(listNotificheMock());
}

export async function getNotificheNonLetteCount(): Promise<number> {
  return countNotificheNonLette(listNotificheMock());
}

export async function markNotificaAsRead(id: string): Promise<NotificaView | null> {
  const updated = markNotificaAsReadMock(id);
  if (!updated) return null;
  return mapNotificheToViews([updated])[0];
}

export async function markAllNotificheAsRead(): Promise<void> {
  markAllNotificheAsReadMock();
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
