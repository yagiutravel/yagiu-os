"use client";

import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import {
  DOCUMENTI_PARTECIPANTE_OPTIONS,
  PAGAMENTO_PARTECIPANTE_OPTIONS,
  QUESTIONARIO_PARTECIPANTE_OPTIONS,
  RUOLO_PARTECIPANTE_OPTIONS,
} from "@/models/tour-partecipazione";
import type { Cliente } from "@/types/cliente";
import type { PartecipanteForm } from "@/types/tour-partecipazione";
import { ClienteSearchSelect } from "./ClienteSearchSelect";

type TourPartecipanteModalProps = {
  open: boolean;
  mode: "create" | "edit";
  form: PartecipanteForm;
  clienti: Cliente[];
  excludeClienteIds: string[];
  loading: boolean;
  error?: string;
  onClose: () => void;
  onFormChange: (form: PartecipanteForm) => void;
  onSubmit: (event: React.FormEvent) => void;
};

export function TourPartecipanteModal({
  open,
  mode,
  form,
  clienti,
  excludeClienteIds,
  loading,
  error,
  onClose,
  onFormChange,
  onSubmit,
}: TourPartecipanteModalProps) {
  const updateField = <K extends keyof PartecipanteForm>(
    field: K,
    value: PartecipanteForm[K],
  ) => {
    onFormChange({ ...form, [field]: value });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={mode === "create" ? "Aggiungi partecipante" : "Modifica partecipante"}
    >
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-zinc-700">Cliente</label>
          <ClienteSearchSelect
            clienti={clienti}
            selectedId={form.clienteId}
            disabled={mode === "edit" || loading}
            excludeIds={excludeClienteIds}
            onSelect={(clienteId) => updateField("clienteId", clienteId)}
          />
        </div>

        {form.clienteId && (
          <>
            <Select
              label="Ruolo"
              name="ruolo"
              value={form.ruolo}
              options={RUOLO_PARTECIPANTE_OPTIONS}
              disabled={loading}
              onChange={(event) =>
                updateField("ruolo", event.target.value as PartecipanteForm["ruolo"])
              }
            />

            <Select
              label="Pagamento"
              name="pagamento"
              value={form.pagamento}
              options={PAGAMENTO_PARTECIPANTE_OPTIONS}
              disabled={loading}
              onChange={(event) =>
                updateField(
                  "pagamento",
                  event.target.value as PartecipanteForm["pagamento"],
                )
              }
            />

            <Select
              label="Documenti"
              name="documenti"
              value={form.documenti}
              options={DOCUMENTI_PARTECIPANTE_OPTIONS}
              disabled={loading}
              onChange={(event) =>
                updateField(
                  "documenti",
                  event.target.value as PartecipanteForm["documenti"],
                )
              }
            />

            <Select
              label="Questionario"
              name="questionario"
              value={form.questionario}
              options={QUESTIONARIO_PARTECIPANTE_OPTIONS}
              disabled={loading}
              onChange={(event) =>
                updateField(
                  "questionario",
                  event.target.value as PartecipanteForm["questionario"],
                )
              }
            />

            <div className="space-y-1.5">
              <label htmlFor="note" className="block text-xs font-medium text-zinc-700">
                Note
              </label>
              <textarea
                id="note"
                name="note"
                value={form.note}
                onChange={(event) => updateField("note", event.target.value)}
                disabled={loading}
                rows={3}
                placeholder="Note operative sul partecipante..."
                className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none transition-colors duration-200 focus:border-zinc-400 focus:ring-2 focus:ring-zinc-100 disabled:bg-zinc-50"
              />
            </div>
          </>
        )}

        {error && <p className="text-xs text-red-500">{error}</p>}

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>
            Annulla
          </Button>
          <Button type="submit" loading={loading} disabled={!form.clienteId}>
            {mode === "create" ? "Aggiungi" : "Salva"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
