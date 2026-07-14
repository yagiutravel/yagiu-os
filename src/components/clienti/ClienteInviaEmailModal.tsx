"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Paperclip, X } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import {
  EMPTY_INVIA_EMAIL_FORM,
  MOCK_ALLEGATI_DISPONIBILI,
  hasInviaEmailFormErrors,
  htmlToPlainText,
  validateInviaEmailForm,
} from "@/models/email-invio";
import {
  EMAIL_TEMPLATE_PREVIEW_VALUES,
  sostituisciVariabili,
} from "@/models/email-template";
import { getEmailTemplates } from "@/services/email-template.service";
import { inviaEmailSimulata } from "@/services/email-invio.service";
import type { EmailTemplate } from "@/types/email-template";
import type { InviaEmailForm, InviaEmailFormErrors } from "@/types/email-invio";
import { getErrorMessage } from "@/shared/utils/error";

type ClienteInviaEmailModalProps = {
  open: boolean;
  clienteId: string;
  clienteNome: string;
  destinatarioDefault: string;
  onClose: () => void;
  onSent: () => void;
};


export function ClienteInviaEmailModal({
  open,
  clienteId,
  clienteNome,
  destinatarioDefault,
  onClose,
  onSent,
}: ClienteInviaEmailModalProps) {
  const [form, setForm] = useState<InviaEmailForm>(EMPTY_INVIA_EMAIL_FORM);
  const [errors, setErrors] = useState<InviaEmailFormErrors>({});
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [sending, setSending] = useState(false);

  const previewValues = useMemo(
    () => ({
      ...EMAIL_TEMPLATE_PREVIEW_VALUES,
      nome: clienteNome,
    }),
    [clienteNome],
  );

  const loadTemplates = useCallback(async () => {
    setLoadingTemplates(true);
    try {
      const data = await getEmailTemplates();
      setTemplates(data);
    } finally {
      setLoadingTemplates(false);
    }
  }, []);

  useEffect(() => {
    if (!open) return;

    setForm({
      ...EMPTY_INVIA_EMAIL_FORM,
      destinatario: destinatarioDefault,
    });
    setErrors({});
    void loadTemplates();
  }, [open, destinatarioDefault, loadTemplates]);

  const handleTemplateChange = (templateId: string) => {
    const template = templates.find((item) => item.id === templateId);

    if (!template) {
      setForm((prev) => ({ ...prev, templateId: "", oggetto: "", messaggio: "" }));
      return;
    }

    setForm((prev) => ({
      ...prev,
      templateId,
      oggetto: sostituisciVariabili(template.oggetto, previewValues),
      messaggio: htmlToPlainText(
        sostituisciVariabili(template.corpoHtml, previewValues),
      ),
    }));
  };

  const toggleAllegato = (nome: string) => {
    setForm((prev) => ({
      ...prev,
      allegati: prev.allegati.includes(nome)
        ? prev.allegati.filter((item) => item !== nome)
        : [...prev.allegati, nome],
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const validationErrors = validateInviaEmailForm(form);
    setErrors(validationErrors);
    if (hasInviaEmailFormErrors(validationErrors)) return;

    setSending(true);
    try {
      await inviaEmailSimulata({
        clienteId,
        clienteNome,
        destinatario: form.destinatario.trim(),
        oggetto: form.oggetto.trim(),
        messaggio: form.messaggio.trim(),
        templateId: form.templateId || null,
        allegati: form.allegati,
        utente: "Martin Marangella",
      });
      onSent();
      onClose();
    } catch (error) {
      setErrors({
        messaggio: `Invio fallito. ${getErrorMessage(error)}`,
      });
    } finally {
      setSending(false);
    }
  };

  const templateOptions = [
    { value: "", label: "Nessun template" },
    ...templates.map((template) => ({
      value: template.id,
      label: template.titolo,
    })),
  ];

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Invia Email"
      size="large"
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <Input
          label="Destinatario"
          name="destinatario"
          type="email"
          value={form.destinatario}
          onChange={(event) =>
            setForm((prev) => ({ ...prev, destinatario: event.target.value }))
          }
          placeholder="nome@email.com"
          error={errors.destinatario}
          disabled={sending}
        />

        <Select
          label="Template"
          name="templateId"
          value={form.templateId}
          onChange={(event) => handleTemplateChange(event.target.value)}
          options={templateOptions}
          disabled={sending || loadingTemplates}
        />

        <Input
          label="Oggetto"
          name="oggetto"
          value={form.oggetto}
          onChange={(event) =>
            setForm((prev) => ({ ...prev, oggetto: event.target.value }))
          }
          placeholder="Oggetto dell'email"
          error={errors.oggetto}
          disabled={sending}
        />

        <div>
          <label
            htmlFor="messaggio"
            className="mb-1.5 block text-xs font-medium text-zinc-700"
          >
            Messaggio
          </label>
          <textarea
            id="messaggio"
            name="messaggio"
            value={form.messaggio}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, messaggio: event.target.value }))
            }
            rows={10}
            disabled={sending}
            placeholder="Scrivi il messaggio..."
            className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition-colors focus:border-zinc-400 focus:ring-2 focus:ring-zinc-100 disabled:bg-zinc-50"
          />
          {errors.messaggio && (
            <p className="mt-1.5 text-xs text-red-600">{errors.messaggio}</p>
          )}
        </div>

        <div>
          <p className="mb-2 text-xs font-medium text-zinc-700">Allegati (mock)</p>
          <div className="flex flex-wrap gap-2">
            {MOCK_ALLEGATI_DISPONIBILI.map((allegato) => {
              const selected = form.allegati.includes(allegato.nome);
              return (
                <button
                  key={allegato.id}
                  type="button"
                  disabled={sending}
                  onClick={() => toggleAllegato(allegato.nome)}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                    selected
                      ? "bg-sky-50 text-sky-800 ring-1 ring-inset ring-sky-600/20"
                      : "bg-zinc-50 text-zinc-600 ring-1 ring-inset ring-zinc-200 hover:bg-zinc-100"
                  }`}
                >
                  <Paperclip className="h-3 w-3" strokeWidth={1.75} />
                  {allegato.nome}
                  <span className="text-zinc-400">({allegato.dimensione})</span>
                </button>
              );
            })}
          </div>
          {form.allegati.length > 0 && (
            <ul className="mt-3 space-y-1">
              {form.allegati.map((nome) => (
                <li
                  key={nome}
                  className="flex items-center justify-between rounded-md bg-zinc-50 px-3 py-1.5 text-xs text-zinc-600"
                >
                  <span>{nome}</span>
                  <button
                    type="button"
                    onClick={() => toggleAllegato(nome)}
                    className="text-zinc-400 hover:text-zinc-700"
                    aria-label={`Rimuovi ${nome}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </li>
              ))}
            </ul>
          )}
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
