"use client";

import { useCallback, useEffect, useState, startTransition } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/Toast";
import { getClienteTimeline } from "@/services/cliente-timeline.service";
import type { ClienteTimelineEvento } from "@/types/cliente-timeline";
import type { ProfiloViaggiatore } from "@/types/profilo-viaggiatore";
import { ClienteTimeline } from "./ClienteTimeline";
import { getErrorMessage } from "@/shared/utils/error";

type ProfiloViaggiatoreTimelineProps = {
  profilo: ProfiloViaggiatore;
  refreshKey?: number;
};


export function ProfiloViaggiatoreTimeline({
  profilo,
  refreshKey = 0,
}: ProfiloViaggiatoreTimelineProps) {
  const { showToast } = useToast();
  const [eventi, setEventi] = useState<ClienteTimelineEvento[]>([]);
  const [loading, setLoading] = useState(true);

  const loadTimeline = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getClienteTimeline(profilo.id);
      setEventi(data.eventi);
    } catch (error) {
      showToast(
        `Impossibile caricare la timeline. ${getErrorMessage(error)}`,
        "error",
      );
    } finally {
      setLoading(false);
    }
  }, [profilo.id, showToast]);

  useEffect(() => {
    startTransition(() => {
      void loadTimeline();
    });
  }, [loadTimeline, refreshKey]);

  return (
    <Card>
      <CardHeader
        title="Timeline"
        description="Cronologia completa delle attività e interazioni del viaggiatore."
      />
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="flex items-center gap-3 text-sm text-zinc-500">
              <Spinner className="h-5 w-5" />
              Caricamento timeline...
            </div>
          </div>
        ) : (
          <ClienteTimeline eventi={eventi} />
        )}
      </CardContent>
    </Card>
  );
}
