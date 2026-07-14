"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Compass } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { getTourByClienteId } from "@/services/tour-partecipazione.service";
import type { TourClienteView } from "@/types/tour-partecipazione";
import { TourStatoBadge } from "@/components/tour/TourStatoBadge";
import { PartecipazioneBadge } from "@/components/tour/PartecipazioneBadge";

type ProfiloViaggiatoreTourEffettuatiProps = {
  clienteId: string;
};

export function ProfiloViaggiatoreTourEffettuati({
  clienteId,
}: ProfiloViaggiatoreTourEffettuatiProps) {
  const router = useRouter();
  const [tours, setTours] = useState<TourClienteView[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    void getTourByClienteId(clienteId)
      .then((data) => {
        if (active) setTours(data);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [clienteId]);

  return (
    <Card>
      <CardHeader
        title="Tour effettuati"
        description="Tour a cui il viaggiatore ha partecipato o è iscritto."
      />
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-10">
            <div className="flex items-center gap-3 text-sm text-zinc-500">
              <Spinner className="h-5 w-5" />
              Caricamento tour...
            </div>
          </div>
        ) : tours.length === 0 ? (
          <div className="flex items-center justify-center rounded-xl border border-dashed border-zinc-200/80 bg-zinc-50/40 px-8 py-12 text-center">
            <div>
              <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100">
                <Compass className="h-4 w-4 text-zinc-400" strokeWidth={1.75} />
              </div>
              <p className="text-sm font-medium text-zinc-900">
                Nessun tour associato
              </p>
              <p className="mt-1 text-sm text-zinc-500">
                I tour del viaggiatore compariranno qui.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {tours.map((tour) => (
              <button
                key={tour.partecipazioneId}
                type="button"
                onClick={() => router.push(`/tour/${tour.tourId}`)}
                className="flex w-full flex-col gap-3 rounded-xl border border-zinc-200/60 bg-zinc-50/40 p-4 text-left transition-all duration-200 hover:border-zinc-300/80 hover:bg-white hover:shadow-[0_2px_8px_rgba(0,0,0,0.04)] sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-zinc-900">
                    {tour.nomeTour}
                  </p>
                  <p className="mt-0.5 text-xs text-zinc-500">
                    {tour.destinazione} · {tour.anno}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <PartecipazioneBadge kind="ruolo" value={tour.ruolo} />
                  <TourStatoBadge stato={tour.statoTour} />
                </div>
              </button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
