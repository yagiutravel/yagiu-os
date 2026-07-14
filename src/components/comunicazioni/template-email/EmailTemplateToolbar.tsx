"use client";

import { Search } from "lucide-react";
import { EMAIL_TEMPLATE_CATEGORIE } from "@/lib/email-template/constants";
import type { EmailTemplateCategoria } from "@/types/email-template";

type EmailTemplateToolbarProps = {
  search: string;
  categoria: EmailTemplateCategoria | "tutte";
  resultCount: number;
  onSearchChange: (value: string) => void;
  onCategoriaChange: (categoria: EmailTemplateCategoria | "tutte") => void;
};

export function EmailTemplateToolbar({
  search,
  categoria,
  resultCount,
  onSearchChange,
  onCategoriaChange,
}: EmailTemplateToolbarProps) {
  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative max-w-md flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <input
            type="search"
            placeholder="Cerca per titolo, oggetto o contenuto..."
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            className="h-9 w-full rounded-md border border-zinc-200 bg-white pl-9 pr-3 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none transition-colors focus:border-zinc-400 focus:ring-2 focus:ring-zinc-100"
          />
        </div>
        <span className="text-sm text-zinc-500">
          {resultCount} {resultCount === 1 ? "template" : "template"}
        </span>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {EMAIL_TEMPLATE_CATEGORIE.map((option) => {
          const isActive = categoria === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onCategoriaChange(option.value)}
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
