"use client";

import { Search } from "lucide-react";
import { useGlobalSearch } from "@/components/search/GlobalSearchProvider";
import { useKeyboardShortcutLabel } from "@/shared/hooks/useKeyboardShortcutLabel";

export function GlobalSearchTrigger() {
  const { openSearch } = useGlobalSearch();
  const shortcutLabel = useKeyboardShortcutLabel();

  return (
    <button
      type="button"
      onClick={openSearch}
      className="flex h-9 min-w-0 flex-1 items-center gap-2 rounded-lg border border-zinc-200/80 bg-zinc-50/60 px-3 text-sm text-zinc-500 transition-colors hover:border-zinc-300 hover:bg-white hover:text-zinc-700 sm:max-w-xs lg:max-w-sm"
      aria-label="Apri ricerca globale"
    >
      <Search className="h-4 w-4 shrink-0" strokeWidth={1.75} />
      <span className="truncate">Cerca...</span>
      <kbd className="ml-auto hidden rounded bg-white px-1.5 py-0.5 text-[10px] font-medium text-zinc-400 ring-1 ring-zinc-200 sm:inline">
        {shortcutLabel}
      </kbd>
    </button>
  );
}
