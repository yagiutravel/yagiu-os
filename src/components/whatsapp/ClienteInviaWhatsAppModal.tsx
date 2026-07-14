"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import {
  EMPTY_INVIA_WHATSAPP_FORM,
  WHATSAPP_EMOJI,
  WHATSAPP_PREVIEW_VALUES,
  WHATSAPP_VARIABILI,
  hasInviaWhatsAppFormErrors,
  sostituisciVariabiliWhatsApp,
  validateInviaWhatsAppForm,
  variabileToken,
} from "@/models/whatsapp";
import {
  getWhatsAppTemplates,
  inviaWhatsAppSimulato,
} from "@/services/whatsapp.service";
import { getErrorMessage } from "@/shared/utils/error";
import type { WhatsAppTemplate } from "@/types/whatsapp";
import type {
  InviaWhatsAppForm,
  InviaWhatsAppFormErrors,
} from "@/types/whatsapp";

type ClienteInviaWhatsAppModalProps = {
  open: boolean;
  clienteId: string;
  clienteNome: string;
  numeroDefault: string;
  onClose: () => void;
  onSent: () => void;
};


export function ClienteInviaWhatsAppModal({
  open,
  clienteId,
  clienteNome,
  numeroDefault,
  onClose,
  onSent,
}: ClienteInviaWhatsAppModalProps) {
  const [form, setForm] = useState<InviaWhatsAppForm>(EMPTY_INVIA_WHATSAPP_FORM);
  const [errors, setErrors] = useState<InviaWhatsAppFormErrors>({});
  const [templates, setTemplates] = useState<WhatsAppTemplate[]>([]);
  const [sending, setSending] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const previewValues = useMemo(
    () => ({
      ...WHATSAPP_PREVIEW_VALUES,
      nome: clienteNome,
    }),
    [clienteNome],
  );

  useEffect(() => {
    if (!open) return;
    setForm(EMPTY_INVIA_WHATSAPP_FORM);
    setErrors({});
    void getWhatsAppTemplates().then(setTemplates);
  }, [open]);

  const handleTemplateChange = (templateId: string) => {
    const template = templates.find((item) => item.id === templateId);
    if (!template) {
      setForm((prev) => ({ ...prev, templateId: "", messaggio: "" }));
      return;
    }
    setForm((prev) => ({
      ...prev,
      templateId,
      messaggio: sostituisciVariabiliWhatsApp(template.messaggio, previewValues),
    }));
  };

  const insertAtCursor = (text: string) => {
    const textarea = textareaRef.current;
    if (!textarea) {
      setForm((prev) => ({ ...prev, messaggio: `${prev.messaggio}${text}` }));
      return;
    }
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const next =
      form.messaggio.slice(0, start) + text + form.messaggio.slice(end);
    setForm((prev) => ({ ...prev, messaggio: next }));
    requestAnimationFrame(() => {
      textarea.focus();
      const cursor = start + text.length;
      textarea.setSelectionRange(cursor, cursor);
    });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const validationErrors = validateInviaWhatsAppForm(form);
    setErrors(validationErrors);
    if (hasInviaWhatsAppFormErrors(validationErrors)) return;

    if (!numeroDefault.trim()) {
      setErrors({ numero: "Numero WhatsApp non disponibile per questo cliente." });
      return;
    }

    setSending(true);
    try {
      await inviaWhatsAppSimulato({
        clienteId,
        clienteNome,
        numero: numeroDefault,
        messaggio: form.messaggio.trim(),
        templateId: form.templateId || null,
        utente: "Martin Marangella",
      });
      onSent();
      onClose();
    } catch (error) {
      setErrors({ messaggio: `Invio fallito. ${getErrorMessage(error)}` });
    } finally {
      setSending(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Invia WhatsApp" size="large">
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div className="rounded-lg bg-zinc-50 px-4 py-3">
          <p className="text-xs text-zinc-500">Destinatario</p>
          <p className="mt-0.5 text-sm font-medium text-zinc-900">
            {clienteNome}
          </p>
          <p className="text-sm text-zinc-600">{numeroDefault || "—"}</p>
          {errors.numero && (
            <p className="mt-1 text-xs text-red-600">{errors.numero}</p>
          )}
        </div>

        <Select
          label="Template"
          name="templateId"
          value={form.templateId}
          onChange={(event) => handleTemplateChange(event.target.value)}
          disabled={sending}
          options={[
            { value: "", label: "Nessun template" },
            ...templates.map((t) => ({ value: t.id, label: t.titolo })),
          ]}
        />

        <div>
          <label
            htmlFor="messaggioWa"
            className="mb-1.5 block text-xs font-medium text-zinc-700"
          >
            Messaggio
          </label>
          <textarea
            ref={textareaRef}
            id="messaggioWa"
            value={form.messaggio}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, messaggio: event.target.value }))
            }
            rows={6}
            disabled={sending}
            placeholder="Scrivi il messaggio WhatsApp..."
            className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition-colors focus:border-zinc-400 focus:ring-2 focus:ring-zinc-100"
          />
          {errors.messaggio && (
            <p className="mt-1.5 text-xs text-red-600">{errors.messaggio}</p>
          )}
        </div>

        <div>
          <p className="text-xs font-medium text-zinc-500">Emoji</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {WHATSAPP_EMOJI.map((emoji) => (
              <button
                key={emoji}
                type="button"
                disabled={sending}
                onClick={() => insertAtCursor(emoji)}
                className="flex h-8 w-8 items-center justify-center rounded-md bg-zinc-50 text-lg transition-colors hover:bg-zinc-100"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-medium text-zinc-500">Variabili</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {WHATSAPP_VARIABILI.map((variabile) => (
              <button
                key={variabile}
                type="button"
                disabled={sending}
                onClick={() => insertAtCursor(variabileToken(variabile))}
                className="rounded-md bg-zinc-100 px-2.5 py-1 font-mono text-xs text-zinc-700 ring-1 ring-inset ring-zinc-200 hover:bg-zinc-200"
              >
                {variabileToken(variabile)}
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-zinc-100 pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={sending}
          >
            Annulla
          </Button>
          <Button type="submit" loading={sending}>
            Invia
          </Button>
        </div>
      </form>
    </Modal>
  );
}
