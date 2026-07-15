"use client";

import { useCallback, useEffect, useState, startTransition } from "react";
import { Spinner } from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/Toast";
import { profiloContentWrap } from "@/lib/clienti/profilo-ui";
import { getComunicazioniDashboardData } from "@/services/comunicazione.service";
import type { ComunicazioniDashboardData } from "@/types/comunicazione";
import { ComunicazioniEmailWidget } from "./ComunicazioniEmailWidget";
import { ComunicazioniReminderWidget } from "./ComunicazioniReminderWidget";
import { ComunicazioniWhatsAppWidget } from "./ComunicazioniWhatsAppWidget";
import { ComunicazioniStatoWidget } from "./ComunicazioniStatoWidget";
import { ComunicazioniTimelineSection } from "./ComunicazioniTimelineSection";
import { getErrorMessage } from "@/shared/utils/error";


export function ComunicazioniView() {
  const { showToast } = useToast();
  const [data, setData] = useState<ComunicazioniDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const dashboardData = await getComunicazioniDashboardData();
      setData(dashboardData);
    } catch (error) {
      showToast(
        `Impossibile caricare le comunicazioni. ${getErrorMessage(error)}`,
        "error",
      );
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    startTransition(() => {
      void loadData();
    });
  }, [loadData]);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className={`${profiloContentWrap} space-y-6`}>
          {loading || !data ? (
            <div className="flex items-center justify-center py-32">
              <div className="flex items-center gap-3 text-sm text-zinc-500">
                <Spinner className="h-5 w-5" />
                Caricamento comunicazioni...
              </div>
            </div>
          ) : (
            <div className="animate-in fade-in space-y-6 duration-300">
              <div className="grid gap-6 lg:grid-cols-2">
                <ComunicazioniEmailWidget items={data.emailDaInviare} />
                <ComunicazioniReminderWidget items={data.reminderAutomatici} />
                <ComunicazioniWhatsAppWidget items={data.messaggiWhatsApp} />
                <ComunicazioniStatoWidget stato={data.statoComunicazioni} />
              </div>

              <ComunicazioniTimelineSection
                timelineClienti={data.timelineClienti}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
