"use client";

import { Search } from "lucide-react";
import { AUTOMAZIONE_STATO_FILTRI } from "@/lib/automazione/constants";
import type { AutomazioneStato } from "@/types/automazione";

type AutomazioneToolbarProps = {
  search: string;
  stato: AutomazioneStato | "tutti";
  resultCount: number;
  onSearchChange: (value: string) => void;
  onStatoChange: (stato: AutomazioneStato | "tutti") => void;
};

export function AutomazioneToolbar({
  search,
  stato,
  resultCount,
  onSearchChange,
  onStatoChange,
}: AutomazioneToolbarProps) {
  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative max-w-md flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <input
            type="search"
            placeholder="Cerca per nome, trigger o azione..."
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            className="h-9 w-full rounded-md border border-zinc-200 bg-white pl-9 pr-3 text-sm outline-none focus:border-zinc-400 focus:ring-2 focus:ring-zinc-100"
          />
        </div>
        <span className="text-sm text-zinc-500">
          {resultCount} {resultCount === 1 ? "workflow" : "workflow"}
        </span>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {AUTOMAZIONE_STATO_FILTRI.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onStatoChange(option.value)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              stato === option.value
                ? "bg-zinc-900 text-white"
                : "bg-white text-zinc-600 ring-1 ring-zinc-200 hover:bg-zinc-50"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
