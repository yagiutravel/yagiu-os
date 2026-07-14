"use client";

import { useRouter } from "next/navigation";
import { Cake, UserPlus, Users } from "lucide-react";
import type { DashboardViaggiatori } from "@/types/dashboard";
import { DashboardWidget } from "../DashboardWidget";

type ViaggiatoriWidgetProps = {
  viaggiatori: DashboardViaggiatori;
};

export function ViaggiatoriWidget({ viaggiatori }: ViaggiatoriWidgetProps) {
  const router = useRouter();

  return (
    <DashboardWidget
      title="Viaggiatori"
      description="Clienti e iscrizioni recenti."
      href="/clienti"
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => router.push("/clienti")}
            className="rounded-xl bg-zinc-50/60 px-4 py-3.5 text-left ring-1 ring-inset ring-zinc-200/50 transition-all duration-200 hover:bg-white"
          >
            <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
              Nuovi clienti
            </p>
            <p className="mt-1.5 text-2xl font-semibold text-zinc-900">
              {viaggiatori.nuoviClienti}
            </p>
          </button>
          <button
            type="button"
            onClick={() => router.push("/clienti")}
            className="rounded-xl bg-zinc-50/60 px-4 py-3.5 text-left ring-1 ring-inset ring-zinc-200/50 transition-all duration-200 hover:bg-white"
          >
            <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
              Inattivi
            </p>
            <p className="mt-1.5 text-2xl font-semibold text-zinc-900">
              {viaggiatori.clientiInattivi}
            </p>
          </button>
        </div>

        <div>
          <p className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
            <UserPlus className="h-3 w-3" />
            Ultimi iscritti
          </p>
          <div className="space-y-2">
            {viaggiatori.ultimiIscritti.map((item) => (
              <button
                key={item.partecipazioneId}
                type="button"
                onClick={() => router.push(`/clienti/${item.clienteId}`)}
                className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left transition-colors duration-200 hover:bg-zinc-50"
              >
                <span className="truncate text-sm font-medium text-zinc-900">
                  {item.nome}
                </span>
                <span className="ml-2 shrink-0 truncate text-xs text-zinc-500">
                  {item.tourNome}
                </span>
              </button>
            ))}
          </div>
        </div>

        {viaggiatori.compleanniDelMese.length > 0 && (
          <div>
            <p className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
              <Cake className="h-3 w-3" />
              Compleanni del mese
            </p>
            <div className="flex flex-wrap gap-2">
              {viaggiatori.compleanniDelMese.map((item) => (
                <button
                  key={item.clienteId}
                  type="button"
                  onClick={() => router.push("/clienti")}
                  className="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-700 transition-colors duration-200 hover:bg-zinc-200/80"
                >
                  <Users className="h-3 w-3" />
                  {item.nome} · {item.giorno}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardWidget>
  );
}
