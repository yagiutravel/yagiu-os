"use client";

import { useRouter } from "next/navigation";
import { CalendarDays } from "lucide-react";
import type {
  DashboardCalendario,
  DashboardCalendarioEventoTipo,
} from "@/types/dashboard";
import { formatDashboardDate, formatDashboardMonthYear } from "@/models/dashboard";
import { DashboardWidget } from "../DashboardWidget";

type CalendarioWidgetProps = {
  calendario: DashboardCalendario;
};

const EVENTO_STYLES: Record<
  DashboardCalendarioEventoTipo,
  { dot: string; label: string }
> = {
  partenza: { dot: "bg-sky-500", label: "Partenza" },
  rientro: { dot: "bg-emerald-500", label: "Rientro" },
  scadenza: { dot: "bg-amber-500", label: "Scadenza" },
  attivita: { dot: "bg-violet-500", label: "Attività" },
};

const WEEKDAYS = ["L", "M", "M", "G", "V", "S", "D"];

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstWeekday(year: number, month: number): number {
  const day = new Date(year, month, 1).getDay();
  return day === 0 ? 6 : day - 1;
}

export function CalendarioWidget({ calendario }: CalendarioWidgetProps) {
  const router = useRouter();
  const { anno, mese, eventi } = calendario;
  const daysInMonth = getDaysInMonth(anno, mese);
  const firstWeekday = getFirstWeekday(anno, mese);

  const eventDays = new Map<string, DashboardCalendarioEventoTipo[]>();
  for (const evento of eventi) {
    const day = evento.data.split("-")[2];
    const existing = eventDays.get(day) ?? [];
    existing.push(evento.tipo);
    eventDays.set(day, existing);
  }

  const monthLabel = formatDashboardMonthYear(anno, mese);

  const upcoming = eventi.slice(0, 4);

  return (
    <DashboardWidget
      title="Calendario"
      description="Partenze, rientri e scadenze."
      href="/calendario"
    >
      <button
        type="button"
        onClick={() => router.push("/calendario")}
        className="w-full space-y-4 text-left transition-opacity duration-200 hover:opacity-90"
      >
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium capitalize text-zinc-900">
            {monthLabel}
          </p>
          <CalendarDays className="h-4 w-4 text-zinc-400" strokeWidth={1.75} />
        </div>

        <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
          {WEEKDAYS.map((day, index) => (
            <span key={`${day}-${index}`}>{day}</span>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: firstWeekday }).map((_, index) => (
            <span key={`empty-${index}`} />
          ))}
          {Array.from({ length: daysInMonth }).map((_, index) => {
            const day = String(index + 1);
            const dayKey = day.padStart(2, "0");
            const types = eventDays.get(dayKey) ?? [];
            const hasEvents = types.length > 0;

            return (
              <div
                key={day}
                className={`flex h-8 flex-col items-center justify-center rounded-md text-xs ${
                  hasEvents
                    ? "bg-zinc-900 font-medium text-white"
                    : "text-zinc-600"
                }`}
              >
                {day}
                {hasEvents && (
                  <span className="mt-0.5 flex gap-0.5">
                    {types.slice(0, 2).map((tipo, i) => (
                      <span
                        key={`${day}-${tipo}-${i}`}
                        className={`h-1 w-1 rounded-full ${EVENTO_STYLES[tipo].dot}`}
                      />
                    ))}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        <div className="space-y-2 border-t border-zinc-100 pt-3">
          {upcoming.map((evento) => (
            <div key={evento.id} className="flex items-center gap-2">
              <span
                className={`h-2 w-2 shrink-0 rounded-full ${EVENTO_STYLES[evento.tipo].dot}`}
              />
              <p className="truncate text-xs text-zinc-600">
                {formatDashboardDate(evento.data, {
                  day: "numeric",
                  month: "short",
                })}{" "}
                · {evento.titolo}
              </p>
            </div>
          ))}
        </div>
      </button>
    </DashboardWidget>
  );
}
