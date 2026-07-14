import { profiloBadgeBase } from "@/lib/clienti/profilo-ui";
import { TIMELINE_EVENTO_CONFIG } from "@/lib/clienti/timeline-viaggiatore.config";
import type { TimelineEvento } from "@/types/timeline-viaggiatore";

type TimelineProps = {
  eventi: TimelineEvento[];
};

function formatEventDate(isoDate: string): string {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("it-IT", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function Timeline({ eventi }: TimelineProps) {
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
        const config = TIMELINE_EVENTO_CONFIG[evento.tipo];
        const Icon = config.icon;
        const isLast = index === eventi.length - 1;

        return (
          <li key={evento.id} className="relative flex gap-4 pb-8 last:pb-0">
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

            <div className="min-w-0 flex-1 rounded-xl px-3 py-2 transition-colors duration-200 hover:bg-zinc-50/80">
              <div className="flex flex-col gap-1.5 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-zinc-900">{evento.titolo}</p>
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
                  {formatEventDate(evento.data)}
                </time>
              </div>
              <p className="mt-2.5 text-sm leading-relaxed text-zinc-600">
                {evento.descrizione}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
