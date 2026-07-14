"use client";

import { useRouter } from "next/navigation";
import { CreditCard } from "lucide-react";
import { formatImportoEuro } from "@/models/dashboard";
import type { DashboardPagamenti } from "@/types/dashboard";
import { DashboardWidget } from "../DashboardWidget";

type PagamentiWidgetProps = {
  pagamenti: DashboardPagamenti;
};

export function PagamentiWidget({ pagamenti }: PagamentiWidgetProps) {
  const router = useRouter();

  return (
    <DashboardWidget
      title="Pagamenti"
      description="Situazione incassi da completare."
      href="/pagamenti"
    >
      <button
        type="button"
        onClick={() => router.push("/pagamenti")}
        className="w-full space-y-3 text-left transition-opacity duration-200 hover:opacity-90"
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl bg-zinc-50/60 px-4 py-3.5 ring-1 ring-inset ring-zinc-200/50">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
              Acconti mancanti
            </p>
            <p className="mt-1.5 text-2xl font-semibold text-zinc-900">
              {pagamenti.accontiMancanti}
            </p>
          </div>
          <div className="rounded-xl bg-zinc-50/60 px-4 py-3.5 ring-1 ring-inset ring-zinc-200/50">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
              Saldi mancanti
            </p>
            <p className="mt-1.5 text-2xl font-semibold text-zinc-900">
              {pagamenti.saldiMancanti}
            </p>
          </div>
        </div>
        <div className="flex items-center justify-between rounded-xl border border-amber-200/60 bg-amber-50/50 px-4 py-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-amber-700/70">
              Da incassare
            </p>
            <p className="mt-1 text-lg font-semibold text-amber-900">
              {formatImportoEuro(pagamenti.importoTotaleDaIncassare)}
            </p>
          </div>
          <CreditCard className="h-5 w-5 text-amber-600/70" strokeWidth={1.75} />
        </div>
      </button>
    </DashboardWidget>
  );
}
