"use client";

import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import type { TourHotelForm } from "@/types/tour-hotel";

type TourHotelModalProps = {
  open: boolean;
  mode: "create" | "edit";
  form: TourHotelForm;
  loading: boolean;
  error?: string;
  onClose: () => void;
  onFormChange: (form: TourHotelForm) => void;
  onSubmit: (event: React.FormEvent) => void;
};

export function TourHotelModal({
  open,
  mode,
  form,
  loading,
  error,
  onClose,
  onFormChange,
  onSubmit,
}: TourHotelModalProps) {
  const updateField = <K extends keyof TourHotelForm>(
    field: K,
    value: TourHotelForm[K],
  ) => {
    onFormChange({ ...form, [field]: value });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={mode === "create" ? "Nuovo hotel" : "Modifica hotel"}
    >
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <Input
          label="Nome hotel"
          name="nome"
          value={form.nome}
          onChange={(event) => updateField("nome", event.target.value)}
          placeholder="es. Hotel Ryokan Kyoto"
          disabled={loading}
          required
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Città"
            name="citta"
            value={form.citta}
            onChange={(event) => updateField("citta", event.target.value)}
            disabled={loading}
          />
          <Input
            label="Paese"
            name="paese"
            value={form.paese}
            onChange={(event) => updateField("paese", event.target.value)}
            disabled={loading}
          />
        </div>

        <Input
          label="Indirizzo"
          name="indirizzo"
          value={form.indirizzo}
          onChange={(event) => updateField("indirizzo", event.target.value)}
          disabled={loading}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Check-in"
            name="checkIn"
            type="date"
            value={form.checkIn}
            onChange={(event) => updateField("checkIn", event.target.value)}
            disabled={loading}
          />
          <Input
            label="Check-out"
            name="checkOut"
            type="date"
            value={form.checkOut}
            onChange={(event) => updateField("checkOut", event.target.value)}
            disabled={loading}
          />
        </div>

        <Input
          label="Telefono"
          name="telefono"
          value={form.telefono}
          onChange={(event) => updateField("telefono", event.target.value)}
          disabled={loading}
        />

        <div className="space-y-1.5">
          <label htmlFor="hotel-note" className="block text-xs font-medium text-zinc-700">
            Note
          </label>
          <textarea
            id="hotel-note"
            name="note"
            value={form.note}
            onChange={(event) => updateField("note", event.target.value)}
            disabled={loading}
            rows={3}
            className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none transition-colors duration-200 focus:border-zinc-400 focus:ring-2 focus:ring-zinc-100 disabled:bg-zinc-50"
          />
        </div>

        {error && <p className="text-xs text-red-500">{error}</p>}

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>
            Annulla
          </Button>
          <Button type="submit" loading={loading} disabled={!form.nome.trim()}>
            Salva
          </Button>
        </div>
      </form>
    </Modal>
  );
}
