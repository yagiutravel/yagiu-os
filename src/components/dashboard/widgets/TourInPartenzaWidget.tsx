"use client";

import { useRouter } from "next/navigation";
import { Compass } from "lucide-react";
import { formatDashboardDate, formatGiorniMancanti } from "@/models/dashboard";
import { TourStatoBadge } from "@/components/tour/TourStatoBadge";
import type { DashboardTourInPartenza } from "@/types/dashboard";
import { DashboardWidget } from "../DashboardWidget";

type TourInPartenzaWidgetProps = {
  tours: DashboardTourInPartenza[];
};

function formatDataPartenza(isoDate: string): string {
  return formatDashboardDate(isoDate, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function TourInPartenzaWidget({ tours }: TourInPartenzaWidgetProps) {
  const router = useRouter();

  return (
    <DashboardWidget
      title="Tour in partenza"
      description="Prossime partenze che richiedono attenzione."
      href="/tour"
    >
      {tours.length === 0 ? (
        <p className="py-8 text-center text-sm text-zinc-500">
          Nessun tour in partenza.
        </p>
      ) : (
        <div className="space-y-2">
          {tours.map((tour) => (
            <button
              key={tour.tourId}
              type="button"
              onClick={() => router.push(`/tour/${tour.tourId}`)}
              className="flex w-full flex-col gap-3 rounded-xl border border-zinc-200/60 bg-zinc-50/40 p-4 text-left transition-all duration-200 hover:border-zinc-300/80 hover:bg-white hover:shadow-[0_2px_8px_rgba(0,0,0,0.04)] sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex min-w-0 items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-50 ring-1 ring-inset ring-sky-600/10">
                  <Compass className="h-4 w-4 text-sky-600" strokeWidth={1.75} />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-zinc-900">
                    {tour.nomeTour}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-zinc-500">
                    {tour.destinazione} · {formatDataPartenza(tour.dataPartenza)}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                <span className="text-xs font-medium text-zinc-600">
                  {formatGiorniMancanti(tour.giorniMancanti)}
                </span>
                <TourStatoBadge stato={tour.stato} />
              </div>
            </button>
          ))}
        </div>
      )}
    </DashboardWidget>
  );
}
