"use client";

import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import {
  METODO_PAGAMENTO_OPTIONS,
  TIPO_PAGAMENTO_OPTIONS,
} from "@/models/pagamento";
import type { PagamentoForm } from "@/types/pagamento";

type TourPagamentoModalProps = {
  open: boolean;
  mode: "create" | "edit";
  clienteNome: string;
  form: PagamentoForm;
  loading: boolean;
  error?: string;
  onClose: () => void;
  onFormChange: (form: PagamentoForm) => void;
  onSubmit: (event: React.FormEvent) => void;
};

export function TourPagamentoModal({
  open,
  mode,
  clienteNome,
  form,
  loading,
  error,
  onClose,
  onFormChange,
  onSubmit,
}: TourPagamentoModalProps) {
  const updateField = <K extends keyof PagamentoForm>(
    field: K,
    value: PagamentoForm[K],
  ) => {
    onFormChange({ ...form, [field]: value });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={
        mode === "create"
          ? `Aggiungi pagamento — ${clienteNome}`
          : `Modifica pagamento — ${clienteNome}`
      }
    >
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <Input
          label="Importo"
          name="importo"
          type="number"
          min="0"
          step="0.01"
          value={form.importo}
          onChange={(event) => updateField("importo", event.target.value)}
          placeholder="es. 960"
          disabled={loading}
          required
        />

        <Input
          label="Data"
          name="data"
          type="date"
          value={form.data}
          onChange={(event) => updateField("data", event.target.value)}
          disabled={loading}
          required
        />

        <Select
          label="Metodo pagamento"
          name="metodo"
          value={form.metodo}
          options={METODO_PAGAMENTO_OPTIONS}
          disabled={loading}
          onChange={(event) =>
            updateField(
              "metodo",
              event.target.value as PagamentoForm["metodo"],
            )
          }
        />

        <Select
          label="Tipo"
          name="tipo"
          value={form.tipo}
          options={TIPO_PAGAMENTO_OPTIONS}
          disabled={loading}
          onChange={(event) =>
            updateField("tipo", event.target.value as PagamentoForm["tipo"])
          }
        />

        {error && <p className="text-xs text-red-500">{error}</p>}

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>
            Annulla
          </Button>
          <Button
            type="submit"
            loading={loading}
            disabled={!form.importo || !form.data}
          >
            Salva
          </Button>
        </div>
      </form>
    </Modal>
  );
}
