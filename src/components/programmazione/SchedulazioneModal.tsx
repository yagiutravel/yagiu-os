"use client";

import { startTransition, useEffect, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import {
  EMPTY_SCHEDULAZIONE_FORM,
  hasSchedulazioneFormErrors,
  validateSchedulazioneForm,
} from "@/models/schedulazione";
import {
  createSchedulazione,
  getSchedulazioneClienti,
  getSchedulazioneTours,
} from "@/services/schedulazione.service";
import { getErrorMessage } from "@/shared/utils/error";
import type {
  SchedulazioneForm,
  SchedulazioneFormErrors,
  SchedulazioneStato,
  SchedulazioneTipo,
} from "@/types/schedulazione";

type SchedulazioneModalProps = {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
};


export function SchedulazioneModal({
  open,
  onClose,
  onCreated,
}: SchedulazioneModalProps) {
  const [form, setForm] = useState<SchedulazioneForm>(EMPTY_SCHEDULAZIONE_FORM);
  const [errors, setErrors] = useState<SchedulazioneFormErrors>({});
  const [saving, setSaving] = useState(false);
  const [clienti, setClienti] = useState<Array<{ id: string; nome: string }>>(
    [],
  );
  const [tours, setTours] = useState<Array<{ id: string; nome: string }>>([]);

  useEffect(() => {
    if (!open) return;
    startTransition(() => {
      setForm(EMPTY_SCHEDULAZIONE_FORM);
      setErrors({});
      void Promise.all([getSchedulazioneClienti(), getSchedulazioneTours()]).then(
        ([c, t]) => {
          setClienti(c);
          setTours(t);
        },
      );
    });
  }, [open]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const validationErrors = validateSchedulazioneForm(form);
    setErrors(validationErrors);
    if (hasSchedulazioneFormErrors(validationErrors)) return;

    const cliente = clienti.find((c) => c.id === form.clienteId);
    const tour = tours.find((t) => t.id === form.tourId);

    setSaving(true);
    try {
      await createSchedulazione({
        titolo: form.titolo.trim(),
        clienteId: form.clienteId,
        clienteNome: cliente?.nome ?? "Cliente",
        tourId: form.tourId || null,
        tourNome: tour?.nome ?? null,
        tipo: form.tipo,
        data: form.data,
        ora: form.ora,
        stato: form.stato,
      });
      onCreated();
      onClose();
    } catch (error) {
      setErrors({ titolo: `Salvataggio fallito. ${getErrorMessage(error)}` });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Nuova programmazione" size="large">
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <Input
          label="Titolo"
          name="titolo"
          value={form.titolo}
          onChange={(e) => setForm((p) => ({ ...p, titolo: e.target.value }))}
          placeholder="Es. Conferma prenotazione"
          error={errors.titolo}
          disabled={saving}
        />

        <Select
          label="Cliente"
          name="clienteId"
          value={form.clienteId}
          onChange={(e) =>
            setForm((p) => ({ ...p, clienteId: e.target.value }))
          }
          disabled={saving}
          options={[
            { value: "", label: "Seleziona cliente" },
            ...clienti.map((c) => ({ value: c.id, label: c.nome })),
          ]}
        />
        {errors.clienteId && (
          <p className="-mt-2 text-xs text-red-600">{errors.clienteId}</p>
        )}

        <Select
          label="Tour (opzionale)"
          name="tourId"
          value={form.tourId}
          onChange={(e) => setForm((p) => ({ ...p, tourId: e.target.value }))}
          disabled={saving}
          options={[
            { value: "", label: "Nessun tour" },
            ...tours.map((t) => ({ value: t.id, label: t.nome })),
          ]}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <Select
            label="Tipo"
            name="tipo"
            value={form.tipo}
            onChange={(e) =>
              setForm((p) => ({
                ...p,
                tipo: e.target.value as SchedulazioneTipo,
              }))
            }
            disabled={saving}
            options={[
              { value: "email", label: "Email" },
              { value: "whatsapp", label: "WhatsApp" },
              { value: "reminder", label: "Reminder" },
            ]}
          />
          <Select
            label="Stato"
            name="stato"
            value={form.stato}
            onChange={(e) =>
              setForm((p) => ({
                ...p,
                stato: e.target.value as SchedulazioneStato,
              }))
            }
            disabled={saving}
            options={[
              { value: "programmata", label: "Programmata" },
              { value: "bozza", label: "Bozza" },
            ]}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Data"
            name="data"
            type="date"
            value={form.data}
            onChange={(e) => setForm((p) => ({ ...p, data: e.target.value }))}
            error={errors.data}
            disabled={saving}
          />
          <Input
            label="Ora"
            name="ora"
            type="time"
            value={form.ora}
            onChange={(e) => setForm((p) => ({ ...p, ora: e.target.value }))}
            error={errors.ora}
            disabled={saving}
          />
        </div>

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
            Programma
          </Button>
        </div>
      </form>
    </Modal>
  );
}
