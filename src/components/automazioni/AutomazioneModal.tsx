"use client";

import { startTransition, useEffect, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import {
  AUTOMAZIONE_AZIONE_OPTIONS,
  AUTOMAZIONE_TRIGGER_AZIONE_DEFAULT,
  AUTOMAZIONE_TRIGGER_OPTIONS,
} from "@/lib/automazione/constants";
import {
  EMPTY_AUTOMAZIONE_FORM,
  hasAutomazioneFormErrors,
  validateAutomazioneForm,
} from "@/models/automazione";
import { createAutomazione } from "@/services/automazione.service";
import { getErrorMessage } from "@/shared/utils/error";
import type {
  AutomazioneAzione,
  AutomazioneForm,
  AutomazioneFormErrors,
  AutomazioneStato,
  AutomazioneTrigger,
} from "@/types/automazione";

type AutomazioneModalProps = {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
};


export function AutomazioneModal({
  open,
  onClose,
  onCreated,
}: AutomazioneModalProps) {
  const [form, setForm] = useState<AutomazioneForm>(EMPTY_AUTOMAZIONE_FORM);
  const [errors, setErrors] = useState<AutomazioneFormErrors>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    startTransition(() => {
      setForm(EMPTY_AUTOMAZIONE_FORM);
      setErrors({});
    });
  }, [open]);

  const handleTriggerChange = (trigger: AutomazioneTrigger | "") => {
    setForm((prev) => ({
      ...prev,
      trigger,
      azione: trigger
        ? AUTOMAZIONE_TRIGGER_AZIONE_DEFAULT[trigger]
        : ("" as AutomazioneAzione | ""),
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const validationErrors = validateAutomazioneForm(form);
    setErrors(validationErrors);
    if (hasAutomazioneFormErrors(validationErrors)) return;

    setSaving(true);
    try {
      await createAutomazione({
        nome: form.nome.trim(),
        trigger: form.trigger as AutomazioneTrigger,
        azione: form.azione as AutomazioneAzione,
        stato: form.stato,
      });
      onCreated();
      onClose();
    } catch (error) {
      setErrors({ nome: `Salvataggio fallito. ${getErrorMessage(error)}` });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Nuova automazione" size="large">
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <Input
          label="Nome"
          name="nome"
          value={form.nome}
          onChange={(e) => setForm((p) => ({ ...p, nome: e.target.value }))}
          placeholder="Es. Reminder saldo in sospeso"
          error={errors.nome}
          disabled={saving}
        />

        <Select
          label="Trigger"
          name="trigger"
          value={form.trigger}
          onChange={(e) =>
            handleTriggerChange(e.target.value as AutomazioneTrigger | "")
          }
          disabled={saving}
          options={[
            { value: "", label: "Seleziona trigger" },
            ...AUTOMAZIONE_TRIGGER_OPTIONS.map((o) => ({
              value: o.value,
              label: o.label,
            })),
          ]}
        />
        {errors.trigger && (
          <p className="-mt-2 text-xs text-red-600">{errors.trigger}</p>
        )}

        <Select
          label="Azione"
          name="azione"
          value={form.azione}
          onChange={(e) =>
            setForm((p) => ({
              ...p,
              azione: e.target.value as AutomazioneAzione | "",
            }))
          }
          disabled={saving}
          options={[
            { value: "", label: "Seleziona azione" },
            ...AUTOMAZIONE_AZIONE_OPTIONS.map((o) => ({
              value: o.value,
              label: o.label,
            })),
          ]}
        />
        {errors.azione && (
          <p className="-mt-2 text-xs text-red-600">{errors.azione}</p>
        )}

        <Select
          label="Stato"
          name="stato"
          value={form.stato}
          onChange={(e) =>
            setForm((p) => ({
              ...p,
              stato: e.target.value as AutomazioneStato,
            }))
          }
          disabled={saving}
          options={[
            { value: "attivo", label: "Attivo" },
            { value: "inattivo", label: "Inattivo" },
            { value: "bozza", label: "Bozza" },
          ]}
        />

        <div className="flex justify-end gap-2 border-t border-zinc-100 pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={saving}
          >
            Annulla
          </Button>
          <Button type="submit" loading={saving}>
            Crea regola
          </Button>
        </div>
      </form>
    </Modal>
  );
}
