"use client";

import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { TOUR_STATO_OPTIONS } from "@/lib/tour/constants";
import type { TourForm, TourFormErrors } from "@/types/tour";

type TourFormFieldsProps = {
  form: TourForm;
  errors: TourFormErrors;
  loading?: boolean;
  onFormChange: (form: TourForm) => void;
  onFieldChange: (field: keyof TourForm) => void;
};

export function TourFormFields({
  form,
  errors,
  loading = false,
  onFormChange,
  onFieldChange,
}: TourFormFieldsProps) {
  const updateField = <K extends keyof TourForm>(
    field: K,
    value: TourForm[K],
  ) => {
    onFormChange({ ...form, [field]: value });
    onFieldChange(field);
  };

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <Input
          label="Nome tour"
          name="nomeTour"
          value={form.nomeTour}
          onChange={(event) => updateField("nomeTour", event.target.value)}
          placeholder="Es. Tour del Giappone — Primavera 2027"
          error={errors.nomeTour}
          disabled={loading}
        />
      </div>

      <div className="sm:col-span-2">
        <Input
          label="Destinazione"
          name="destinazione"
          value={form.destinazione}
          onChange={(event) => updateField("destinazione", event.target.value)}
          placeholder="Es. Tokyo, Kyoto, Osaka"
          error={errors.destinazione}
          disabled={loading}
        />
      </div>

      <Input
        label="Data partenza"
        name="dataPartenza"
        type="date"
        value={form.dataPartenza}
        onChange={(event) => updateField("dataPartenza", event.target.value)}
        error={errors.dataPartenza}
        disabled={loading}
      />

      <Input
        label="Data ritorno"
        name="dataRitorno"
        type="date"
        value={form.dataRitorno}
        onChange={(event) => updateField("dataRitorno", event.target.value)}
        error={errors.dataRitorno}
        disabled={loading}
      />

      <Select
        label="Stato"
        name="stato"
        value={form.stato}
        onChange={(event) =>
          updateField("stato", event.target.value as TourForm["stato"])
        }
        options={TOUR_STATO_OPTIONS.filter((option) => option.value !== "Archiviato")}
        disabled={loading}
      />

      <Input
        label="Capienza massima"
        name="capienzaMassima"
        type="number"
        min={1}
        value={form.capienzaMassima}
        onChange={(event) => updateField("capienzaMassima", event.target.value)}
        placeholder="Es. 16"
        error={errors.capienzaMassima}
        disabled={loading}
      />

      <Input
        label="Tour leader"
        name="tourLeader"
        value={form.tourLeader}
        onChange={(event) => updateField("tourLeader", event.target.value)}
        placeholder="Es. Marco Bianchi"
        error={errors.tourLeader}
        disabled={loading}
      />

      <Input
        label="Prezzo"
        name="prezzo"
        value={form.prezzo}
        onChange={(event) => updateField("prezzo", event.target.value)}
        placeholder="Es. € 3.200"
        error={errors.prezzo}
        disabled={loading}
      />

      <div className="sm:col-span-2">
        <label className="mb-1.5 block text-sm font-medium text-zinc-700">
          Descrizione
        </label>
        <textarea
          name="descrizione"
          value={form.descrizione}
          onChange={(event) => updateField("descrizione", event.target.value)}
          rows={4}
          disabled={loading}
          placeholder="Descrizione del tour per il team e i clienti..."
          className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none transition-colors focus:border-zinc-400 focus:ring-2 focus:ring-zinc-100 disabled:bg-zinc-50"
        />
      </div>
    </div>
  );
}
