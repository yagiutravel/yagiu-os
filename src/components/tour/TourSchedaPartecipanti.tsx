"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Users } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { Spinner } from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/Toast";
import {
  EMPTY_PARTECIPANTE_FORM,
  formToCreateInput,
  partecipazioneToForm,
} from "@/models/tour-partecipazione";
import {
  createPartecipazione,
  deletePartecipazione,
  getPartecipazioniByTourId,
  updatePartecipazione,
} from "@/services/tour-partecipazione.service";
import { getClienti } from "@/services/clienti.service";
import type { Cliente } from "@/types/cliente";
import type {
  PartecipanteForm,
  PartecipazioneTourView,
} from "@/types/tour-partecipazione";
import { TourPartecipanteModal } from "./TourPartecipanteModal";
import { TourPartecipantiTable } from "./TourPartecipantiTable";
import { getErrorMessage } from "@/shared/utils/error";

type TourSchedaPartecipantiProps = {
  tourId: string;
};

type ModalState =
  | { type: "closed" }
  | { type: "create" }
  | { type: "edit"; partecipazione: PartecipazioneTourView }
  | { type: "delete"; partecipazione: PartecipazioneTourView };


export function TourSchedaPartecipanti({ tourId }: TourSchedaPartecipantiProps) {
  const router = useRouter();
  const { showToast } = useToast();

  const [partecipanti, setPartecipanti] = useState<PartecipazioneTourView[]>([]);
  const [clienti, setClienti] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [modal, setModal] = useState<ModalState>({ type: "closed" });
  const [form, setForm] = useState<PartecipanteForm>(EMPTY_PARTECIPANTE_FORM);
  const [formError, setFormError] = useState<string | undefined>();

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [partecipazioniData, clientiData] = await Promise.all([
        getPartecipazioniByTourId(tourId),
        getClienti(),
      ]);
      setPartecipanti(partecipazioniData);
      setClienti(clientiData);
    } catch (error) {
      showToast(`Impossibile caricare i partecipanti. ${getErrorMessage(error)}`, "error");
    } finally {
      setLoading(false);
    }
  }, [showToast, tourId]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const excludeClienteIds = useMemo(
    () => partecipanti.map((item) => item.clienteId),
    [partecipanti],
  );

  const handleOpenCreate = () => {
    setForm(EMPTY_PARTECIPANTE_FORM);
    setFormError(undefined);
    setModal({ type: "create" });
  };

  const handleOpenEdit = (partecipazione: PartecipazioneTourView) => {
    setForm(partecipazioneToForm(partecipazione));
    setFormError(undefined);
    setModal({ type: "edit", partecipazione });
  };

  const handleOpenDelete = (partecipazione: PartecipazioneTourView) => {
    setModal({ type: "delete", partecipazione });
  };

  const handleCloseModal = () => {
    if (!saving) {
      setModal({ type: "closed" });
      setFormError(undefined);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.clienteId) {
      setFormError("Seleziona un cliente.");
      return;
    }

    setSaving(true);
    setFormError(undefined);

    try {
      if (modal.type === "create") {
        const created = await createPartecipazione(
          formToCreateInput(tourId, form),
        );
        setPartecipanti((prev) => [created, ...prev]);
        showToast(`${created.clienteNome} aggiunto al tour.`);
      } else if (modal.type === "edit") {
        const updated = await updatePartecipazione(modal.partecipazione.id, {
          ruolo: form.ruolo,
          pagamento: form.pagamento,
          documenti: form.documenti,
          questionario: form.questionario,
          note: form.note,
        });
        setPartecipanti((prev) =>
          prev.map((item) => (item.id === updated.id ? updated : item)),
        );
        showToast(`Partecipazione di ${updated.clienteNome} aggiornata.`);
      }

      setModal({ type: "closed" });
    } catch (error) {
      setFormError(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (modal.type !== "delete") return;

    setDeleting(true);
    const target = modal.partecipazione;

    try {
      await deletePartecipazione(target.id);
      setPartecipanti((prev) => prev.filter((item) => item.id !== target.id));
      showToast(`${target.clienteNome} rimosso dal tour.`);
      setModal({ type: "closed" });
    } catch (error) {
      showToast(`Impossibile rimuovere il partecipante. ${getErrorMessage(error)}`, "error");
    } finally {
      setDeleting(false);
    }
  };

  const handleClienteClick = (clienteId: string) => {
    router.push(`/clienti/${clienteId}`);
  };

  return (
    <>
      <Card>
        <CardHeader
          title="Partecipanti"
          description="Viaggiatori iscritti al tour e stato operativo del gruppo."
          action={
            <Button size="sm" onClick={handleOpenCreate} disabled={loading}>
              <Plus className="h-4 w-4" />
              Aggiungi partecipante
            </Button>
          }
        />
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="flex items-center gap-3 text-sm text-zinc-500">
                <Spinner className="h-5 w-5" />
                Caricamento partecipanti...
              </div>
            </div>
          ) : partecipanti.length === 0 ? (
            <EmptyState
              icon={Users}
              title="Nessun partecipante"
              description="Aggiungi il primo viaggiatore."
              actionLabel="Aggiungi partecipante"
              onAction={handleOpenCreate}
            />
          ) : (
            <TourPartecipantiTable
              partecipanti={partecipanti}
              onClienteClick={handleClienteClick}
              onEdit={handleOpenEdit}
              onDelete={handleOpenDelete}
            />
          )}
        </CardContent>
      </Card>

      {(modal.type === "create" || modal.type === "edit") && (
        <TourPartecipanteModal
          open
          mode={modal.type}
          form={form}
          clienti={clienti}
          excludeClienteIds={excludeClienteIds}
          loading={saving}
          error={formError}
          onClose={handleCloseModal}
          onFormChange={setForm}
          onSubmit={handleSubmit}
        />
      )}

      {modal.type === "delete" && (
        <ConfirmDialog
          open
          title="Rimuovi partecipante"
          description={`Sei sicuro di voler rimuovere "${modal.partecipazione.clienteNome}" da questo tour?`}
          confirmLabel="Rimuovi"
          loading={deleting}
          onConfirm={handleDeleteConfirm}
          onClose={() => {
            if (!deleting) setModal({ type: "closed" });
          }}
        />
      )}
    </>
  );
}
