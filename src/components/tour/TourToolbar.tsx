"use client";

import { Search } from "lucide-react";
import { TOUR_STATO_FILTER_OPTIONS } from "@/lib/tour/constants";
import type { TourStatoFilter } from "@/types/tour";

type TourToolbarProps = {
  search: string;
  stato: TourStatoFilter;
  resultCount: number;
  onSearchChange: (value: string) => void;
  onStatoChange: (stato: TourStatoFilter) => void;
};

export function TourToolbar({
  search,
  stato,
  resultCount,
  onSearchChange,
  onStatoChange,
}: TourToolbarProps) {
  return (
    <div className="mb-4 space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-md flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <input
            type="search"
            placeholder="Cerca per nome tour, destinazione o tour leader..."
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            className="h-9 w-full rounded-md border border-zinc-200 bg-white pl-9 pr-3 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none transition-colors duration-200 focus:border-zinc-400 focus:ring-2 focus:ring-zinc-100"
          />
        </div>

        <span className="text-sm text-zinc-500">
          {resultCount} {resultCount === 1 ? "risultato" : "risultati"}
        </span>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {TOUR_STATO_FILTER_OPTIONS.map((option) => {
          const isActive = stato === option.value;

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onStatoChange(option.value)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-all duration-200 ${
                isActive
                  ? "bg-zinc-900 text-white shadow-sm"
                  : "bg-white text-zinc-600 ring-1 ring-zinc-200 hover:bg-zinc-50"
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
