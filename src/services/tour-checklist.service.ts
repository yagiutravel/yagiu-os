import { getSupabaseClient } from "@/config/supabase";
import { getOrganizationId } from "@/config/organization";
import {
  DEFAULT_CHECKLIST_TEMPLATES,
  mapChecklistCompletionRowToCompletion,
  mapChecklistTemplateRowToTemplate,
  mapCreateChecklistTemplateToInsert,
  mapUpdateChecklistTemplateToUpdate,
} from "@/mappers/tour-checklist.mapper";
import { recordTourTimelineEvent } from "@/services/tour-timeline.service";
import { getPartecipazioniByTourId } from "@/services/tour-partecipazione.service";
import type {
  TourChecklistCompletionRow,
  TourChecklistTemplateRow,
} from "@/types/database";
import type {
  CreateChecklistTemplateInput,
  TourChecklistData,
  TourChecklistParticipantView,
  UpdateChecklistCompletionInput,
  UpdateChecklistTemplateInput,
} from "@/types/tour-checklist";

export class TourChecklistServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TourChecklistServiceError";
  }
}

const TEMPLATES_TABLE = "tour_checklist_templates";
const COMPLETIONS_TABLE = "tour_checklist_completions";

function handleSupabaseError(operation: string, error: { message: string; code?: string }) {
  throw new TourChecklistServiceError(
    `[${operation}] ${error.message}${error.code ? ` (${error.code})` : ""}`,
  );
}

export async function seedDefaultChecklistTemplates(tourId: string): Promise<void> {
  const organizationId = await getOrganizationId();
  const supabase = getSupabaseClient();

  const { count, error: countError } = await supabase
    .from(TEMPLATES_TABLE)
    .select("id", { count: "exact", head: true })
    .eq("tour_id", tourId);

  if (countError) handleSupabaseError("seedDefaultChecklistTemplatesCount", countError);
  if ((count ?? 0) > 0) return;

  const { error } = await supabase.from(TEMPLATES_TABLE).insert(
    DEFAULT_CHECKLIST_TEMPLATES.map((template) => ({
      organization_id: organizationId,
      tour_id: tourId,
      codice: template.codice,
      etichetta: template.etichetta,
      descrizione: template.descrizione,
      ordine: template.ordine,
      obbligatorio: template.obbligatorio,
    })),
  );

  if (error) handleSupabaseError("seedDefaultChecklistTemplates", error);
}

async function fetchTemplates(tourId: string) {
  const organizationId = await getOrganizationId();
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from(TEMPLATES_TABLE)
    .select("*")
    .eq("organization_id", organizationId)
    .eq("tour_id", tourId)
    .order("ordine", { ascending: true });

  if (error) handleSupabaseError("fetchTemplates", error);

  return ((data ?? []) as TourChecklistTemplateRow[]).map(
    mapChecklistTemplateRowToTemplate,
  );
}

async function fetchCompletions(tourId: string) {
  const organizationId = await getOrganizationId();
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from(COMPLETIONS_TABLE)
    .select("*")
    .eq("organization_id", organizationId)
    .eq("tour_id", tourId);

  if (error) handleSupabaseError("fetchCompletions", error);

  return ((data ?? []) as TourChecklistCompletionRow[]).map(
    mapChecklistCompletionRowToCompletion,
  );
}

export async function getChecklistByTourId(tourId: string): Promise<TourChecklistData> {
  await seedDefaultChecklistTemplates(tourId);

  const [templates, completions, partecipazioni] = await Promise.all([
    fetchTemplates(tourId),
    fetchCompletions(tourId),
    getPartecipazioniByTourId(tourId),
  ]);

  const completionMap = new Map(
    completions.map((item) => [`${item.templateId}:${item.participantId}`, item]),
  );

  const partecipanti: TourChecklistParticipantView[] = partecipazioni
    .filter((item) => item.statoIscrizione === "Iscritto")
    .map((partecipazione) => {
      const items = templates.map((template) => ({
        template,
        completion:
          completionMap.get(`${template.id}:${partecipazione.id}`) ?? null,
      }));

      const completati = items.filter((item) => item.completion?.completato).length;

      return {
        participantId: partecipazione.id,
        clienteNome: partecipazione.clienteNome,
        items,
        completati,
        totali: items.length,
      };
    })
    .sort((a, b) => a.clienteNome.localeCompare(b.clienteNome, "it"));

  return { templates, partecipanti };
}

export async function createChecklistTemplate(
  input: CreateChecklistTemplateInput,
) {
  const organizationId = await getOrganizationId();
  const supabase = getSupabaseClient();

  const codice = input.codice.trim();
  const etichetta = input.etichetta.trim();

  if (!codice || !etichetta) {
    throw new TourChecklistServiceError("Codice ed etichetta sono obbligatori.");
  }

  const { data, error } = await supabase
    .from(TEMPLATES_TABLE)
    .insert(mapCreateChecklistTemplateToInsert(input, organizationId))
    .select("*")
    .single();

  if (error) handleSupabaseError("createChecklistTemplate", error);

  return mapChecklistTemplateRowToTemplate(data as TourChecklistTemplateRow);
}

export async function updateChecklistTemplate(
  id: string,
  input: UpdateChecklistTemplateInput,
) {
  const organizationId = await getOrganizationId();
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from(TEMPLATES_TABLE)
    .update(mapUpdateChecklistTemplateToUpdate(input))
    .eq("id", id)
    .eq("organization_id", organizationId)
    .select("*")
    .single();

  if (error) handleSupabaseError("updateChecklistTemplate", error);

  return mapChecklistTemplateRowToTemplate(data as TourChecklistTemplateRow);
}

export async function deleteChecklistTemplate(id: string, tourId: string) {
  const organizationId = await getOrganizationId();
  const supabase = getSupabaseClient();

  const { error } = await supabase
    .from(TEMPLATES_TABLE)
    .delete()
    .eq("id", id)
    .eq("organization_id", organizationId)
    .eq("tour_id", tourId);

  if (error) handleSupabaseError("deleteChecklistTemplate", error);
}

export async function setChecklistCompletion(
  input: UpdateChecklistCompletionInput,
): Promise<TourChecklistData> {
  const organizationId = await getOrganizationId();
  const supabase = getSupabaseClient();

  const completatoIl = input.completato ? new Date().toISOString() : null;

  const { data: existing, error: fetchError } = await supabase
    .from(COMPLETIONS_TABLE)
    .select("id")
    .eq("template_id", input.templateId)
    .eq("participant_id", input.participantId)
    .maybeSingle();

  if (fetchError) handleSupabaseError("setChecklistCompletionFetch", fetchError);

  if (existing) {
    const { error } = await supabase
      .from(COMPLETIONS_TABLE)
      .update({
        completato: input.completato,
        completato_il: completatoIl,
        note: input.note?.trim() ?? "",
      })
      .eq("id", existing.id);

    if (error) handleSupabaseError("setChecklistCompletionUpdate", error);
  } else {
    const { error } = await supabase.from(COMPLETIONS_TABLE).insert({
      organization_id: organizationId,
      tour_id: input.tourId,
      template_id: input.templateId,
      participant_id: input.participantId,
      completato: input.completato,
      completato_il: completatoIl,
      note: input.note?.trim() ?? "",
    });

    if (error) handleSupabaseError("setChecklistCompletionInsert", error);
  }

  if (input.completato) {
    await recordTourTimelineEvent({
      tourId: input.tourId,
      tipo: "nota_interna",
      titolo: "Voce checklist completata",
      descrizione: "Aggiornamento checklist operativa pre-partenza.",
    });
  }

  return getChecklistByTourId(input.tourId);
}

export async function countLiberatorieMancanti(
  tourIds: string[],
  partecipazioniByTour: Map<
    string,
    Array<{ id: string; statoIscrizione: string }>
  >,
): Promise<number> {
  if (tourIds.length === 0) return 0;

  const organizationId = await getOrganizationId();
  const supabase = getSupabaseClient();

  const { data: templates, error: templatesError } = await supabase
    .from(TEMPLATES_TABLE)
    .select("id, tour_id")
    .eq("organization_id", organizationId)
    .in("tour_id", tourIds)
    .eq("codice", "contratto");

  if (templatesError) handleSupabaseError("countLiberatorieTemplates", templatesError);

  const templateByTourId = new Map(
    (templates ?? []).map((row) => [row.tour_id as string, row.id as string]),
  );

  const { data: completions, error: completionsError } = await supabase
    .from(COMPLETIONS_TABLE)
    .select("tour_id, template_id, participant_id, completato")
    .eq("organization_id", organizationId)
    .in("tour_id", tourIds)
    .eq("completato", true);

  if (completionsError) {
    handleSupabaseError("countLiberatorieCompletions", completionsError);
  }

  const completedKeys = new Set(
    (completions ?? []).map(
      (row) =>
        `${row.tour_id as string}:${row.template_id as string}:${row.participant_id as string}`,
    ),
  );

  let mancanti = 0;

  for (const tourId of tourIds) {
    const templateId = templateByTourId.get(tourId);
    if (!templateId) continue;

    const iscritti = (partecipazioniByTour.get(tourId) ?? []).filter(
      (item) => item.statoIscrizione === "Iscritto",
    );

    for (const partecipazione of iscritti) {
      const key = `${tourId}:${templateId}:${partecipazione.id}`;
      if (!completedKeys.has(key)) {
        mancanti += 1;
      }
    }
  }

  return mancanti;
}
