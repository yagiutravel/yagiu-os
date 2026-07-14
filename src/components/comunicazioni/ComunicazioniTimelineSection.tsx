"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, Users } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { profiloBadgeBase } from "@/lib/clienti/profilo-ui";
import type { ComunicazioneClienteTimeline } from "@/types/comunicazione";
import { ComunicazioneTimeline } from "./ComunicazioneTimeline";

type ComunicazioniTimelineSectionProps = {
  timelineClienti: ComunicazioneClienteTimeline[];
};

export function ComunicazioniTimelineSection({
  timelineClienti,
}: ComunicazioniTimelineSectionProps) {
  const router = useRouter();
  const [expandedId, setExpandedId] = useState<string | null>(
    timelineClienti[0]?.clienteId ?? null,
  );

  if (timelineClienti.length === 0) {
    return (
      <Card>
        <CardHeader
          title="Timeline comunicazioni"
          description="Stato delle comunicazioni per ogni viaggiatore."
        />
        <CardContent>
          <p className="py-10 text-center text-sm text-zinc-500">
            Nessuna timeline disponibile.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader
        title="Timeline comunicazioni"
        description="Stato delle comunicazioni per ogni viaggiatore."
        action={
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-100 text-zinc-600 ring-1 ring-inset ring-zinc-500/10">
            <Users className="h-4 w-4" strokeWidth={1.75} />
          </div>
        }
      />
      <CardContent className="space-y-3">
        {timelineClienti.map((timeline) => {
          const isExpanded = expandedId === timeline.clienteId;
          const progress = Math.round(
            (timeline.completati / timeline.totali) * 100,
          );

          return (
            <div
              key={timeline.clienteId}
              className="overflow-hidden rounded-xl border border-zinc-200/70 bg-white"
            >
              <button
                type="button"
                onClick={() =>
                  setExpandedId(isExpanded ? null : timeline.clienteId)
                }
                className="flex w-full items-center justify-between gap-4 px-4 py-4 text-left transition-colors duration-200 hover:bg-zinc-50/80"
                aria-expanded={isExpanded}
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-zinc-900">
                    {timeline.clienteNome}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <span
                      className={`${profiloBadgeBase} bg-sky-50 text-sky-700 ring-sky-600/15`}
                    >
                      {timeline.completati}/{timeline.totali} completati
                    </span>
                    <span className="text-xs text-zinc-500">{progress}%</span>
                  </div>
                </div>
                <ChevronDown
                  className={`h-4 w-4 shrink-0 text-zinc-400 transition-transform duration-200 ${
                    isExpanded ? "rotate-180" : ""
                  }`}
                  strokeWidth={1.75}
                />
              </button>

              {isExpanded && (
                <div className="border-t border-zinc-200/70 px-4 py-4">
                  <ComunicazioneTimeline eventi={timeline.eventi} />
                  <button
                    type="button"
                    onClick={() => router.push(`/clienti/${timeline.clienteId}`)}
                    className="mt-4 text-xs font-medium text-zinc-500 transition-colors duration-200 hover:text-zinc-900"
                  >
                    Apri scheda cliente →
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
