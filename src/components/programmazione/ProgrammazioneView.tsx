"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CalendarClock, Plus, SearchX } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Spinner } from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/Toast";
import { profiloContentWrap } from "@/lib/clienti/profilo-ui";
import {
  filterSchedulazioni,
  getSchedulazioneRiepilogo,
  getSchedulazioni,
  type SchedulazioneRiepilogo,
} from "@/services/schedulazione.service";
import type {
  SchedulazioneStato,
  SchedulazioneTipo,
  SchedulazioneView,
} from "@/types/schedulazione";
import { SchedulazioneModal } from "./SchedulazioneModal";
import { SchedulazioneRiepilogoCards } from "./SchedulazioneRiepilogoCards";
import { SchedulazioneTable } from "./SchedulazioneTable";
import { SchedulazioneToolbar } from "./SchedulazioneToolbar";
import { getErrorMessage } from "@/shared/utils/error";


export function ProgrammazioneView() {
  const { showToast } = useToast();
  const [items, setItems] = useState<SchedulazioneView[]>([]);
  const [riepilogo, setRiepilogo] = useState<SchedulazioneRiepilogo | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [stato, setStato] = useState<SchedulazioneStato | "tutte">("tutte");
  const [tipo, setTipo] = useState<SchedulazioneTipo | "tutti">("tutti");
  const [modalOpen, setModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [schedulazioni, summary] = await Promise.all([
        getSchedulazioni(),
        getSchedulazioneRiepilogo(),
      ]);
      setItems(schedulazioni);
      setRiepilogo(summary);
    } catch (error) {
      showToast(
        `Impossibile caricare le schedulazioni. ${getErrorMessage(error)}`,
        "error",
      );
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    void loadData();
  }, [loadData, refreshKey]);

  const filtered = useMemo(
    () => filterSchedulazioni(items, search, stato, tipo),
    [items, search, stato, tipo],
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex-1 overflow-y-auto px-6 py-4 sm:px-6 lg:px-8">
        <div className={`${profiloContentWrap} space-y-6`}>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-semibold text-zinc-900">
                Scheduler comunicazioni
              </h2>
              <p className="mt-1 text-sm text-zinc-500">
                Programma email, WhatsApp e reminder automatici.
              </p>
            </div>
            <Button onClick={() => setModalOpen(true)}>
              <Plus className="h-4 w-4" />
              Nuova programmazione
            </Button>
          </div>

          {riepilogo && (
            <SchedulazioneRiepilogoCards
              riepilogo={riepilogo}
              statoAttivo={stato === "tutte" ? "" : stato}
              onStatoChange={(value) =>
                setStato(
                  value === "tutte"
                    ? "tutte"
                    : (value as SchedulazioneStato),
                )
              }
            />
          )}

          <Card>
            <CardHeader
              title="Elenco schedulazioni"
              description="Tutte le comunicazioni programmate nel gestionale."
              action={
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-50 text-violet-700 ring-1 ring-inset ring-violet-600/15">
                  <CalendarClock className="h-4 w-4" strokeWidth={1.75} />
                </div>
              }
            />
            <CardContent className="space-y-4">
              <SchedulazioneToolbar
                search={search}
                stato={stato}
                tipo={tipo}
                resultCount={filtered.length}
                onSearchChange={setSearch}
                onStatoChange={setStato}
                onTipoChange={setTipo}
              />

              {loading ? (
                <div className="flex items-center justify-center py-24">
                  <Spinner className="h-5 w-5" />
                </div>
              ) : filtered.length === 0 ? (
                <EmptyState
                  icon={search || stato !== "tutte" || tipo !== "tutti" ? SearchX : CalendarClock}
                  title="Nessuna schedulazione trovata"
                  description={
                    search || stato !== "tutte" || tipo !== "tutti"
                      ? "Prova a modificare i filtri."
                      : "Crea la prima programmazione."
                  }
                  actionLabel={
                    search || stato !== "tutte" || tipo !== "tutti"
                      ? undefined
                      : "Nuova programmazione"
                  }
                  onAction={
                    search || stato !== "tutte" || tipo !== "tutti"
                      ? undefined
                      : () => setModalOpen(true)
                  }
                />
              ) : (
                <SchedulazioneTable items={filtered} />
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <SchedulazioneModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={() => {
          setRefreshKey((v) => v + 1);
          showToast("Schedulazione creata.", "success");
        }}
      />
    </div>
  );
}
