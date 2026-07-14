import type {
  EmailTemplate,
  EmailTemplateCategoria,
  EmailTemplateForm,
} from "@/types/email-template";
import { duplicateEmailTemplate } from "@/models/email-template";
import {
  createEmailTemplateMock,
  deleteEmailTemplateMock,
  findEmailTemplateByIdMock,
  listEmailTemplatesMock,
  updateEmailTemplateMock,
} from "@/mock/email-templates";

export class EmailTemplateServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "EmailTemplateServiceError";
  }
}

export async function getEmailTemplates(): Promise<EmailTemplate[]> {
  return listEmailTemplatesMock();
}

export async function getEmailTemplate(id: string): Promise<EmailTemplate | null> {
  const template = findEmailTemplateByIdMock(id);
  return template ?? null;
}

export async function createEmailTemplate(
  input: EmailTemplateForm,
): Promise<EmailTemplate> {
  return createEmailTemplateMock(input);
}

export async function updateEmailTemplate(
  id: string,
  input: EmailTemplateForm,
): Promise<EmailTemplate> {
  const updated = updateEmailTemplateMock(id, input);
  if (!updated) {
    throw new EmailTemplateServiceError("Template non trovato.");
  }
  return updated;
}

export async function duplicateEmailTemplateById(
  id: string,
): Promise<EmailTemplate> {
  const template = findEmailTemplateByIdMock(id);
  if (!template) {
    throw new EmailTemplateServiceError("Template non trovato.");
  }

  const copy = duplicateEmailTemplate(template);
  return createEmailTemplateMock({
    titolo: copy.titolo,
    oggetto: copy.oggetto,
    corpoHtml: copy.corpoHtml,
    categoria: copy.categoria,
  });
}

export async function deleteEmailTemplate(id: string): Promise<void> {
  const deleted = deleteEmailTemplateMock(id);
  if (!deleted) {
    throw new EmailTemplateServiceError("Template non trovato.");
  }
}

export function filterEmailTemplates(
  templates: EmailTemplate[],
  search: string,
  categoria: EmailTemplateCategoria | "tutte",
): EmailTemplate[] {
  const query = search.trim().toLowerCase();

  return templates.filter((template) => {
    const matchesCategoria =
      categoria === "tutte" || template.categoria === categoria;

    if (!matchesCategoria) return false;
    if (!query) return true;

    return (
      template.titolo.toLowerCase().includes(query) ||
      template.oggetto.toLowerCase().includes(query) ||
      template.corpoHtml.toLowerCase().includes(query)
    );
  });
}
