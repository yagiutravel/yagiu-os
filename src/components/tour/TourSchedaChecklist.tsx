"use client";

import { useCallback, useEffect, useState, startTransition } from "react";
import { CheckSquare, Plus, Users } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Spinner } from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/Toast";
import {
  getChecklistByTourId,
  setChecklistCompletion,
} from "@/services/tour-checklist.service";
import type { TourChecklistData } from "@/types/tour-checklist";
import { getErrorMessage } from "@/shared/utils/error";

type TourSchedaChecklistProps = {
  tourId: string;
};

export function TourSchedaChecklist({ tourId }: TourSchedaChecklistProps) {
  const { showToast } = useToast();
  const [data, setData] = useState<TourChecklistData | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [selectedParticipantId, setSelectedParticipantId] = useState<string | null>(
    null,
  );

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const checklist = await getChecklistByTourId(tourId);
      setData(checklist);
      setSelectedParticipantId((current) => {
        if (current && checklist.partecipanti.some((item) => item.participantId === current)) {
          return current;
        }
        return checklist.partecipanti[0]?.participantId ?? null;
      });
    } catch (error) {
      showToast(`Impossibile caricare la checklist. ${getErrorMessage(error)}`, "error");
    } finally {
      setLoading(false);
    }
  }, [showToast, tourId]);

  useEffect(() => {
    startTransition(() => {
      void loadData();
    });
  }, [loadData]);

  const selectedParticipant = data?.partecipanti.find(
    (item) => item.participantId === selectedParticipantId,
  );

  const handleToggle = async (
    templateId: string,
    participantId: string,
    completato: boolean,
  ) => {
    const key = `${templateId}:${participantId}`;
    setSavingKey(key);
    try {
      const updated = await setChecklistCompletion({
        tourId,
        templateId,
        participantId,
        completato,
      });
      setData(updated);
    } catch (error) {
      showToast(`Aggiornamento non riuscito. ${getErrorMessage(error)}`, "error");
    } finally {
      setSavingKey(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner className="h-5 w-5" />
      </div>
    );
  }

  if (!data || data.templates.length === 0) {
    return (
      <EmptyState
        icon={CheckSquare}
        title="Checklist non disponibile"
        description="Non ci sono voci checklist configurate per questo tour."
      />
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader
          title="Checklist operativa"
          description="Verifiche pre-partenza configurabili per tour e tracciate per partecipante."
        />
        <CardContent>
          {data.partecipanti.length === 0 ? (
            <EmptyState
              icon={Users}
              title="Nessun partecipante iscritto"
              description="Aggiungi partecipanti al tour per gestire la checklist."
            />
          ) : (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {data.partecipanti.map((partecipante) => (
                  <Button
                    key={partecipante.participantId}
                    variant={
                      selectedParticipantId === partecipante.participantId
                        ? "primary"
                        : "secondary"
                    }
                    size="sm"
                    onClick={() =>
                      setSelectedParticipantId(partecipante.participantId)
                    }
                  >
                    {partecipante.clienteNome} ({partecipante.completati}/
                    {partecipante.totali})
                  </Button>
                ))}
              </div>

              {selectedParticipant && (
                <div className="overflow-hidden rounded-2xl border border-zinc-200/70 bg-white">
                  <div className="border-b border-zinc-100 px-4 py-3">
                    <p className="text-sm font-medium text-zinc-900">
                      {selectedParticipant.clienteNome}
                    </p>
                    <p className="text-xs text-zinc-500">
                      {selectedParticipant.completati} di {selectedParticipant.totali}{" "}
                      voci completate
                    </p>
                  </div>
                  <ul className="divide-y divide-zinc-100">
                    {selectedParticipant.items.map(({ template, completion }) => {
                      const key = `${template.id}:${selectedParticipant.participantId}`;
                      const checked = completion?.completato ?? false;

                      return (
                        <li
                          key={template.id}
                          className="flex items-start gap-3 px-4 py-3"
                        >
                          <input
                            type="checkbox"
                            className="mt-1 h-4 w-4 rounded border-zinc-300"
                            checked={checked}
                            disabled={savingKey === key}
                            onChange={(event) =>
                              void handleToggle(
                                template.id,
                                selectedParticipant.participantId,
                                event.target.checked,
                              )
                            }
                          />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-zinc-900">
                              {template.etichetta}
                              {template.obbligatorio && (
                                <span className="ml-1 text-xs text-amber-600">
                                  *
                                </span>
                              )}
                            </p>
                            {template.descrizione && (
                              <p className="mt-0.5 text-xs text-zinc-500">
                                {template.descrizione}
                              </p>
                            )}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader
          title="Voci checklist del tour"
          description={`${data.templates.length} voci predefinite per questo tour.`}
        />
        <CardContent>
          <ul className="divide-y divide-zinc-100 rounded-xl border border-zinc-200/70 bg-white">
            {data.templates.map((template) => (
              <li
                key={template.id}
                className="flex items-center justify-between gap-3 px-4 py-3"
              >
                <div>
                  <p className="text-sm font-medium text-zinc-900">
                    {template.etichetta}
                  </p>
                  <p className="text-xs text-zinc-500">{template.codice}</p>
                </div>
                {template.obbligatorio ? (
                  <span className="text-xs font-medium text-amber-700">Obbligatoria</span>
                ) : (
                  <span className="text-xs text-zinc-400">Opzionale</span>
                )}
              </li>
            ))}
          </ul>
          <p className="mt-3 flex items-center gap-1 text-xs text-zinc-500">
            <Plus className="h-3 w-3" />
            Le voci vengono create automaticamente alla creazione del tour.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
