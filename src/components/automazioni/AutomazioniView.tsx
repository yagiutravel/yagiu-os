"use client";

import { useCallback, useEffect, useMemo, useState, startTransition } from "react";
import { Plus, SearchX, Workflow } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Spinner } from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/Toast";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageContent } from "@/shared/components/layout/PageContent";
import {
  filterAutomazioni,
  getAutomazioneRiepilogo,
  getAutomazioni,
  type AutomazioneRiepilogo,
} from "@/services/automazione.service";
import type { AutomazioneStato, AutomazioneView } from "@/types/automazione";
import { AutomazioneModal } from "./AutomazioneModal";
import { AutomazioneRiepilogoCards } from "./AutomazioneRiepilogoCards";
import { AutomazioneTable } from "./AutomazioneTable";
import { AutomazioneToolbar } from "./AutomazioneToolbar";
import { getErrorMessage } from "@/shared/utils/error";


export function AutomazioniView() {
  const { showToast } = useToast();
  const [items, setItems] = useState<AutomazioneView[]>([]);
  const [riepilogo, setRiepilogo] = useState<AutomazioneRiepilogo | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [stato, setStato] = useState<AutomazioneStato | "tutti">("tutti");
  const [modalOpen, setModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [automazioni, summary] = await Promise.all([
        getAutomazioni(),
        getAutomazioneRiepilogo(),
      ]);
      setItems(automazioni);
      setRiepilogo(summary);
    } catch (error) {
      showToast(
        `Impossibile caricare le automazioni. ${getErrorMessage(error)}`,
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
  }, [loadData, refreshKey]);

  const filtered = useMemo(
    () => filterAutomazioni(items, search, stato),
    [items, search, stato],
  );

  return (
    <>
      <div className="flex min-h-0 flex-1 flex-col">
        <PageHeader
          title="Automazioni"
          description="Workflow automatici con trigger e azioni configurabili."
          action={
            <Button onClick={() => setModalOpen(true)}>
              <Plus className="h-4 w-4" />
              Nuova regola
            </Button>
          }
        />

        <PageContent className="space-y-4">
          {riepilogo && (
            <AutomazioneRiepilogoCards
              riepilogo={riepilogo}
              statoAttivo={stato === "tutti" ? "" : stato}
              onStatoChange={(value) =>
                setStato(
                  value === "tutti" ? "tutti" : (value as AutomazioneStato),
                )
              }
            />
          )}

          <Card>
            <CardHeader
              title="Elenco automazioni"
              description="Tutte le regole configurate nel gestionale."
              action={
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-700 ring-1 ring-inset ring-indigo-600/15">
                  <Workflow className="h-4 w-4" strokeWidth={1.75} />
                </div>
              }
            />
            <CardContent className="space-y-4">
              <AutomazioneToolbar
                search={search}
                stato={stato}
                resultCount={filtered.length}
                onSearchChange={setSearch}
                onStatoChange={setStato}
              />

              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Spinner className="h-5 w-5" />
                </div>
              ) : filtered.length === 0 ? (
                <EmptyState
                  icon={
                    search || stato !== "tutti" ? SearchX : Workflow
                  }
                  title="Nessuna automazione trovata"
                  description={
                    search || stato !== "tutti"
                      ? "Prova a modificare i filtri."
                      : "Crea la prima regola automatica."
                  }
                  actionLabel={
                    search || stato !== "tutti" ? undefined : "Nuova regola"
                  }
                  onAction={
                    search || stato !== "tutti"
                      ? undefined
                      : () => setModalOpen(true)
                  }
                />
              ) : (
                <AutomazioneTable items={filtered} />
              )}
            </CardContent>
          </Card>
        </PageContent>
      </div>

      <AutomazioneModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={() => {
          setRefreshKey((v) => v + 1);
          showToast("Automazione creata.", "success");
        }}
      />
    </>
  );
}
