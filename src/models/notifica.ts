import type { Notifica } from "@/types/notifica";

export function createNotificaId(): string {
  return `notif-${crypto.randomUUID()}`;
}

export function createNotifica(
  data: Omit<Notifica, "id" | "creatoIl">,
): Notifica {
  return {
    id: createNotificaId(),
    ...data,
    creatoIl: data.data,
  };
}

export function formatNotificaData(isoDate: string): string {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("it-IT", {
    day: "numeric",
    month: "short",
  });
}

export function formatNotificaOra(isoDate: string): string {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleTimeString("it-IT", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function sortNotifiche(notifiche: Notifica[]): Notifica[] {
  return [...notifiche].sort(
    (a, b) => new Date(b.data).getTime() - new Date(a.data).getTime(),
  );
}

export function countNotificheNonLette(notifiche: Notifica[]): number {
  return notifiche.filter((item) => !item.letta).length;
}
