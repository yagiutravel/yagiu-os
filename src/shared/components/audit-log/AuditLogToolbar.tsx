"use client";

import { Search } from "lucide-react";
import { AUDIT_LOG_TIPO_FILTRI } from "@/lib/audit-log/constants";
import type { AuditLogEntitaTipo } from "@/types/audit-log";

type AuditLogToolbarProps = {
  search: string;
  tipo: AuditLogEntitaTipo | "tutti";
  resultCount: number;
  onSearchChange: (value: string) => void;
  onTipoChange: (tipo: AuditLogEntitaTipo | "tutti") => void;
};

export function AuditLogToolbar({
  search,
  tipo,
  resultCount,
  onSearchChange,
  onTipoChange,
}: AuditLogToolbarProps) {
  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative max-w-md flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <input
            type="search"
            placeholder="Cerca per azione, utente o entità..."
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            className="h-9 w-full rounded-md border border-zinc-200 bg-white pl-9 pr-3 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none transition-colors focus:border-zinc-400 focus:ring-2 focus:ring-zinc-100"
          />
        </div>
        <span className="text-sm text-zinc-500">
          {resultCount} {resultCount === 1 ? "registrazione" : "registrazioni"}
        </span>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {AUDIT_LOG_TIPO_FILTRI.map((option) => {
          const isActive = tipo === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onTipoChange(option.value)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                isActive
                  ? "bg-zinc-900 text-white"
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
