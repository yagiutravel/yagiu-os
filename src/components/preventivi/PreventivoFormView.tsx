"use client";

import { useCallback, useEffect, useMemo, useState, startTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Copy, FileText, Trash2, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Spinner } from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/Toast";
import { profiloContentWrap } from "@/lib/clienti/profilo-ui";
import { PREVENTIVO_STATO_OPTIONS } from "@/lib/preventivi/constants";
import { calculatePreventivoTotals, DEFAULT_TASSE_PERCENTUALE } from "@/models/preventivo";
import { getClienti } from "@/services/clienti.service";
import {
  convertPreventivoToIscrizione,
  createPreventivo,
  deletePreventivo,
  duplicatePreventivo,
  getPreventivoById,
  updatePreventivo,
} from "@/services/preventivo.service";
import { getTours } from "@/services/tour.service";
import type { Cliente } from "@/types/cliente";
import type {
  PreventivoRigaInput,
  StatoPreventivo,
} from "@/types/preventivo";
import type { Tour } from "@/types/tour";
import { getErrorMessage } from "@/shared/utils/error";
import { PreventivoStatoBadge } from "./PreventivoStatoBadge";

type PreventivoFormViewProps = {
  mode: "create" | "edit";
  preventivoId?: string;
};

type RigaForm = PreventivoRigaInput & { key: string };

function emptyRiga(): RigaForm {
  return {
    key: crypto.randomUUID(),
    descrizione: "",
    quantita: 1,
    prezzoUnitario: 0,
  };
}

function formatEuro(value: number): string {
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
  }).format(value);
}

export function PreventivoFormView({ mode, preventivoId }: PreventivoFormViewProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(mode === "edit");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [clienti, setClienti] = useState<Cliente[]>([]);
  const [tours, setTours] = useState<Tour[]>([]);
  const [numero, setNumero] = useState("");
  const [clienteId, setClienteId] = useState("");
  const [tourId, setTourId] = useState("");
  const [titolo, setTitolo] = useState("");
  const [stato, setStato] = useState<StatoPreventivo>("Bozza");
  const [tassePercentuale, setTassePercentuale] = useState(String(DEFAULT_TASSE_PERCENTUALE));
  const [validoFino, setValidoFino] = useState("");
  const [note, setNote] = useState("");
  const [righe, setRighe] = useState<RigaForm[]>([emptyRiga()]);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const loadContext = useCallback(async () => {
    const [clientiData, toursData] = await Promise.all([getClienti(), getTours()]);
    setClienti(clientiData);
    setTours(toursData.filter((tour) => tour.stato !== "Archiviato"));
  }, []);

  const loadPreventivo = useCallback(async () => {
    if (!preventivoId) return;
    setLoading(true);
    try {
      const preventivo = await getPreventivoById(preventivoId);
      if (!preventivo) {
        showToast("Preventivo non trovato.", "error");
        router.push("/preventivi");
        return;
      }
      setNumero(preventivo.numero);
      setClienteId(preventivo.clienteId);
      setTourId(preventivo.tourId ?? "");
      setTitolo(preventivo.titolo);
      setStato(preventivo.stato);
      setTassePercentuale(String(preventivo.tassePercentuale));
      setValidoFino(preventivo.validoFino ?? "");
      setNote(preventivo.note);
      setRighe(
        preventivo.righe.length > 0
          ? preventivo.righe.map((riga) => ({
              key: riga.id,
              id: riga.id,
              descrizione: riga.descrizione,
              quantita: riga.quantita,
              prezzoUnitario: riga.prezzoUnitario,
              ordine: riga.ordine,
            }))
          : [emptyRiga()],
      );
    } catch (error) {
      showToast(`Impossibile caricare il preventivo. ${getErrorMessage(error)}`, "error");
    } finally {
      setLoading(false);
    }
  }, [preventivoId, router, showToast]);

  useEffect(() => {
    startTransition(() => {
      void loadContext();
      if (mode === "edit") void loadPreventivo();
    });
  }, [loadContext, loadPreventivo, mode]);

  const totals = useMemo(
    () =>
      calculatePreventivoTotals(
        righe.map((riga) => ({
          descrizione: riga.descrizione,
          quantita: Number(riga.quantita) || 0,
          prezzoUnitario: Number(riga.prezzoUnitario) || 0,
        })),
        Number(tassePercentuale) || 0,
      ),
    [righe, tassePercentuale],
  );

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!clienteId) {
      showToast("Seleziona un cliente.", "error");
      return;
    }

    const righeValide = righe.filter((riga) => riga.descrizione.trim());
    if (righeValide.length === 0) {
      showToast("Aggiungi almeno una riga con descrizione.", "error");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        clienteId,
        tourId: tourId || null,
        titolo,
        stato,
        tassePercentuale: Number(tassePercentuale) || 0,
        validoFino: validoFino || null,
        note,
        righe: righeValide.map((riga, index) => ({
          descrizione: riga.descrizione,
          quantita: Number(riga.quantita) || 1,
          prezzoUnitario: Number(riga.prezzoUnitario) || 0,
          ordine: index,
        })),
      };

      if (mode === "create") {
        const created = await createPreventivo(payload);
        showToast("Preventivo creato.", "success");
        router.push(`/preventivi/${created.id}`);
      } else if (preventivoId) {
        await updatePreventivo(preventivoId, payload);
        showToast("Preventivo aggiornato.", "success");
        await loadPreventivo();
      }
    } catch (error) {
      showToast(`Salvataggio non riuscito. ${getErrorMessage(error)}`, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDuplicate = async () => {
    if (!preventivoId) return;
    setSaving(true);
    try {
      const duplicated = await duplicatePreventivo(preventivoId);
      showToast("Preventivo duplicato.", "success");
      router.push(`/preventivi/${duplicated.id}`);
    } catch (error) {
      showToast(`Duplicazione non riuscita. ${getErrorMessage(error)}`, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleConvert = async () => {
    if (!preventivoId) return;
    setSaving(true);
    try {
      await convertPreventivoToIscrizione(preventivoId);
      showToast("Preventivo convertito in iscrizione tour.", "success");
      await loadPreventivo();
    } catch (error) {
      showToast(`Conversione non riuscita. ${getErrorMessage(error)}`, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!preventivoId) return;
    setDeleting(true);
    try {
      await deletePreventivo(preventivoId);
      showToast("Preventivo eliminato.", "success");
      router.push("/preventivi");
    } catch (error) {
      showToast(`Eliminazione non riuscita. ${getErrorMessage(error)}`, "error");
    } finally {
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner className="h-5 w-5" />
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="border-b border-zinc-200/60 bg-white/90 px-4 py-4 sm:px-6 lg:px-8">
        <div className={`${profiloContentWrap} flex flex-wrap items-center justify-between gap-3`}>
          <div>
            <Button variant="ghost" size="sm" onClick={() => router.push("/preventivi")}>
              <ArrowLeft className="mr-1.5 h-4 w-4" />
              Preventivi
            </Button>
            <h1 className="mt-2 text-xl font-semibold text-zinc-900">
              {mode === "create" ? "Nuovo preventivo" : numero || "Preventivo"}
            </h1>
            {mode === "edit" && <PreventivoStatoBadge stato={stato} />}
          </div>
          {mode === "edit" && (
            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" size="sm" onClick={() => void handleDuplicate()} disabled={saving}>
                <Copy className="mr-1.5 h-4 w-4" />
                Duplica
              </Button>
              {stato !== "Convertito" && tourId && (
                <Button variant="secondary" size="sm" onClick={() => void handleConvert()} disabled={saving}>
                  <UserPlus className="mr-1.5 h-4 w-4" />
                  Converti in iscrizione
                </Button>
              )}
              <Button variant="danger" size="sm" onClick={() => setConfirmDelete(true)} disabled={saving}>
                <Trash2 className="mr-1.5 h-4 w-4" />
                Elimina
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-[#f7f7f8] px-4 py-4 sm:px-6 lg:px-8">
        <form onSubmit={handleSubmit} className={`${profiloContentWrap} grid gap-4 lg:grid-cols-[2fr_1fr]`}>
          <Card>
            <CardHeader
              title="Dettagli preventivo"
              description="Cliente, tour collegato e condizioni commerciali."
            />
            <CardContent className="space-y-4">
              <Select
                label="Cliente"
                options={[
                  { value: "", label: "Seleziona cliente" },
                  ...clienti.map((cliente) => ({
                    value: cliente.id,
                    label: cliente.nome,
                  })),
                ]}
                value={clienteId}
                onChange={(event) => setClienteId(event.target.value)}
                disabled={saving || stato === "Convertito"}
                required
              />
              <Select
                label="Tour collegato"
                options={[
                  { value: "", label: "Nessun tour" },
                  ...tours.map((tour) => ({
                    value: tour.id,
                    label: tour.nomeTour,
                  })),
                ]}
                value={tourId}
                onChange={(event) => setTourId(event.target.value)}
                disabled={saving || stato === "Convertito"}
              />
              <Input
                label="Titolo"
                value={titolo}
                onChange={(event) => setTitolo(event.target.value)}
                disabled={saving}
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <Select
                  label="Stato"
                  options={PREVENTIVO_STATO_OPTIONS.map((value) => ({
                    value,
                    label: value,
                  }))}
                  value={stato}
                  onChange={(event) => setStato(event.target.value as StatoPreventivo)}
                  disabled={saving || stato === "Convertito"}
                />
                <Input
                  label="Valido fino"
                  type="date"
                  value={validoFino}
                  onChange={(event) => setValidoFino(event.target.value)}
                  disabled={saving}
                />
              </div>
              <Input
                label="Note"
                value={note}
                onChange={(event) => setNote(event.target.value)}
                disabled={saving}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader title="Totali" description="Calcolo automatico da righe e aliquota IVA." />
            <CardContent className="space-y-3">
              <Input
                label="IVA %"
                type="number"
                min={0}
                step="0.01"
                value={tassePercentuale}
                onChange={(event) => setTassePercentuale(event.target.value)}
                disabled={saving}
              />
              <div className="space-y-2 rounded-lg bg-zinc-50 p-4 text-sm">
                <div className="flex justify-between text-zinc-600">
                  <span>Subtotale</span>
                  <span>{formatEuro(totals.subtotale)}</span>
                </div>
                <div className="flex justify-between text-zinc-600">
                  <span>Tasse</span>
                  <span>{formatEuro(totals.tasse)}</span>
                </div>
                <div className="flex justify-between border-t border-zinc-200 pt-2 text-base font-semibold text-zinc-900">
                  <span>Totale</span>
                  <span>{formatEuro(totals.totale)}</span>
                </div>
              </div>
              <Button type="submit" className="w-full" loading={saving}>
                {mode === "create" ? "Crea preventivo" : "Salva modifiche"}
              </Button>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader
              title="Righe preventivo"
              description="Servizi, pacchetti o voci personalizzate."
              action={
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={() => setRighe((current) => [...current, emptyRiga()])}
                  disabled={saving}
                >
                  Aggiungi riga
                </Button>
              }
            />
            <CardContent className="space-y-3">
              {righe.length === 0 ? (
                <EmptyState
                  icon={FileText}
                  title="Nessuna riga"
                  description="Aggiungi almeno una voce al preventivo."
                />
              ) : (
                righe.map((riga, index) => (
                  <div
                    key={riga.key}
                    className="grid gap-3 rounded-lg border border-zinc-200/80 bg-white p-4 md:grid-cols-[2fr_1fr_1fr_auto]"
                  >
                    <Input
                      label="Descrizione"
                      value={riga.descrizione}
                      onChange={(event) =>
                        setRighe((current) =>
                          current.map((item, itemIndex) =>
                            itemIndex === index
                              ? { ...item, descrizione: event.target.value }
                              : item,
                          ),
                        )
                      }
                      disabled={saving}
                    />
                    <Input
                      label="Quantità"
                      type="number"
                      min={0.01}
                      step="0.01"
                      value={riga.quantita}
                      onChange={(event) =>
                        setRighe((current) =>
                          current.map((item, itemIndex) =>
                            itemIndex === index
                              ? { ...item, quantita: Number(event.target.value) }
                              : item,
                          ),
                        )
                      }
                      disabled={saving}
                    />
                    <Input
                      label="Prezzo unitario (€)"
                      type="number"
                      min={0}
                      step="0.01"
                      value={riga.prezzoUnitario}
                      onChange={(event) =>
                        setRighe((current) =>
                          current.map((item, itemIndex) =>
                            itemIndex === index
                              ? { ...item, prezzoUnitario: Number(event.target.value) }
                              : item,
                          ),
                        )
                      }
                      disabled={saving}
                    />
                    <div className="flex items-end">
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() =>
                          setRighe((current) =>
                            current.filter((_, itemIndex) => itemIndex !== index),
                          )
                        }
                        disabled={saving || righe.length === 1}
                      >
                        Rimuovi
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </form>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        title="Elimina preventivo"
        description="Il preventivo e tutte le righe verranno eliminati definitivamente."
        confirmLabel="Elimina"
        loading={deleting}
        onConfirm={() => void handleDelete()}
        onClose={() => {
          if (!deleting) setConfirmDelete(false);
        }}
      />
    </div>
  );
}
