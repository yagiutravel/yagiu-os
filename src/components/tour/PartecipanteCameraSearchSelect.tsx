"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import type { PartecipazioneTourView } from "@/types/tour-partecipazione";
import { PartecipazioneBadge } from "./PartecipazioneBadge";

type PartecipanteCameraSearchSelectProps = {
  partecipanti: PartecipazioneTourView[];
  selectedId: string;
  disabled?: boolean;
  onSelect: (partecipazioneId: string) => void;
};

export function PartecipanteCameraSearchSelect({
  partecipanti,
  selectedId,
  disabled = false,
  onSelect,
}: PartecipanteCameraSearchSelectProps) {
  const [query, setQuery] = useState("");

  const selectedPartecipante = partecipanti.find(
    (item) => item.id === selectedId,
  );

  const filteredPartecipanti = useMemo(() => {
    const normalized = query.toLowerCase().trim();

    return partecipanti.filter((item) => {
      if (!normalized) return true;

      return (
        item.clienteNome.toLowerCase().includes(normalized) ||
        item.clienteEmail.toLowerCase().includes(normalized)
      );
    });
  }, [partecipanti, query]);

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Cerca partecipante per nome o email..."
          disabled={disabled}
          className="h-9 w-full rounded-md border border-zinc-200 bg-white pl-9 pr-3 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none transition-colors duration-200 focus:border-zinc-400 focus:ring-2 focus:ring-zinc-100 disabled:bg-zinc-50"
        />
      </div>

      {selectedPartecipante && (
        <div className="flex items-center gap-3 rounded-xl border border-zinc-200/70 bg-zinc-50/60 p-3 ring-1 ring-inset ring-zinc-200/50">
          <Avatar name={selectedPartecipante.clienteNome} size="md" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-zinc-900">
              {selectedPartecipante.clienteNome}
            </p>
            <p className="truncate text-xs text-zinc-500">
              {selectedPartecipante.clienteEmail}
            </p>
          </div>
          <PartecipazioneBadge kind="ruolo" value={selectedPartecipante.ruolo} />
        </div>
      )}

      {!disabled && (
        <div className="max-h-52 space-y-1 overflow-y-auto rounded-xl border border-zinc-200/70 bg-white p-1">
          {filteredPartecipanti.length === 0 ? (
            <p className="px-3 py-6 text-center text-sm text-zinc-500">
              Nessun partecipante disponibile.
            </p>
          ) : (
            filteredPartecipanti.map((partecipante) => {
              const isSelected = partecipante.id === selectedId;

              return (
                <button
                  key={partecipante.id}
                  type="button"
                  onClick={() => onSelect(partecipante.id)}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors duration-200 ${
                    isSelected ? "bg-zinc-100" : "hover:bg-zinc-50"
                  }`}
                >
                  <Avatar name={partecipante.clienteNome} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-zinc-900">
                      {partecipante.clienteNome}
                    </p>
                    <p className="truncate text-xs text-zinc-500">
                      {partecipante.clienteEmail}
                    </p>
                  </div>
                  <PartecipazioneBadge kind="ruolo" value={partecipante.ruolo} />
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
