"use client";

import { useCallback, useEffect, useState, startTransition } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { InfoGrid } from "@/components/ui/InfoGrid";
import { Spinner } from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/Toast";
import { profiloSectionLabel } from "@/lib/clienti/profilo-ui";
import { getPreferenzeByClienteId } from "@/services/preferenze-viaggiatore.service";
import type { PreferenzeViaggiatore } from "@/types/preferenze-viaggiatore";
import { TipologiaViaggioBadge } from "./TipologiaViaggioBadge";
import { getErrorMessage } from "@/shared/utils/error";

type ProfiloViaggiatorePreferenzeProps = {
  clienteId: string;
};

export function ProfiloViaggiatorePreferenze({
  clienteId,
}: ProfiloViaggiatorePreferenzeProps) {
  const { showToast } = useToast();
  const [preferenze, setPreferenze] = useState<PreferenzeViaggiatore | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getPreferenzeByClienteId(clienteId);
      setPreferenze(data);
    } catch (error) {
      showToast(
        `Impossibile caricare le preferenze. ${getErrorMessage(error)}`,
        "error",
      );
      setPreferenze(null);
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
        title="Preferenze"
        description="Tipologie di viaggio preferite ed esigenze personali."
      />
      <CardContent className="space-y-6">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="flex items-center gap-3 text-sm text-zinc-500">
              <Spinner className="h-5 w-5" />
              Caricamento preferenze...
            </div>
          </div>
        ) : preferenze ? (
          <>
            <div>
              <p className={profiloSectionLabel}>Tipologia viaggio preferita</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {preferenze.tipologieViaggio.length > 0 ? (
                  preferenze.tipologieViaggio.map((tipologia) => (
                    <TipologiaViaggioBadge key={tipologia} tipologia={tipologia} />
                  ))
                ) : (
                  <p className="text-sm text-zinc-500">—</p>
                )}
              </div>
            </div>

            <InfoGrid
              columns={2}
              fields={[
                { label: "Lingue", value: preferenze.lingue },
                { label: "Allergie", value: preferenze.allergie },
                { label: "Dieta", value: preferenze.dieta },
                { label: "Livello trekking", value: preferenze.livelloTrekking },
              ]}
            />
          </>
        ) : null}
      </CardContent>
    </Card>
  );
}
