"use client";

import { startTransition, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, User, Compass, Users } from "lucide-react";
import { searchDashboard } from "@/services/dashboard.service";
import type { DashboardSearchResult } from "@/types/dashboard";

const TIPO_ICONS = {
  cliente: User,
  tour: Compass,
  partecipante: Users,
} as const;

const TIPO_LABELS = {
  cliente: "Cliente",
  tour: "Tour",
  partecipante: "Partecipante",
} as const;

export function DashboardGlobalSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<DashboardSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);

  const showResults = focused && query.trim().length > 0;

  useEffect(() => {
    const normalized = query.trim();
    if (!normalized) {
      startTransition(() => {
        setResults([]);
      });
      return;
    }

    const timeout = setTimeout(() => {
      setLoading(true);
      void searchDashboard(normalized)
        .then(setResults)
        .finally(() => setLoading(false));
    }, 200);

    return () => clearTimeout(timeout);
  }, [query]);

  const emptyMessage = useMemo(() => {
    if (loading) return "Ricerca in corso...";
    return "Nessun risultato trovato.";
  }, [loading]);

  return (
    <div className="relative">
      <div className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => {
            setTimeout(() => setFocused(false), 150);
          }}
          placeholder="Cerca clienti, tour, partecipanti..."
          className="h-11 w-full rounded-xl border border-zinc-200/80 bg-white pl-11 pr-4 text-sm text-zinc-900 shadow-[0_1px_2px_rgba(0,0,0,0.04)] placeholder:text-zinc-400 outline-none transition-all duration-200 focus:border-zinc-300 focus:shadow-[0_2px_8px_rgba(0,0,0,0.06)] focus:ring-2 focus:ring-zinc-100"
        />
      </div>

      {showResults && (
        <div className="absolute z-20 mt-2 w-full overflow-hidden rounded-xl border border-zinc-200/80 bg-white shadow-[0_8px_24px_rgba(0,0,0,0.08)] animate-in fade-in duration-200">
          {results.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-zinc-500">
              {emptyMessage}
            </p>
          ) : (
            <ul className="max-h-72 overflow-y-auto p-1">
              {results.map((result) => {
                const Icon = TIPO_ICONS[result.tipo];
                return (
                  <li key={`${result.tipo}-${result.id}`}>
                    <button
                      type="button"
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => router.push(result.href)}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors duration-200 hover:bg-zinc-50"
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-100">
                        <Icon className="h-4 w-4 text-zinc-500" strokeWidth={1.75} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-zinc-900">
                          {result.titolo}
                        </p>
                        <p className="truncate text-xs text-zinc-500">
                          {TIPO_LABELS[result.tipo]} · {result.sottotitolo}
                        </p>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
