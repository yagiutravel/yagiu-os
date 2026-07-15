"use client";

import { useCallback, useEffect, useState, startTransition } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Spinner } from "@/components/ui/Spinner";
import { Timeline } from "@/components/ui/Timeline";
import { useToast } from "@/components/ui/Toast";
import { mapTourTimelineRowToEvento } from "@/mappers/tour-timeline.mapper";
import { getTourTimelineEvents } from "@/services/tour-timeline.service";
import type { TourTimelineEventRow } from "@/types/database";
import type { TimelineEvento } from "@/types/timeline-viaggiatore";
import { getErrorMessage } from "@/shared/utils/error";
import { Clock3 } from "lucide-react";

type TourSchedaTimelineProps = {
  tourId: string;
};

export function TourSchedaTimeline({ tourId }: TourSchedaTimelineProps) {
  const { showToast } = useToast();
  const [eventi, setEventi] = useState<TimelineEvento[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const rows = (await getTourTimelineEvents(tourId)) as TourTimelineEventRow[];
      setEventi(rows.map(mapTourTimelineRowToEvento));
    } catch (error) {
      showToast(`Impossibile caricare la timeline. ${getErrorMessage(error)}`, "error");
      setEventi([]);
    } finally {
      setLoading(false);
    }
  }, [showToast, tourId]);

  useEffect(() => {
    startTransition(() => {
      void loadData();
    });
  }, [loadData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner className="h-5 w-5" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader
        title="Timeline del Tour"
        description="Cronologia eventi registrati automaticamente dalle operazioni sul tour."
      />
      <CardContent>
        {eventi.length === 0 ? (
          <EmptyState
            icon={Clock3}
            title="Nessun evento"
            description="Gli eventi verranno registrati quando crei tour, partecipanti, pagamenti o documenti."
          />
        ) : (
          <Timeline eventi={eventi} />
        )}
      </CardContent>
    </Card>
  );
}
