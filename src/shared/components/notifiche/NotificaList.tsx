"use client";

import { useRouter } from "next/navigation";
import { NOTIFICA_TIPO_CONFIG } from "@/lib/notifiche/tipo.config";
import type { NotificaView } from "@/types/notifica";
import { NotificaTipoBadge } from "./NotificaTipoBadge";

type NotificaListProps = {
  notifiche: NotificaView[];
  onMarkAsRead: (id: string) => void;
};

export function NotificaList({ notifiche, onMarkAsRead }: NotificaListProps) {
  const router = useRouter();

  if (notifiche.length === 0) {
    return (
      <p className="px-4 py-10 text-center text-sm text-zinc-500">
        Nessuna notifica trovata.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-zinc-100">
      {notifiche.map((notifica) => {
        const config = NOTIFICA_TIPO_CONFIG[notifica.tipo];
        const Icon = config.icon;

        return (
          <li key={notifica.id}>
            <button
              type="button"
              onClick={() => {
                if (!notifica.letta) {
                  onMarkAsRead(notifica.id);
                }
                if (notifica.href) {
                  router.push(notifica.href);
                }
              }}
              className={`flex w-full gap-3 px-4 py-3.5 text-left transition-colors hover:bg-zinc-50 ${
                !notifica.letta ? "bg-sky-50/30" : ""
              }`}
            >
              <div
                className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ring-1 ring-inset ${config.bg} ${config.text} ${config.ring}`}
              >
                <Icon className="h-4 w-4" strokeWidth={1.75} aria-hidden />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <p
                    className={`text-sm ${
                      notifica.letta
                        ? "font-medium text-zinc-700"
                        : "font-semibold text-zinc-900"
                    }`}
                  >
                    {notifica.titolo}
                  </p>
                  {!notifica.letta && (
                    <span
                      className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-sky-500"
                      aria-hidden
                    />
                  )}
                </div>

                <p className="mt-1 text-sm leading-relaxed text-zinc-600">
                  {notifica.messaggio}
                </p>

                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <NotificaTipoBadge tipo={notifica.tipo} />
                  <span className="text-xs text-zinc-400">
                    {notifica.dataFormattata} · {notifica.oraFormattata}
                  </span>
                </div>
              </div>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
