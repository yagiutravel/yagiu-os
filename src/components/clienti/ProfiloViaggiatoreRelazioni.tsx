"use client";

import { useCallback, useEffect, useState, startTransition } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/Toast";
import { profiloSectionLabel } from "@/lib/clienti/profilo-ui";
import { getRelazioniByClienteId } from "@/services/relazioni-viaggiatore.service";
import type { RelazionePersona, RelazioniViaggiatore } from "@/types/relazioni-viaggiatore";
import { PersonaRelazioneItem } from "./PersonaRelazioneItem";
import { getErrorMessage } from "@/shared/utils/error";

type ProfiloViaggiatoreRelazioniProps = {
  clienteId: string;
};

type RelazioneRuoloProps = {
  label: string;
  persona: RelazionePersona;
};

function RelazioneRuolo({ label, persona }: RelazioneRuoloProps) {
  return (
    <div className="flex h-full flex-col">
      <p className={`mb-2.5 ${profiloSectionLabel}`}>{label}</p>
      <PersonaRelazioneItem persona={persona} />
    </div>
  );
}

export function ProfiloViaggiatoreRelazioni({
  clienteId,
}: ProfiloViaggiatoreRelazioniProps) {
  const { showToast } = useToast();
  const [relazioni, setRelazioni] = useState<RelazioniViaggiatore | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getRelazioniByClienteId(clienteId);
      setRelazioni(data);
    } catch (error) {
      showToast(
        `Impossibile caricare le relazioni. ${getErrorMessage(error)}`,
        "error",
      );
      setRelazioni(null);
    } finally {
      setLoading(false);
    }
  }, [clienteId, showToast]);

  useEffect(() => {
    startTransition(() => {
      void loadData();
    });
  }, [loadData]);

  return (
    <Card>
      <CardHeader
        title="Relazioni"
        description="Persone collegate al viaggiatore durante i tour Yagiu."
      />
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="flex items-center gap-3 text-sm text-zinc-500">
              <Spinner className="h-5 w-5" />
              Caricamento relazioni...
            </div>
          </div>
        ) : relazioni ? (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <RelazioneRuolo label="Tour Leader" persona={relazioni.tourLeader} />
              <RelazioneRuolo label="Guida Locale" persona={relazioni.guidaLocale} />
              <RelazioneRuolo label="Driver" persona={relazioni.driver} />
              <RelazioneRuolo
                label="Compagno di camera"
                persona={relazioni.compagnoCamera}
              />
            </div>

            <div className="mt-6 border-t border-zinc-100 pt-6">
              <p className={`mb-4 ${profiloSectionLabel}`}>Ha viaggiato con</p>
              {relazioni.haViaggiatoCon.length > 0 ? (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {relazioni.haViaggiatoCon.map((persona) => (
                    <PersonaRelazioneItem key={persona.id} persona={persona} />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-zinc-500">Nessuna relazione registrata.</p>
              )}
            </div>
          </>
        ) : null}
      </CardContent>
    </Card>
  );
}
