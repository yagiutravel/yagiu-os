"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { Spinner } from "@/components/ui/Spinner";
import { TabBar } from "@/components/ui/TabBar";
import { profiloContentWrap } from "@/lib/clienti/profilo-ui";
import {
  TOUR_SCHEDA_SEZIONE_DEFAULT,
  TOUR_SCHEDA_SEZIONI,
} from "@/lib/tour/scheda-sections";
import { getTourDettaglio } from "@/services/tour.service";
import { getErrorMessage } from "@/shared/utils/error";
import { useToast } from "@/components/ui/Toast";
import type { TourDettaglio, TourSchedaSezioneId } from "@/types/tour-scheda";
import { TourSchedaHeader } from "./TourSchedaHeader";
import { TourSchedaSectionPlaceholder } from "./TourSchedaSectionPlaceholder";
import { TourSchedaTimeline } from "./TourSchedaTimeline";
import { TourSchedaPartecipanti } from "./TourSchedaPartecipanti";
import { TourSchedaCamere } from "./TourSchedaCamere";
import { TourSchedaPagamenti } from "./TourSchedaPagamenti";
import { TourSchedaChecklist } from "./TourSchedaChecklist";
import { TourSchedaDocumenti } from "./TourSchedaDocumenti";

export function TourSchedaView() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const { showToast } = useToast();
  const [sezioneAttiva, setSezioneAttiva] = useState<TourSchedaSezioneId>(
    TOUR_SCHEDA_SEZIONE_DEFAULT,
  );
  const [tour, setTour] = useState<TourDettaglio | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const loadTour = useCallback(async () => {
    if (!params.id) return;
    setLoading(true);
    try {
      const data = await getTourDettaglio(params.id);
      setTour(data);
    } catch (error) {
      showToast(`Impossibile caricare il tour. ${getErrorMessage(error)}`, "error");
      setTour(null);
    } finally {
      setLoading(false);
    }
  }, [params.id, showToast]);

  useEffect(() => {
    void loadTour();
  }, [loadTour, refreshKey]);

  const sezioneCorrente =
    TOUR_SCHEDA_SEZIONI.find((sezione) => sezione.id === sezioneAttiva) ??
    TOUR_SCHEDA_SEZIONI[0];

  const handleIndietro = () => {
    router.push("/tour");
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="relative z-10 shrink-0 border-b border-zinc-200/60 bg-white/90 px-4 py-4 backdrop-blur-sm sm:px-6 lg:px-8">
        <div className={profiloContentWrap}>
          {loading ? (
            <div className="h-24 animate-pulse rounded-xl bg-zinc-100" />
          ) : tour ? (
            <TourSchedaHeader
              tour={tour}
              onChanged={() => setRefreshKey((value) => value + 1)}
            />
          ) : (
            <div className="h-16" />
          )}

          {tour && (
            <div className="mt-4">
              <TabBar
                items={TOUR_SCHEDA_SEZIONI}
                activeId={sezioneAttiva}
                onChange={setSezioneAttiva}
                ariaLabel="Sezioni scheda tour"
              />
            </div>
          )}
        </div>
      </header>

      <div className="relative z-0 min-h-0 flex-1 overflow-y-auto bg-[#f7f7f8] px-4 py-4 sm:px-6 lg:px-8">
        <div className={profiloContentWrap}>
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Spinner className="h-5 w-5" />
            </div>
          ) : !tour ? (
            <EmptyState
              icon={ArrowLeft}
              title="Tour non trovato"
              description="Il tour richiesto non esiste o non è più disponibile."
              actionLabel="Torna ai tour"
              onAction={handleIndietro}
            />
          ) : sezioneAttiva === "timeline" ? (
            <TourSchedaTimeline tourId={tour.id} />
          ) : sezioneAttiva === "partecipanti" ? (
            <TourSchedaPartecipanti tourId={tour.id} />
          ) : sezioneAttiva === "camere" ? (
            <TourSchedaCamere tourId={tour.id} />
          ) : sezioneAttiva === "pagamenti" ? (
            <TourSchedaPagamenti tourId={tour.id} />
          ) : sezioneAttiva === "documenti" ? (
            <TourSchedaDocumenti tourId={tour.id} />
          ) : sezioneAttiva === "checklist" ? (
            <TourSchedaChecklist tourId={tour.id} />
          ) : (
            <TourSchedaSectionPlaceholder sezione={sezioneCorrente} />
          )}
        </div>
      </div>
    </div>
  );
}
