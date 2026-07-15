"use client";

import { useRouter } from "next/navigation";
import {
  BedDouble,
  CreditCard,
  FileText,
  Compass,
  UserPlus,
  Users,
} from "lucide-react";
import { formatOraRelativa } from "@/models/dashboard";
import type { DashboardAttivita, DashboardAttivitaTipo } from "@/types/dashboard";
import { DashboardWidget } from "../DashboardWidget";

type AttivitaRecentiWidgetProps = {
  attivita: DashboardAttivita[];
};

const ICONS: Record<DashboardAttivitaTipo, typeof Users> = {
  tour: Compass,
  documento: FileText,
  pagamento: CreditCard,
  camera: BedDouble,
  cliente: UserPlus,
  partecipante: Users,
  preventivo: FileText,
};

export function AttivitaRecentiWidget({ attivita }: AttivitaRecentiWidgetProps) {
  const router = useRouter();

  return (
    <DashboardWidget
      title="Attività recenti"
      description="Cronologia operativa del gestionale."
    >
      {attivita.length === 0 ? (
        <p className="py-8 text-center text-sm text-zinc-500">
          Nessuna attività recente.
        </p>
      ) : (
        <ol className="space-y-1">
          {attivita.map((item) => {
            const Icon = ICONS[item.tipo];
            const content = (
              <>
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-zinc-100">
                  <Icon className="h-4 w-4 text-zinc-500" strokeWidth={1.75} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-zinc-900">{item.descrizione}</p>
                  <p className="mt-0.5 text-xs text-zinc-400">
                    {formatOraRelativa(item.ora)}
                  </p>
                </div>
              </>
            );

            if (item.href) {
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => router.push(item.href!)}
                    className="flex w-full items-start gap-3 rounded-xl px-2 py-2.5 text-left transition-colors duration-200 hover:bg-zinc-50"
                  >
                    {content}
                  </button>
                </li>
              );
            }

            return (
              <li
                key={item.id}
                className="flex items-start gap-3 rounded-xl px-2 py-2.5"
              >
                {content}
              </li>
            );
          })}
        </ol>
      )}
    </DashboardWidget>
  );
}
