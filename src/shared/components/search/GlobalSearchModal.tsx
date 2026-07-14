"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Spinner } from "@/components/ui/Spinner";
import { GLOBAL_SEARCH_CATEGORIA_CONFIG } from "@/lib/global-search/categoria.config";
import { searchGlobal } from "@/services/global-search.service";
import type { GlobalSearchResponse } from "@/types/global-search";
import { useKeyboardShortcutLabel } from "@/shared/hooks/useKeyboardShortcutLabel";
import { useGlobalSearch } from "./GlobalSearchProvider";

export function GlobalSearchModal() {
  const router = useRouter();
  const { open, closeSearch } = useGlobalSearch();
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState<GlobalSearchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  const shortcutLabel = useKeyboardShortcutLabel();

  useEffect(() => {
    if (!open) {
      setQuery("");
      setResponse(null);
      return;
    }

    const timeout = setTimeout(() => inputRef.current?.focus(), 50);
    return () => clearTimeout(timeout);
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeSearch();
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [open, closeSearch]);

  useEffect(() => {
    const normalized = query.trim();
    if (!normalized) {
      setResponse(null);
      return;
    }

    const timeout = setTimeout(() => {
      setLoading(true);
      void searchGlobal(normalized)
        .then(setResponse)
        .finally(() => setLoading(false));
    }, 200);

    return () => clearTimeout(timeout);
  }, [query]);

  const handleNavigate = (href: string) => {
    closeSearch();
    router.push(href);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center px-4 pt-[10vh] sm:px-6">
      <button
        type="button"
        className="absolute inset-0 bg-zinc-900/40 backdrop-blur-sm"
        onClick={closeSearch}
        aria-label="Chiudi ricerca"
      />

      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label="Ricerca globale"
        className="relative z-10 w-full max-w-2xl overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-2xl animate-in fade-in zoom-in-95 duration-200"
      >
        <div className="flex items-center gap-3 border-b border-zinc-100 px-4 py-3 sm:px-5">
          <Search className="h-4 w-4 shrink-0 text-zinc-400" strokeWidth={1.75} />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Cerca clienti, tour, pagamenti, documenti..."
            className="min-w-0 flex-1 bg-transparent text-sm text-zinc-900 placeholder:text-zinc-400 outline-none"
          />
          <kbd className="hidden rounded-md bg-zinc-100 px-2 py-0.5 text-[11px] font-medium text-zinc-500 sm:inline">
            {shortcutLabel}
          </kbd>
        </div>

        <div className="max-h-[min(60vh,28rem)] overflow-y-auto">
          {!query.trim() ? (
            <div className="px-5 py-8 text-center text-sm text-zinc-500">
              <p>Cerca in tutto il gestionale.</p>
              <p className="mt-1 text-xs text-zinc-400">
                Clienti · Tour · Pagamenti · Camere · Documenti · Questionari ·
                Timeline · Dashboard
              </p>
            </div>
          ) : loading ? (
            <div className="flex items-center justify-center py-12">
              <Spinner className="h-5 w-5" />
            </div>
          ) : !response || response.totale === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-zinc-500">
              Nessun risultato per &ldquo;{query}&rdquo;
            </p>
          ) : (
            <div className="space-y-1 p-2">
              {response.gruppi.map((gruppo) => {
                const config = GLOBAL_SEARCH_CATEGORIA_CONFIG[gruppo.categoria];
                const Icon = config.icon;

                return (
                  <section key={gruppo.categoria}>
                    <p className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                      {gruppo.label}
                    </p>
                    <ul>
                      {gruppo.risultati.map((risultato) => (
                        <li key={risultato.id}>
                          <button
                            type="button"
                            onMouseDown={(event) => event.preventDefault()}
                            onClick={() => handleNavigate(risultato.href)}
                            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-zinc-50"
                          >
                            <div
                              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${config.bg}`}
                            >
                              <Icon
                                className={`h-4 w-4 ${config.text}`}
                                strokeWidth={1.75}
                              />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-medium text-zinc-900">
                                {risultato.titolo}
                              </p>
                              <p className="truncate text-xs text-zinc-500">
                                {risultato.sottotitolo}
                              </p>
                            </div>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </section>
                );
              })}
            </div>
          )}
        </div>

        {response && response.totale > 0 && (
          <div className="border-t border-zinc-100 px-4 py-2 text-center text-xs text-zinc-400 sm:px-5">
            {response.totale}{" "}
            {response.totale === 1 ? "risultato" : "risultati"} in{" "}
            {response.gruppi.length}{" "}
            {response.gruppi.length === 1 ? "categoria" : "categorie"}
          </div>
        )}
      </div>
    </div>
  );
}
