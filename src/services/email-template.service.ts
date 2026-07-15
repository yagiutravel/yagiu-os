import { getSupabaseClient } from "@/config/supabase";
import { isDevMissingTableNoOp } from "@/lib/supabase/missing-table";
import { mapEmailTemplateRowToTemplate } from "@/mappers/email-template.mapper";
import { duplicateEmailTemplate } from "@/models/email-template";
import type {
  EmailTemplate,
  EmailTemplateCategoria,
  EmailTemplateForm,
} from "@/types/email-template";

export class EmailTemplateServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "EmailTemplateServiceError";
  }
}

const TABLE = "email_templates";

function handleSupabaseError(
  operation: string,
  error: { message: string; code?: string },
): never {
  throw new EmailTemplateServiceError(
    `[${operation}] ${error.message}${error.code ? ` (${error.code})` : ""}`,
  );
}

export async function getEmailTemplates(): Promise<EmailTemplate[]> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .order("aggiornato_il", { ascending: false });

  if (error) {
    if (
      isDevMissingTableNoOp("email-template", TABLE, "getEmailTemplates", error)
    ) {
      return [];
    }
    handleSupabaseError("getEmailTemplates", error);
  }

  return (data ?? []).map((row) => mapEmailTemplateRowToTemplate(row));
}

export async function getEmailTemplate(id: string): Promise<EmailTemplate | null> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    if (
      isDevMissingTableNoOp("email-template", TABLE, "getEmailTemplate", error)
    ) {
      return null;
    }
    handleSupabaseError("getEmailTemplate", error);
  }

  if (!data) {
    return null;
  }

  return mapEmailTemplateRowToTemplate(data);
}

export async function createEmailTemplate(
  input: EmailTemplateForm,
): Promise<EmailTemplate> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from(TABLE)
    .insert({
      titolo: input.titolo.trim(),
      oggetto: input.oggetto.trim(),
      corpo_html: input.corpoHtml.trim(),
      categoria: input.categoria,
    })
    .select("*")
    .single();

  if (error) {
    handleSupabaseError("createEmailTemplate", error);
  }

  return mapEmailTemplateRowToTemplate(data);
}

export async function updateEmailTemplate(
  id: string,
  input: EmailTemplateForm,
): Promise<EmailTemplate> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from(TABLE)
    .update({
      titolo: input.titolo.trim(),
      oggetto: input.oggetto.trim(),
      corpo_html: input.corpoHtml.trim(),
      categoria: input.categoria,
    })
    .eq("id", id)
    .select("*")
    .maybeSingle();

  if (error) {
    handleSupabaseError("updateEmailTemplate", error);
  }

  if (!data) {
    throw new EmailTemplateServiceError("Template non trovato.");
  }

  return mapEmailTemplateRowToTemplate(data);
}

export async function duplicateEmailTemplateById(
  id: string,
): Promise<EmailTemplate> {
  const template = await getEmailTemplate(id);
  if (!template) {
    throw new EmailTemplateServiceError("Template non trovato.");
  }

  const copy = duplicateEmailTemplate(template);
  return createEmailTemplate({
    titolo: copy.titolo,
    oggetto: copy.oggetto,
    corpoHtml: copy.corpoHtml,
    categoria: copy.categoria,
  });
}

export async function deleteEmailTemplate(id: string): Promise<void> {
  const existing = await getEmailTemplate(id);
  if (!existing) {
    throw new EmailTemplateServiceError("Template non trovato.");
  }

  const supabase = getSupabaseClient();

  const { error } = await supabase.from(TABLE).delete().eq("id", id);

  if (error) {
    handleSupabaseError("deleteEmailTemplate", error);
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
