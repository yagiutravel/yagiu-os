"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { StatoBadge } from "@/components/ui/StatoBadge";
import type { Cliente } from "@/types/cliente";

type ClienteSearchSelectProps = {
  clienti: Cliente[];
  selectedId: string;
  disabled?: boolean;
  excludeIds?: string[];
  onSelect: (clienteId: string) => void;
};

export function ClienteSearchSelect({
  clienti,
  selectedId,
  disabled = false,
  excludeIds = [],
  onSelect,
}: ClienteSearchSelectProps) {
  const [query, setQuery] = useState("");

  const selectedCliente = clienti.find((cliente) => cliente.id === selectedId);

  const filteredClienti = useMemo(() => {
    const normalized = query.toLowerCase().trim();

    return clienti.filter((cliente) => {
      if (excludeIds.includes(cliente.id) && cliente.id !== selectedId) {
        return false;
      }

      if (!normalized) return true;

      return (
        cliente.nome.toLowerCase().includes(normalized) ||
        cliente.email.toLowerCase().includes(normalized)
      );
    });
  }, [clienti, excludeIds, query, selectedId]);

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Cerca cliente per nome o email..."
          disabled={disabled}
          className="h-9 w-full rounded-md border border-zinc-200 bg-white pl-9 pr-3 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none transition-colors duration-200 focus:border-zinc-400 focus:ring-2 focus:ring-zinc-100 disabled:bg-zinc-50"
        />
      </div>

      {selectedCliente && (
        <div className="flex items-center gap-3 rounded-xl border border-zinc-200/70 bg-zinc-50/60 p-3 ring-1 ring-inset ring-zinc-200/50">
          <Avatar name={selectedCliente.nome} size="md" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-zinc-900">
              {selectedCliente.nome}
            </p>
            <p className="truncate text-xs text-zinc-500">{selectedCliente.email}</p>
          </div>
          <StatoBadge stato={selectedCliente.stato} />
        </div>
      )}

      {!disabled && (
        <div className="max-h-52 space-y-1 overflow-y-auto rounded-xl border border-zinc-200/70 bg-white p-1">
          {filteredClienti.length === 0 ? (
            <p className="px-3 py-6 text-center text-sm text-zinc-500">
              Nessun cliente trovato.
            </p>
          ) : (
            filteredClienti.map((cliente) => {
              const isSelected = cliente.id === selectedId;

              return (
                <button
                  key={cliente.id}
                  type="button"
                  onClick={() => onSelect(cliente.id)}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors duration-200 ${
                    isSelected
                      ? "bg-zinc-100"
                      : "hover:bg-zinc-50"
                  }`}
                >
                  <Avatar name={cliente.nome} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-zinc-900">
                      {cliente.nome}
                    </p>
                    <p className="truncate text-xs text-zinc-500">{cliente.email}</p>
                  </div>
                  <StatoBadge stato={cliente.stato} />
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
