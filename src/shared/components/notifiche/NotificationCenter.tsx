"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Bell, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import {
  NOTIFICA_STATO_FILTRI,
  NOTIFICA_TIPO_FILTRI,
} from "@/lib/notifiche/constants";
import {
  filterNotifiche,
  getNotifiche,
  markAllNotificheAsRead,
  markNotificaAsRead,
} from "@/services/notifica.service";
import type {
  NotificaStatoFiltro,
  NotificaTipo,
  NotificaView,
} from "@/types/notifica";
import { NotificaList } from "./NotificaList";
import { getErrorMessage } from "@/shared/utils/error";


export function NotificationCenter() {
  const [open, setOpen] = useState(false);
  const [notifiche, setNotifiche] = useState<NotificaView[]>([]);
  const [loading, setLoading] = useState(false);
  const [stato, setStato] = useState<NotificaStatoFiltro>("tutte");
  const [tipo, setTipo] = useState<NotificaTipo | "tutti">("tutti");
  const panelRef = useRef<HTMLDivElement>(null);

  const loadNotifiche = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getNotifiche();
      setNotifiche(data);
    } catch (error) {
      console.error(`Impossibile caricare le notifiche. ${getErrorMessage(error)}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadNotifiche();
  }, [loadNotifiche]);

  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  const filtered = useMemo(
    () => filterNotifiche(notifiche, stato, tipo),
    [notifiche, stato, tipo],
  );

  const nonLette = useMemo(
    () => notifiche.filter((item) => !item.letta).length,
    [notifiche],
  );

  const handleMarkAsRead = async (id: string) => {
    const updated = await markNotificaAsRead(id);
    if (updated) {
      setNotifiche((prev) =>
        prev.map((item) => (item.id === id ? updated : item)),
      );
    }
  };

  const handleMarkAllAsRead = async () => {
    await markAllNotificheAsRead();
    setNotifiche((prev) => prev.map((item) => ({ ...item, letta: true })));
  };

  return (
    <div ref={panelRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="relative flex h-9 w-9 items-center justify-center rounded-md text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
        aria-label="Notifiche"
        aria-expanded={open}
        aria-haspopup="true"
      >
        <Bell className="h-4 w-4" strokeWidth={1.75} />
        {nonLette > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-sky-500 px-1 text-[10px] font-semibold text-white">
            {nonLette > 9 ? "9+" : nonLette}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-[min(100vw-2rem,24rem)] overflow-hidden rounded-xl border border-zinc-200/80 bg-white shadow-xl">
          <div className="flex items-center justify-between border-b border-zinc-100 px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-zinc-900">Notifiche</p>
              <p className="text-xs text-zinc-500">
                {nonLette} non {nonLette === 1 ? "letta" : "lette"}
              </p>
            </div>
            {nonLette > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => void handleMarkAllAsRead()}
                className="text-xs"
              >
                <CheckCheck className="h-3.5 w-3.5" />
                Segna tutte
              </Button>
            )}
          </div>

          <div className="space-y-2 border-b border-zinc-100 px-4 py-3">
            <div className="flex flex-wrap gap-1">
              {NOTIFICA_STATO_FILTRI.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setStato(option.value)}
                  className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium transition-colors ${
                    stato === option.value
                      ? "bg-zinc-900 text-white"
                      : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-1">
              {NOTIFICA_TIPO_FILTRI.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setTipo(option.value)}
                  className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium transition-colors ${
                    tipo === option.value
                      ? "bg-sky-100 text-sky-800"
                      : "bg-white text-zinc-500 ring-1 ring-zinc-200 hover:bg-zinc-50"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="max-h-[min(60vh,24rem)] overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Spinner className="h-5 w-5" />
              </div>
            ) : (
              <NotificaList
                notifiche={filtered}
                onMarkAsRead={(id) => void handleMarkAsRead(id)}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
