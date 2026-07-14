import Link from "next/link";
import {
  ArrowLeft,
  CalendarRange,
  Euro,
  MapPin,
  Users,
} from "lucide-react";
import { profiloSectionLabel } from "@/lib/clienti/profilo-ui";
import {
  formatPartecipanti,
  formatTourDate,
} from "@/lib/tour/utils";
import type { TourDettaglio } from "@/types/tour-scheda";
import { TourSchedaActions } from "./TourSchedaActions";

type TourSchedaHeaderProps = {
  tour: TourDettaglio;
  onChanged: () => void;
};

type InfoCard = {
  label: string;
  value: string;
  icon: typeof MapPin;
};

export function TourSchedaHeader({ tour, onChanged }: TourSchedaHeaderProps) {
  const dateRange = `${formatTourDate(tour.dataPartenza)} — ${formatTourDate(tour.dataRitorno)}`;

  const infoCards: InfoCard[] = [
    { label: "Date", value: dateRange, icon: CalendarRange },
    { label: "Destinazione", value: tour.destinazione, icon: MapPin },
    { label: "Prezzo", value: tour.prezzo, icon: Euro },
    {
      label: "Partecipanti",
      value: formatPartecipanti(tour.numeroPartecipanti, tour.capienzaMassima),
      icon: Users,
    },
  ];

  return (
    <div className="space-y-6">
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm">
        <Link
          href="/tour"
          className="inline-flex items-center gap-1.5 rounded-md px-1 py-0.5 text-zinc-500 transition-colors duration-200 hover:bg-zinc-50 hover:text-zinc-900"
        >
          <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden />
          Tour
        </Link>
        <span className="text-zinc-300" aria-hidden>
          /
        </span>
        <span className="truncate font-medium text-zinc-900">{tour.nomeTour}</span>
      </nav>

      <div className="min-w-0">
        <p className={profiloSectionLabel}>Scheda Tour</p>
        <div className="mt-1.5 flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
              {tour.nomeTour}
            </h1>
            <p className="mt-1.5 text-sm text-zinc-500">
              Tour Leader:{" "}
              <span className="font-medium text-zinc-700">{tour.tourLeader}</span>
            </p>
          </div>
          <TourSchedaActions tour={tour} onChanged={onChanged} />
        </div>
        {tour.descrizione && (
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-zinc-600">
            {tour.descrizione}
          </p>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {infoCards.map((card) => {
          const Icon = card.icon;

          return (
            <div
              key={card.label}
              className="flex items-start gap-3 rounded-xl border border-zinc-200/60 bg-zinc-50/40 p-4 transition-all duration-200 hover:border-zinc-300/80 hover:bg-white hover:shadow-[0_2px_8px_rgba(0,0,0,0.04)]"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-zinc-400 ring-1 ring-inset ring-zinc-200/80">
                <Icon className="h-4 w-4" strokeWidth={1.75} aria-hidden />
              </div>
              <div className="min-w-0">
                <p className={profiloSectionLabel}>{card.label}</p>
                <p className="mt-1 text-sm font-medium text-zinc-900">{card.value}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
