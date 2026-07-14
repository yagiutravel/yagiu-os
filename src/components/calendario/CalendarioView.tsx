"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Calendar, SearchX } from "lucide-react";
import { PageContent } from "@/shared/components/layout/PageContent";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Spinner } from "@/components/ui/Spinner";
import { formatTourDate } from "@/lib/tour/utils";
import { getTours } from "@/services/tour.service";
import { getErrorMessage } from "@/shared/utils/error";
import { useToast } from "@/components/ui/Toast";
import type { Tour } from "@/types/tour";
import { TourStatoBadge } from "@/components/tour/TourStatoBadge";

function monthKey(date: string): string {
  const parsed = new Date(`${date}T00:00:00`);
  return `${parsed.getFullYear()}-${String(parsed.getMonth() + 1).padStart(2, "0")}`;
}

function monthLabel(key: string): string {
  const [year, month] = key.split("-");
  const date = new Date(Number(year), Number(month) - 1, 1);
  return date.toLocaleDateString("it-IT", { month: "long", year: "numeric" });
}

export function CalendarioView() {
  const { showToast } = useToast();
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void getTours()
      .then((data) =>
        setTours(data.filter((tour) => tour.stato !== "Archiviato")),
      )
      .catch((error) =>
        showToast(`Impossibile caricare il calendario. ${getErrorMessage(error)}`, "error"),
      )
      .finally(() => setLoading(false));
  }, [showToast]);

  const grouped = useMemo(() => {
    const map = new Map<string, Tour[]>();
    for (const tour of tours) {
      const key = monthKey(tour.dataPartenza);
      const list = map.get(key) ?? [];
      list.push(tour);
      map.set(key, list);
    }

    return [...map.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, items]) => ({
        key,
        label: monthLabel(key),
        items: items.sort((a, b) => a.dataPartenza.localeCompare(b.dataPartenza)),
      }));
  }, [tours]);

  return (
    <PageContent>
      <div className="space-y-4">
        <Card>
          <CardHeader
            title="Calendario partenze"
            description="Tour programmati per mese con date di partenza e ritorno."
            action={
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-50 text-sky-700 ring-1 ring-inset ring-sky-600/15">
                <Calendar className="h-4 w-4" strokeWidth={1.75} />
              </div>
            }
          />
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Spinner className="h-5 w-5" />
              </div>
            ) : grouped.length === 0 ? (
              <EmptyState
                icon={SearchX}
                title="Nessun tour in calendario"
                description="Crea un tour per visualizzarlo nel calendario operativo."
              />
            ) : (
              <div className="space-y-6">
                {grouped.map((group) => (
                  <section key={group.key}>
                    <h3 className="mb-3 text-sm font-semibold capitalize text-zinc-900">
                      {group.label}
                    </h3>
                    <div className="space-y-2">
                      {group.items.map((tour) => (
                        <Link
                          key={tour.id}
                          href={`/tour/${tour.id}`}
                          className="flex flex-col gap-2 rounded-xl border border-zinc-200/70 bg-white px-4 py-3 transition-colors hover:bg-zinc-50 sm:flex-row sm:items-center sm:justify-between"
                        >
                          <div>
                            <p className="font-medium text-zinc-900">{tour.nomeTour}</p>
                            <p className="mt-0.5 text-sm text-zinc-500">
                              {formatTourDate(tour.dataPartenza)} →{" "}
                              {formatTourDate(tour.dataRitorno)} · {tour.destinazione}
                            </p>
                          </div>
                          <TourStatoBadge stato={tour.stato} />
                        </Link>
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageContent>
  );
}
