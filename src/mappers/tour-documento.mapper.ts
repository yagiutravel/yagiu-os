import { mapDbCategoriaDocumentoToUi, mapUiCategoriaDocumentoToDb } from "@/lib/tour/db-enums";
import type { TourDocumentRow, TourDocumentUpdate } from "@/types/database";
import type {
  CategoriaDocumentoTour,
  CreateTourDocumentoInput,
  TourDocumento,
  UpdateTourDocumentoInput,
} from "@/types/tour-documento";

export function mapTourDocumentRowToDocumento(
  row: TourDocumentRow,
  publicUrl: string,
): TourDocumento {
  return {
    id: row.id,
    tourId: row.tour_id,
    nome: row.nome,
    categoria: mapDbCategoriaDocumentoToUi(row.categoria),
    storagePath: row.storage_path,
    url: publicUrl,
    mimeType: row.mime_type,
    dimensioneBytes: Number(row.dimensione_bytes),
    note: row.note,
    caricatoIl: row.created_at,
  };
}

export function mapCreateDocumentoToInsert(
  input: CreateTourDocumentoInput,
  organizationId: string,
  storagePath: string,
) {
  return {
    organization_id: organizationId,
    tour_id: input.tourId,
    nome: input.nome.trim(),
    categoria: mapUiCategoriaDocumentoToDb(input.categoria),
    storage_path: storagePath,
    mime_type: input.file.type || "application/octet-stream",
    dimensione_bytes: input.file.size,
    note: input.note?.trim() ?? "",
  };
}

export function mapUpdateDocumentoToUpdate(
  input: UpdateTourDocumentoInput,
): TourDocumentUpdate {
  const payload: TourDocumentUpdate = {};

  if (input.nome !== undefined) payload.nome = input.nome.trim();
  if (input.categoria !== undefined) {
    payload.categoria = mapUiCategoriaDocumentoToDb(input.categoria);
  }
  if (input.note !== undefined) payload.note = input.note.trim();

  return payload;
}

export const CATEGORIE_DOCUMENTO_TOUR: CategoriaDocumentoTour[] = [
  "Contratto",
  "Assicurazione",
  "Programma",
  "Voucher",
  "Fattura",
  "Immagine",
  "Altro",
];
