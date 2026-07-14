import { Check } from "lucide-react";
import { profiloBadgeBase } from "@/lib/clienti/profilo-ui";
import { COMUNICAZIONE_EVENTO_CONFIG } from "@/lib/comunicazioni/timeline.config";
import { formatComunicazioneData } from "@/models/comunicazione";
import type { ComunicazioneEventoTimeline } from "@/types/comunicazione";

type ComunicazioneTimelineProps = {
  eventi: ComunicazioneEventoTimeline[];
};

export function ComunicazioneTimeline({ eventi }: ComunicazioneTimelineProps) {
  if (eventi.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-zinc-500">
        Nessun evento nella timeline comunicazioni.
      </p>
    );
  }

  return (
    <ol className="relative space-y-0">
      {eventi.map((evento, index) => {
        const config = COMUNICAZIONE_EVENTO_CONFIG[evento.tipo];
        const Icon = config.icon;
        const isLast = index === eventi.length - 1;

        return (
          <li key={evento.id} className="relative flex gap-4 pb-6 last:pb-0">
            {!isLast && (
              <span
                className="absolute left-5 top-11 bottom-0 w-px bg-zinc-200/80"
                aria-hidden
              />
            )}

            <div
              className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ring-1 ring-inset transition-colors duration-200 ${
                evento.completato
                  ? `${config.bg} ${config.text} ${config.ring}`
                  : "bg-zinc-50 text-zinc-400 ring-zinc-200/80"
              }`}
            >
              {evento.completato ? (
                <Check className="h-4 w-4" strokeWidth={2} aria-hidden />
              ) : (
                <Icon className="h-4 w-4" strokeWidth={1.75} aria-hidden />
              )}
            </div>

            <div className="min-w-0 flex-1 rounded-xl px-3 py-2 transition-colors duration-200 hover:bg-zinc-50/80">
              <div className="flex flex-col gap-1.5 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                <div className="min-w-0">
                  <p
                    className={`text-sm font-semibold ${
                      evento.completato ? "text-zinc-900" : "text-zinc-500"
                    }`}
                  >
                    {evento.completato ? "✓ " : ""}
                    {evento.titolo}
                  </p>
                  <span
                    className={`mt-1.5 ${profiloBadgeBase} ${
                      evento.completato
                        ? "bg-emerald-50 text-emerald-700 ring-emerald-600/15"
                        : "bg-zinc-100 text-zinc-500 ring-zinc-500/10"
                    }`}
                  >
                    {evento.completato ? "Completato" : "In attesa"}
                  </span>
                </div>
                {evento.data && (
                  <time
                    dateTime={evento.data}
                    className="shrink-0 text-xs text-zinc-500 sm:text-right"
                  >
                    {formatComunicazioneData(evento.data)}
                  </time>
                )}
              </div>
              <p className="mt-2 text-sm leading-relaxed text-zinc-600">
                {evento.descrizione}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
