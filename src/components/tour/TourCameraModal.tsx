"use client";

import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { TIPOLOGIA_CAMERA_OPTIONS } from "@/models/camera";
import type { CameraForm } from "@/types/camera";

type TourCameraModalProps = {
  open: boolean;
  mode: "create" | "edit";
  form: CameraForm;
  loading: boolean;
  error?: string;
  onClose: () => void;
  onFormChange: (form: CameraForm) => void;
  onSubmit: (event: React.FormEvent) => void;
};

export function TourCameraModal({
  open,
  mode,
  form,
  loading,
  error,
  onClose,
  onFormChange,
  onSubmit,
}: TourCameraModalProps) {
  const updateField = <K extends keyof CameraForm>(
    field: K,
    value: CameraForm[K],
  ) => {
    onFormChange({ ...form, [field]: value });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={mode === "create" ? "Nuova camera" : "Modifica camera"}
    >
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <Input
          label="Numero camera"
          name="numero"
          value={form.numero}
          onChange={(event) => updateField("numero", event.target.value)}
          placeholder="es. 101"
          disabled={loading}
          required
        />

        <Select
          label="Tipologia"
          name="tipologia"
          value={form.tipologia}
          options={TIPOLOGIA_CAMERA_OPTIONS}
          disabled={loading}
          onChange={(event) =>
            updateField(
              "tipologia",
              event.target.value as CameraForm["tipologia"],
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
            placeholder="Note operative sulla camera..."
            className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none transition-colors duration-200 focus:border-zinc-400 focus:ring-2 focus:ring-zinc-100 disabled:bg-zinc-50"
          />
        </div>

        {error && <p className="text-xs text-red-500">{error}</p>}

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>
            Annulla
          </Button>
          <Button type="submit" loading={loading} disabled={!form.numero.trim()}>
            Salva
          </Button>
        </div>
      </form>
    </Modal>
  );
}
