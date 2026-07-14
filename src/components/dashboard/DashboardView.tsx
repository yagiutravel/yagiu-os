"use client";

import { useCallback, useEffect, useState } from "react";
import { AlertCircle } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { Spinner } from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/Toast";
import { profiloContentWrap } from "@/lib/clienti/profilo-ui";
import { getDashboardData } from "@/services/dashboard.service";
import type { DashboardData } from "@/types/dashboard";
import { DashboardHeader } from "./DashboardHeader";
import { DashboardGlobalSearch } from "./DashboardGlobalSearch";
import { DashboardQuickActions } from "./DashboardQuickActions";
import { TourInPartenzaWidget } from "./widgets/TourInPartenzaWidget";
import { PagamentiWidget } from "./widgets/PagamentiWidget";
import { DocumentiWidget } from "./widgets/DocumentiWidget";
import { CamereWidget } from "./widgets/CamereWidget";
import { ViaggiatoriWidget } from "./widgets/ViaggiatoriWidget";
import { AttivitaRecentiWidget } from "./widgets/AttivitaRecentiWidget";
import { KpiWidget } from "./widgets/KpiWidget";
import { CalendarioWidget } from "./widgets/CalendarioWidget";
import { AvvisiWidget } from "./widgets/AvvisiWidget";
import { getErrorMessage } from "@/shared/utils/error";


export function DashboardView() {
  const { showToast } = useToast();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const dashboardData = await getDashboardData();
      setData(dashboardData);
    } catch (loadError) {
      const message = getErrorMessage(loadError);
      setError(message);
      showToast(`Impossibile caricare la dashboard. ${message}`, "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    void loadDashboard();
  }, [mounted, loadDashboard]);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className={`${profiloContentWrap} space-y-6`}>
          {!mounted || loading ? (
            <div className="flex items-center justify-center py-32">
              <div className="flex items-center gap-3 text-sm text-zinc-500">
                <Spinner className="h-5 w-5" />
                Caricamento dashboard...
              </div>
            </div>
          ) : !data ? (
            <EmptyState
              icon={AlertCircle}
              title="Dashboard non disponibile"
              description={
                error ??
                "Si è verificato un errore durante il caricamento. Riprova tra qualche istante."
              }
              actionLabel="Riprova"
              onAction={() => void loadDashboard()}
            />
          ) : (
            <div className="animate-in fade-in space-y-6 duration-300">
              <DashboardHeader greeting={data.greeting} />
              <DashboardGlobalSearch />
              <KpiWidget kpi={data.kpi} />

              <div className="grid gap-6 lg:grid-cols-3">
                <div className="space-y-6 lg:col-span-2">
                  <TourInPartenzaWidget tours={data.tourInPartenza} />
                  <div className="grid gap-6 md:grid-cols-2">
                    <PagamentiWidget pagamenti={data.pagamenti} />
                    <DocumentiWidget documenti={data.documenti} />
                    <CamereWidget camere={data.camere} />
                    <ViaggiatoriWidget viaggiatori={data.viaggiatori} />
                  </div>
                  <AttivitaRecentiWidget attivita={data.attivitaRecenti} />
                </div>

                <div className="space-y-6">
                  <AvvisiWidget avvisi={data.avvisi} />
                  <CalendarioWidget calendario={data.calendario} />
                  <DashboardQuickActions />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
