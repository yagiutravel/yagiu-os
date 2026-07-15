"use client";

import { useCallback, useEffect, useState, startTransition } from "react";
import { Users } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { Spinner } from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/Toast";
import {
  EMPTY_PAGAMENTO_FORM,
  formToCreateInput,
  pagamentoToForm,
} from "@/models/pagamento";
import {
  createPagamento,
  deletePagamento,
  getPagamentiByTourId,
  updatePagamento,
} from "@/services/pagamento.service";
import type {
  Pagamento,
  PagamentoForm,
  PartecipantePagamentoView,
  TourPagamentiData,
} from "@/types/pagamento";
import { TourPagamentiRiepilogo } from "./TourPagamentiRiepilogo";
import { TourPagamentiTable } from "./TourPagamentiTable";
import { TourPagamentoModal } from "./TourPagamentoModal";
import { getErrorMessage } from "@/shared/utils/error";

type TourSchedaPagamentiProps = {
  tourId: string;
};

type ModalState =
  | { type: "closed" }
  | {
      type: "form";
      mode: "create" | "edit";
      partecipante: PartecipantePagamentoView;
      pagamentoId?: string;
    }
  | {
      type: "delete";
      partecipante: PartecipantePagamentoView;
      pagamento: Pagamento;
    };


export function TourSchedaPagamenti({ tourId }: TourSchedaPagamentiProps) {
  const { showToast } = useToast();

  const [data, setData] = useState<TourPagamentiData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [modal, setModal] = useState<ModalState>({ type: "closed" });
  const [form, setForm] = useState<PagamentoForm>(EMPTY_PAGAMENTO_FORM);
  const [formError, setFormError] = useState<string | undefined>();

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const pagamentiData = await getPagamentiByTourId(tourId);
      setData(pagamentiData);
    } catch (error) {
      showToast(
        `Impossibile caricare i pagamenti. ${getErrorMessage(error)}`,
        "error",
      );
    } finally {
      setLoading(false);
    }
  }, [showToast, tourId]);

  useEffect(() => {
    startTransition(() => {
      void loadData();
    });
  }, [loadData]);

  const handleOpenCreate = (partecipante: PartecipantePagamentoView) => {
    setForm(EMPTY_PAGAMENTO_FORM);
    setFormError(undefined);
    setModal({ type: "form", mode: "create", partecipante });
  };

  const handleOpenEdit = (
    partecipante: PartecipantePagamentoView,
    pagamento: Pagamento,
  ) => {
    setForm(pagamentoToForm(pagamento));
    setFormError(undefined);
    setModal({
      type: "form",
      mode: "edit",
      partecipante,
      pagamentoId: pagamento.id,
    });
  };

  const handleOpenDelete = (
    partecipante: PartecipantePagamentoView,
    pagamento: Pagamento,
  ) => {
    setModal({ type: "delete", partecipante, pagamento });
  };

  const handleCloseModal = () => {
    if (!saving) {
      setModal({ type: "closed" });
      setFormError(undefined);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (modal.type !== "form") return;

    setSaving(true);
    setFormError(undefined);

    try {
      const input = formToCreateInput(
        tourId,
        modal.partecipante.partecipazioneId,
        form,
      );

      let updated: TourPagamentiData;

      if (modal.mode === "create") {
        updated = await createPagamento(input);
        showToast(
          `Pagamento di ${formatImporto(input.importo)} registrato per ${modal.partecipante.clienteNome}.`,
        );
      } else if (modal.pagamentoId) {
        updated = await updatePagamento(modal.pagamentoId, {
          importo: input.importo,
          data: input.data,
          metodo: input.metodo,
          tipo: input.tipo,
        });
        showToast(`Pagamento di ${modal.partecipante.clienteNome} aggiornato.`);
      } else {
        return;
      }

      setData(updated);
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
    const { pagamento, partecipante } = modal;

    try {
      const updated = await deletePagamento(pagamento.id);
      setData(updated);
      showToast(`Pagamento rimosso per ${partecipante.clienteNome}.`);
      setModal({ type: "closed" });
    } catch (error) {
      showToast(
        `Impossibile eliminare il pagamento. ${getErrorMessage(error)}`,
        "error",
      );
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <Card>
        <CardHeader
          title="Pagamenti"
          description="Situazione economica dei partecipanti al tour."
        />
        <CardContent className="space-y-6">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="flex items-center gap-3 text-sm text-zinc-500">
                <Spinner className="h-5 w-5" />
                Caricamento pagamenti...
              </div>
            </div>
          ) : !data || data.partecipanti.length === 0 ? (
            <EmptyState
              icon={Users}
              title="Nessun partecipante"
              description="Aggiungi partecipanti al tour per gestire i pagamenti."
            />
          ) : (
            <>
              <TourPagamentiRiepilogo riepilogo={data.riepilogo} />
              <TourPagamentiTable
                partecipanti={data.partecipanti}
                onAddPagamento={handleOpenCreate}
                onEditPagamento={handleOpenEdit}
                onDeletePagamento={handleOpenDelete}
              />
            </>
          )}
        </CardContent>
      </Card>

      {modal.type === "form" && (
        <TourPagamentoModal
          open
          mode={modal.mode}
          clienteNome={modal.partecipante.clienteNome}
          form={form}
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
          title="Elimina pagamento"
          description={`Sei sicuro di voler eliminare il pagamento di ${formatImporto(modal.pagamento.importo)} per "${modal.partecipante.clienteNome}"?`}
          confirmLabel="Elimina"
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

function formatImporto(importo: number): string {
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(importo);
}
