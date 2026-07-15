"use client";

import { useCallback, useEffect, useMemo, useState, startTransition } from "react";
import { FileText, Plus, SearchX } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { Spinner } from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/Toast";
import { EMPTY_EMAIL_TEMPLATE_FORM } from "@/lib/email-template/constants";
import {
  hasEmailTemplateFormErrors,
  validateEmailTemplateForm,
} from "@/models/email-template";
import {
  createEmailTemplate,
  deleteEmailTemplate,
  duplicateEmailTemplateById,
  filterEmailTemplates,
  getEmailTemplates,
  updateEmailTemplate,
} from "@/services/email-template.service";
import type {
  EmailTemplate,
  EmailTemplateCategoria,
  EmailTemplateForm,
  EmailTemplateFormErrors,
} from "@/types/email-template";
import { EmailTemplateCard } from "./EmailTemplateCard";
import { EmailTemplateEditor } from "./EmailTemplateEditor";
import { EmailTemplateToolbar } from "./EmailTemplateToolbar";
import { getErrorMessage } from "@/shared/utils/error";

type ViewMode =
  | { type: "list" }
  | { type: "editor"; mode: "create" | "edit"; templateId?: string };


export function EmailTemplateView() {
  const { showToast } = useToast();
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoria, setCategoria] = useState<EmailTemplateCategoria | "tutte">(
    "tutte",
  );
  const [viewMode, setViewMode] = useState<ViewMode>({ type: "list" });
  const [form, setForm] = useState<EmailTemplateForm>(EMPTY_EMAIL_TEMPLATE_FORM);
  const [formErrors, setFormErrors] = useState<EmailTemplateFormErrors>({});
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<EmailTemplate | null>(
    null,
  );

  const loadTemplates = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getEmailTemplates();
      setTemplates(data);
    } catch (error) {
      showToast(
        `Impossibile caricare i template. ${getErrorMessage(error)}`,
        "error",
      );
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    startTransition(() => {
      void loadTemplates();
    });
  }, [loadTemplates]);

  const filteredTemplates = useMemo(
    () => filterEmailTemplates(templates, search, categoria),
    [templates, search, categoria],
  );

  const handleCreate = () => {
    setForm(EMPTY_EMAIL_TEMPLATE_FORM);
    setFormErrors({});
    setViewMode({ type: "editor", mode: "create" });
  };

  const handleEdit = (template: EmailTemplate) => {
    setForm({
      titolo: template.titolo,
      oggetto: template.oggetto,
      corpoHtml: template.corpoHtml,
      categoria: template.categoria,
    });
    setFormErrors({});
    setViewMode({ type: "editor", mode: "edit", templateId: template.id });
  };

  const handleBack = () => {
    setViewMode({ type: "list" });
    setForm(EMPTY_EMAIL_TEMPLATE_FORM);
    setFormErrors({});
  };

  const handleDuplicate = async (template: EmailTemplate) => {
    try {
      await duplicateEmailTemplateById(template.id);
      showToast("Template duplicato.", "success");
      await loadTemplates();
    } catch (error) {
      showToast(
        `Impossibile duplicare il template. ${getErrorMessage(error)}`,
        "error",
      );
    }
  };

  const handleDeleteRequest = (template: EmailTemplate) => {
    setTemplateToDelete(template);
  };

  const handleDeleteConfirm = async () => {
    if (!templateToDelete) return;

    setDeleting(true);
    try {
      await deleteEmailTemplate(templateToDelete.id);
      showToast("Template eliminato.", "success");
      setTemplateToDelete(null);
      await loadTemplates();
    } catch (error) {
      showToast(
        `Impossibile eliminare il template. ${getErrorMessage(error)}`,
        "error",
      );
    } finally {
      setDeleting(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const errors = validateEmailTemplateForm(form);
    setFormErrors(errors);
    if (hasEmailTemplateFormErrors(errors)) return;

    setSaving(true);
    try {
      if (viewMode.type === "editor" && viewMode.mode === "edit" && viewMode.templateId) {
        await updateEmailTemplate(viewMode.templateId, form);
        showToast("Template aggiornato.", "success");
      } else {
        await createEmailTemplate(form);
        showToast("Template creato.", "success");
      }

      await loadTemplates();
      handleBack();
    } catch (error) {
      showToast(
        `Impossibile salvare il template. ${getErrorMessage(error)}`,
        "error",
      );
    } finally {
      setSaving(false);
    }
  };

  if (viewMode.type === "editor") {
    return (
      <EmailTemplateEditor
        mode={viewMode.mode}
        form={form}
        errors={formErrors}
        saving={saving}
        onBack={handleBack}
        onFormChange={setForm}
        onSubmit={handleSubmit}
      />
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-semibold text-zinc-900">
              Template email
            </h2>
            <p className="mt-1 text-sm text-zinc-500">
              Crea e gestisci template riutilizzabili con variabili dinamiche.
            </p>
          </div>
          <Button onClick={handleCreate}>
            <Plus className="h-4 w-4" />
            Nuovo template
          </Button>
        </div>

        <EmailTemplateToolbar
          search={search}
          categoria={categoria}
          resultCount={filteredTemplates.length}
          onSearchChange={setSearch}
          onCategoriaChange={setCategoria}
        />

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="flex items-center gap-3 text-sm text-zinc-500">
              <Spinner className="h-5 w-5" />
              Caricamento template...
            </div>
          </div>
        ) : filteredTemplates.length === 0 ? (
          <EmptyState
            icon={search || categoria !== "tutte" ? SearchX : FileText}
            title={
              search || categoria !== "tutte"
                ? "Nessun template trovato"
                : "Nessun template"
            }
            description={
              search || categoria !== "tutte"
                ? "Prova a modificare i filtri di ricerca."
                : "Crea il primo template email riutilizzabile."
            }
            actionLabel={search || categoria !== "tutte" ? undefined : "Nuovo template"}
            onAction={
              search || categoria !== "tutte" ? undefined : handleCreate
            }
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {filteredTemplates.map((template) => (
              <EmailTemplateCard
                key={template.id}
                template={template}
                onEdit={handleEdit}
                onDuplicate={handleDuplicate}
                onDelete={handleDeleteRequest}
                disabled={saving || deleting}
              />
            ))}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={templateToDelete !== null}
        title="Elimina template"
        description={
          templateToDelete
            ? `Eliminare il template "${templateToDelete.titolo}"? L'azione non può essere annullata.`
            : ""
        }
        confirmLabel="Elimina"
        loading={deleting}
        onConfirm={handleDeleteConfirm}
        onClose={() => !deleting && setTemplateToDelete(null)}
      />
    </>
  );
}
