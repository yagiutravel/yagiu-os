"use client";

import { useRef } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { EMAIL_TEMPLATE_CATEGORIE } from "@/lib/email-template/constants";
import type {
  EmailTemplateForm,
  EmailTemplateFormErrors,
} from "@/types/email-template";
import { EmailTemplatePreview } from "./EmailTemplatePreview";
import { EmailTemplateVariabiliChips } from "./EmailTemplateVariabiliChips";

type EmailTemplateEditorProps = {
  mode: "create" | "edit";
  form: EmailTemplateForm;
  errors: EmailTemplateFormErrors;
  saving: boolean;
  onBack: () => void;
  onFormChange: (form: EmailTemplateForm) => void;
  onSubmit: (event: React.FormEvent) => void;
};

export function EmailTemplateEditor({
  mode,
  form,
  errors,
  saving,
  onBack,
  onFormChange,
  onSubmit,
}: EmailTemplateEditorProps) {
  const corpoRef = useRef<HTMLTextAreaElement>(null);

  const updateField = <K extends keyof EmailTemplateForm>(
    field: K,
    value: EmailTemplateForm[K],
  ) => {
    onFormChange({ ...form, [field]: value });
  };

  const insertVariable = (token: string) => {
    const textarea = corpoRef.current;
    if (!textarea) {
      updateField("corpoHtml", `${form.corpoHtml}${token}`);
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const nextValue =
      form.corpoHtml.slice(0, start) + token + form.corpoHtml.slice(end);

    updateField("corpoHtml", nextValue);

    requestAnimationFrame(() => {
      textarea.focus();
      const cursor = start + token.length;
      textarea.setSelectionRange(cursor, cursor);
    });
  };

  const categoriaOptions = EMAIL_TEMPLATE_CATEGORIE.filter(
    (item) => item.value !== "tutte",
  );

  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-2 text-sm text-zinc-500 transition-colors hover:text-zinc-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Torna ai template
      </button>

      <form onSubmit={onSubmit} className="space-y-6" noValidate>
        <div className="grid gap-6 xl:grid-cols-2">
          <div className="space-y-4 rounded-xl border border-zinc-200/70 bg-white p-5">
            <h2 className="text-sm font-semibold text-zinc-900">
              {mode === "create" ? "Nuovo template" : "Modifica template"}
            </h2>

            <Input
              label="Titolo"
              name="titolo"
              value={form.titolo}
              onChange={(event) => updateField("titolo", event.target.value)}
              placeholder="Es. Conferma prenotazione"
              error={errors.titolo}
              disabled={saving}
            />

            <Select
              label="Categoria"
              name="categoria"
              value={form.categoria}
              onChange={(event) =>
                updateField(
                  "categoria",
                  event.target.value as EmailTemplateForm["categoria"],
                )
              }
              disabled={saving}
              options={categoriaOptions.map((option) => ({
                value: option.value,
                label: option.label,
              }))}
            />

            <Input
              label="Oggetto"
              name="oggetto"
              value={form.oggetto}
              onChange={(event) => updateField("oggetto", event.target.value)}
              placeholder="Es. Conferma prenotazione — {{tour}}"
              error={errors.oggetto}
              disabled={saving}
            />

            <EmailTemplateVariabiliChips
              onInsert={insertVariable}
              disabled={saving}
            />

            <div>
              <label
                htmlFor="corpoHtml"
                className="mb-1.5 block text-sm font-medium text-zinc-700"
              >
                Corpo HTML
              </label>
              <textarea
                ref={corpoRef}
                id="corpoHtml"
                name="corpoHtml"
                value={form.corpoHtml}
                onChange={(event) => updateField("corpoHtml", event.target.value)}
                rows={12}
                disabled={saving}
                placeholder="<p>Gentile {{nome}}, ...</p>"
                className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 font-mono text-sm text-zinc-900 outline-none transition-colors focus:border-zinc-400 focus:ring-2 focus:ring-zinc-100 disabled:bg-zinc-50"
              />
              {errors.corpoHtml && (
                <p className="mt-1.5 text-xs text-red-600">{errors.corpoHtml}</p>
              )}
            </div>

            <div className="flex justify-end gap-2 border-t border-zinc-100 pt-4">
              <Button
                type="button"
                variant="secondary"
                onClick={onBack}
                disabled={saving}
              >
                Annulla
              </Button>
              <Button type="submit" loading={saving}>
                {mode === "create" ? "Crea template" : "Salva modifiche"}
              </Button>
            </div>
          </div>

          <EmailTemplatePreview
            oggetto={form.oggetto}
            corpoHtml={form.corpoHtml}
          />
        </div>
      </form>
    </div>
  );
}
