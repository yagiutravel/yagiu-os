import { User } from "lucide-react";
import { profiloBadgeBase } from "@/lib/clienti/profilo-ui";
import { CLIENTE_TIMELINE_EVENTO_CONFIG } from "@/lib/clienti/cliente-timeline.config";
import { formatTimelineData } from "@/models/cliente-timeline";
import type { ClienteTimelineEvento } from "@/types/cliente-timeline";

type ClienteTimelineProps = {
  eventi: ClienteTimelineEvento[];
};

export function ClienteTimeline({ eventi }: ClienteTimelineProps) {
  if (eventi.length === 0) {
    return (
      <p className="py-10 text-center text-sm text-zinc-500">
        Nessun evento nella timeline.
      </p>
    );
  }

  return (
    <ol className="relative space-y-0">
      {eventi.map((evento, index) => {
        const config = CLIENTE_TIMELINE_EVENTO_CONFIG[evento.tipo];
        const Icon = config.icon;
        const isLast = index === eventi.length - 1;

        return (
          <li key={evento.id} className="relative flex gap-3 pb-8 last:pb-0 sm:gap-4">
            {!isLast && (
              <span
                className="absolute left-5 top-11 bottom-0 w-px bg-zinc-200/80"
                aria-hidden
              />
            )}

            <div
              className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ring-1 ring-inset transition-colors duration-200 ${config.bg} ${config.text} ${config.ring}`}
            >
              <Icon className="h-4 w-4" strokeWidth={1.75} aria-hidden />
            </div>

            <div className="min-w-0 flex-1 rounded-xl px-2 py-2 transition-colors duration-200 hover:bg-zinc-50/80 sm:px-3">
              <div className="flex flex-col gap-1.5 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-zinc-900">
                    {evento.titolo}
                  </p>
                  <span
                    className={`mt-1.5 ${profiloBadgeBase} ${config.bg} ${config.text} ${config.ring}`}
                  >
                    {config.label}
                  </span>
                </div>
                <time
                  dateTime={evento.data}
                  className="shrink-0 text-xs text-zinc-500 sm:text-right"
                >
                  {formatTimelineData(evento.data)}
                </time>
              </div>

              <p className="mt-2.5 text-sm leading-relaxed text-zinc-600">
                {evento.descrizione}
              </p>

              <div className="mt-2 flex items-center gap-1.5 text-xs text-zinc-400">
                <User className="h-3 w-3 shrink-0" strokeWidth={1.75} aria-hidden />
                <span>{evento.utente}</span>
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
