"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Map, SearchX } from "lucide-react";
import { PageContent } from "@/shared/components/layout/PageContent";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Spinner } from "@/components/ui/Spinner";
import {
  formatPartecipanti,
  formatTourDate,
} from "@/lib/tour/utils";
import { getTours } from "@/services/tour.service";
import { getErrorMessage } from "@/shared/utils/error";
import { useToast } from "@/components/ui/Toast";
import type { Tour } from "@/types/tour";
import { TourStatoBadge } from "@/components/tour/TourStatoBadge";

function isUpcomingTrip(tour: Tour, now = new Date()): boolean {
  const departure = new Date(`${tour.dataPartenza}T00:00:00`);
  return (
    tour.stato !== "Archiviato" &&
    tour.stato !== "Terminato" &&
    departure.getTime() >= now.getTime()
  );
}

export function ViaggiView() {
  const { showToast } = useToast();
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void getTours()
      .then(setTours)
      .catch((error) =>
        showToast(`Impossibile caricare i viaggi. ${getErrorMessage(error)}`, "error"),
      )
      .finally(() => setLoading(false));
  }, [showToast]);

  const sections = useMemo(() => {
    const inCorso = tours.filter((tour) => tour.stato === "In corso");
    const upcoming = tours.filter((tour) => isUpcomingTrip(tour));
    const recenti = tours.filter((tour) => tour.stato === "Terminato").slice(0, 5);
    return { inCorso, upcoming, recenti };
  }, [tours]);

  const renderList = (items: Tour[]) => (
    <div className="space-y-2">
      {items.map((tour) => (
        <Link
          key={tour.id}
          href={`/tour/${tour.id}`}
          className="flex flex-col gap-2 rounded-xl border border-zinc-200/70 bg-white px-4 py-3 transition-colors hover:bg-zinc-50 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <p className="font-medium text-zinc-900">{tour.nomeTour}</p>
            <p className="mt-0.5 text-sm text-zinc-500">
              {formatTourDate(tour.dataPartenza)} · {tour.destinazione} ·{" "}
              {formatPartecipanti(tour.numeroPartecipanti, tour.capienzaMassima)} pax
            </p>
          </div>
          <TourStatoBadge stato={tour.stato} />
        </Link>
      ))}
    </div>
  );

  const hasData =
    sections.inCorso.length > 0 ||
    sections.upcoming.length > 0 ||
    sections.recenti.length > 0;

  return (
    <PageContent>
      <Card>
        <CardHeader
          title="Viaggi operativi"
          description="Tour in corso, prossime partenze e viaggi recenti."
          action={
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/15">
              <Map className="h-4 w-4" strokeWidth={1.75} />
            </div>
          }
        />
        <CardContent className="space-y-8">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Spinner className="h-5 w-5" />
            </div>
          ) : !hasData ? (
            <EmptyState
              icon={SearchX}
              title="Nessun viaggio attivo"
              description="I tour creati compariranno qui automaticamente."
            />
          ) : (
            <>
              {sections.inCorso.length > 0 && (
                <section>
                  <h3 className="mb-3 text-sm font-semibold text-zinc-900">In corso</h3>
                  {renderList(sections.inCorso)}
                </section>
              )}
              {sections.upcoming.length > 0 && (
                <section>
                  <h3 className="mb-3 text-sm font-semibold text-zinc-900">
                    Prossime partenze
                  </h3>
                  {renderList(sections.upcoming)}
                </section>
              )}
              {sections.recenti.length > 0 && (
                <section>
                  <h3 className="mb-3 text-sm font-semibold text-zinc-900">
                    Completati di recente
                  </h3>
                  {renderList(sections.recenti)}
                </section>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </PageContent>
  );
}
