"use client";

import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { STATO_OPTIONS } from "@/lib/clienti/constants";
import type { ClienteForm, ClienteFormErrors } from "@/types/cliente";

type ClienteFormModalProps = {
  open: boolean;
  mode: "create" | "edit";
  form: ClienteForm;
  errors: ClienteFormErrors;
  loading: boolean;
  onClose: () => void;
  onFormChange: (form: ClienteForm) => void;
  onSubmit: (event: React.FormEvent) => void;
  onFieldChange: (field: keyof ClienteForm) => void;
};

export function ClienteFormModal({
  open,
  mode,
  form,
  errors,
  loading,
  onClose,
  onFormChange,
  onSubmit,
  onFieldChange,
}: ClienteFormModalProps) {
  const updateField = <K extends keyof ClienteForm>(
    field: K,
    value: ClienteForm[K],
  ) => {
    onFormChange({ ...form, [field]: value });
    onFieldChange(field);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={mode === "create" ? "Nuovo Cliente" : "Modifica Cliente"}
    >
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <Input
          label="Nome"
          name="nome"
          value={form.nome}
          onChange={(event) => updateField("nome", event.target.value)}
          placeholder="Es. Giulia Bianchi"
          error={errors.nome}
          disabled={loading}
        />

        <Input
          label="Email"
          name="email"
          type="email"
          value={form.email}
          onChange={(event) => updateField("email", event.target.value)}
          placeholder="nome@email.com"
          error={errors.email}
          disabled={loading}
        />

        <Input
          label="Telefono"
          name="telefono"
          type="tel"
          value={form.telefono}
          onChange={(event) => updateField("telefono", event.target.value)}
          placeholder="+39 333 123 4567"
          error={errors.telefono}
          disabled={loading}
        />

        <Input
          label="Azienda"
          name="azienda"
          value={form.azienda}
          onChange={(event) => updateField("azienda", event.target.value)}
          placeholder="Nome azienda"
          error={errors.azienda}
          disabled={loading}
        />

        <Select
          label="Stato"
          name="stato"
          value={form.stato}
          onChange={(event) =>
            updateField("stato", event.target.value as ClienteForm["stato"])
          }
          options={STATO_OPTIONS}
          disabled={loading}
        />

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>
            Annulla
          </Button>
          <Button type="submit" loading={loading}>
            {mode === "create" ? "Salva Cliente" : "Aggiorna Cliente"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
