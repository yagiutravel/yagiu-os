"use client";

import { useCallback, useEffect, useState, startTransition } from "react";
import { useRouter } from "next/navigation";
import { Compass } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Spinner } from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/Toast";
import { partitionTourClienteViews } from "@/mappers/tour-partecipazione.mapper";
import { getTourByClienteId } from "@/services/tour-partecipazione.service";
import type { TourClienteView } from "@/types/tour-partecipazione";
import { TourStatoBadge } from "@/components/tour/TourStatoBadge";
import { PartecipazioneBadge } from "@/components/tour/PartecipazioneBadge";
import { getErrorMessage } from "@/shared/utils/error";

type ClienteSchedaViaggiProps = {
  clienteId: string;
};

function ClienteTourList({ tours }: { tours: TourClienteView[] }) {
  const router = useRouter();

  return (
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
  );
}

export function ClienteSchedaViaggi({ clienteId }: ClienteSchedaViaggiProps) {
  const { showToast } = useToast();
  const [tours, setTours] = useState<TourClienteView[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getTourByClienteId(clienteId);
      setTours(data);
    } catch (error) {
      showToast(
        `Impossibile caricare i viaggi. ${getErrorMessage(error)}`,
        "error",
      );
      setTours([]);
    } finally {
      setLoading(false);
    }
  }, [clienteId, showToast]);

  useEffect(() => {
    startTransition(() => {
      void loadData();
    });
  }, [loadData]);

  const { attivi, storico } = partitionTourClienteViews(tours);

  return (
    <Card>
      <CardHeader
        title="Viaggi"
        description="Viaggi associati e storico."
      />
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="flex items-center gap-3 text-sm text-zinc-500">
              <Spinner className="h-5 w-5" />
              Caricamento viaggi...
            </div>
          </div>
        ) : tours.length === 0 ? (
          <EmptyState
            icon={Compass}
            title="Nessun viaggio associato"
            description="I tour del viaggiatore compariranno qui."
          />
        ) : (
          <div className="space-y-8">
            {attivi.length > 0 && (
              <section className="space-y-3">
                <h3 className="text-sm font-medium text-zinc-900">
                  Viaggi attivi
                </h3>
                <ClienteTourList tours={attivi} />
              </section>
            )}
            {storico.length > 0 && (
              <section className="space-y-3">
                <h3 className="text-sm font-medium text-zinc-900">Storico</h3>
                <ClienteTourList tours={storico} />
              </section>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
