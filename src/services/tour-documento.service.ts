import { getSupabaseClient } from "@/config/supabase";
import { getOrganizationId } from "@/config/organization";
import {
  mapCreateDocumentoToInsert,
  mapTourDocumentRowToDocumento,
  mapUpdateDocumentoToUpdate,
} from "@/mappers/tour-documento.mapper";
import { recordTourTimelineEvent } from "@/services/tour-timeline.service";
import type { TourDocumentRow } from "@/types/database";
import type {
  CreateTourDocumentoInput,
  TourDocumento,
  UpdateTourDocumentoInput,
} from "@/types/tour-documento";

export class TourDocumentoServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TourDocumentoServiceError";
  }
}

const TABLE = "tour_documents";
const BUCKET = "tour-documents";

function handleSupabaseError(operation: string, error: { message: string; code?: string }) {
  throw new TourDocumentoServiceError(
    `[${operation}] ${error.message}${error.code ? ` (${error.code})` : ""}`,
  );
}

function buildStoragePath(
  organizationId: string,
  tourId: string,
  fileName: string,
): string {
  const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
  return `${organizationId}/${tourId}/${Date.now()}_${safeName}`;
}

function getPublicUrl(storagePath: string): string {
  const supabase = getSupabaseClient();
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);
  return data.publicUrl;
}

export async function getDocumentiByTourId(tourId: string): Promise<TourDocumento[]> {
  const organizationId = await getOrganizationId();
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("organization_id", organizationId)
    .eq("tour_id", tourId)
    .order("created_at", { ascending: false });

  if (error) handleSupabaseError("getDocumentiByTourId", error);

  return ((data ?? []) as TourDocumentRow[]).map((row) =>
    mapTourDocumentRowToDocumento(row, getPublicUrl(row.storage_path)),
  );
}

export async function listAllTourDocumenti(): Promise<TourDocumento[]> {
  const organizationId = await getOrganizationId();
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("organization_id", organizationId)
    .order("created_at", { ascending: false });

  if (error) handleSupabaseError("listAllTourDocumenti", error);

  return ((data ?? []) as TourDocumentRow[]).map((row) =>
    mapTourDocumentRowToDocumento(row, getPublicUrl(row.storage_path)),
  );
}

export async function uploadDocumento(
  input: CreateTourDocumentoInput,
): Promise<TourDocumento> {
  const nome = input.nome.trim() || input.file.name;
  if (!nome) {
    throw new TourDocumentoServiceError("Il nome del documento è obbligatorio.");
  }

  const organizationId = await getOrganizationId();
  const supabase = getSupabaseClient();
  const storagePath = buildStoragePath(organizationId, input.tourId, input.file.name);

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, input.file, {
      cacheControl: "3600",
      upsert: false,
      contentType: input.file.type || undefined,
    });

  if (uploadError) handleSupabaseError("uploadDocumentoStorage", uploadError);

  const { data, error } = await supabase
    .from(TABLE)
    .insert(mapCreateDocumentoToInsert(input, organizationId, storagePath))
    .select("*")
    .single();

  if (error) {
    await supabase.storage.from(BUCKET).remove([storagePath]);
    handleSupabaseError("uploadDocumento", error);
  }

  await recordTourTimelineEvent({
    tourId: input.tourId,
    tipo: "documento_caricato",
    titolo: `Documento caricato: ${nome}`,
    descrizione: `Categoria ${input.categoria}.`,
  });

  return mapTourDocumentRowToDocumento(
    data as TourDocumentRow,
    getPublicUrl(storagePath),
  );
}

export async function updateDocumento(
  id: string,
  input: UpdateTourDocumentoInput,
): Promise<TourDocumento> {
  const organizationId = await getOrganizationId();
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from(TABLE)
    .update(mapUpdateDocumentoToUpdate(input))
    .eq("id", id)
    .eq("organization_id", organizationId)
    .select("*")
    .single();

  if (error) handleSupabaseError("updateDocumento", error);

  const row = data as TourDocumentRow;
  return mapTourDocumentRowToDocumento(row, getPublicUrl(row.storage_path));
}

export async function deleteDocumento(id: string): Promise<void> {
  const organizationId = await getOrganizationId();
  const supabase = getSupabaseClient();

  const { data: current, error: fetchError } = await supabase
    .from(TABLE)
    .select("storage_path")
    .eq("id", id)
    .eq("organization_id", organizationId)
    .maybeSingle();

  if (fetchError) handleSupabaseError("deleteDocumentoFetch", fetchError);
  if (!current) {
    throw new TourDocumentoServiceError("Documento non trovato.");
  }

  const { error } = await supabase
    .from(TABLE)
    .delete()
    .eq("id", id)
    .eq("organization_id", organizationId);

  if (error) handleSupabaseError("deleteDocumento", error);

  await supabase.storage.from(BUCKET).remove([current.storage_path as string]);
}
