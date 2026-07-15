import { getSupabaseClient } from "@/config/supabase";
import { getOrganizationId } from "@/config/organization";
import {
  mapCreatePreventivoInputToInsert,
  mapPreventivoRowToListItem,
  mapPreventivoRowToPreventivo,
  mapPreventivoRigaRowToRiga,
  mapRigaInputToInsert,
  mapUpdatePreventivoInputToUpdate,
} from "@/mappers/preventivo.mapper";
import {
  calculatePreventivoTotals,
  DEFAULT_TASSE_PERCENTUALE,
} from "@/models/preventivo";
import { recordAuditLog } from "@/services/audit-log-record.service";
import { recordClienteTimelineEvent } from "@/services/cliente-timeline-event.service";
import { getClienti } from "@/services/clienti.service";
import { invalidateDashboardCache } from "@/services/dashboard.service";
import { invalidateGlobalSearchIndex } from "@/services/global-search.service";
import { recordNotifica } from "@/services/notifica-record.service";
import { createPartecipazione } from "@/services/tour-partecipazione.service";
import {
  EMPTY_PARTECIPANTE_FORM,
  formToCreateInput,
} from "@/models/tour-partecipazione";
import { recordTourTimelineEvent } from "@/services/tour-timeline.service";
import { getTours } from "@/services/tour.service";
import type {
  PreventivoRigaRow,
  PreventivoRow,
} from "@/types/database";
import type {
  CreatePreventivoInput,
  Preventivo,
  PreventivoListItem,
  PreventivoRigaInput,
  StatoPreventivo,
  UpdatePreventivoInput,
} from "@/types/preventivo";
import type { ClienteTimelineEventoTipo } from "@/types/cliente-timeline";
import type { NotificaTipo } from "@/types/notifica";

export class PreventivoServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PreventivoServiceError";
  }
}

const PREVENTIVI_TABLE = "preventivi";
const RIGHE_TABLE = "preventivo_righe";

function handleSupabaseError(operation: string, error: { message: string; code?: string }) {
  throw new PreventivoServiceError(
    `[${operation}] ${error.message}${error.code ? ` (${error.code})` : ""}`,
  );
}

function invalidateCaches(): void {
  invalidateDashboardCache();
  invalidateGlobalSearchIndex();
}

async function buildContextMaps() {
  const [clienti, tours] = await Promise.all([getClienti(), getTours()]);
  const clienteMap = new Map(clienti.map((c) => [c.id, c.nome]));
  const tourMap = new Map(tours.map((t) => [t.id, t.nomeTour]));
  return { clienteMap, tourMap };
}

async function generatePreventivoNumero(organizationId: string): Promise<string> {
  const supabase = getSupabaseClient();
  const year = new Date().getFullYear();
  const prefix = `PREV-${year}-`;

  const { count, error } = await supabase
    .from(PREVENTIVI_TABLE)
    .select("id", { count: "exact", head: true })
    .eq("organization_id", organizationId)
    .like("numero", `${prefix}%`);

  if (error) handleSupabaseError("generatePreventivoNumero", error);

  const next = (count ?? 0) + 1;
  return `${prefix}${String(next).padStart(4, "0")}`;
}

async function fetchRigheByPreventivoId(
  preventivoId: string,
): Promise<ReturnType<typeof mapPreventivoRigaRowToRiga>[]> {
  const organizationId = await getOrganizationId();
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from(RIGHE_TABLE)
    .select("*")
    .eq("organization_id", organizationId)
    .eq("preventivo_id", preventivoId)
    .order("ordine", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) handleSupabaseError("fetchRigheByPreventivoId", error);

  return ((data ?? []) as PreventivoRigaRow[]).map(mapPreventivoRigaRowToRiga);
}

async function replaceRighe(
  preventivoId: string,
  righe: PreventivoRigaInput[],
  organizationId: string,
): Promise<void> {
  const supabase = getSupabaseClient();

  const { error: deleteError } = await supabase
    .from(RIGHE_TABLE)
    .delete()
    .eq("preventivo_id", preventivoId)
    .eq("organization_id", organizationId);

  if (deleteError) handleSupabaseError("replaceRigheDelete", deleteError);

  if (righe.length === 0) return;

  const rows = righe.map((riga, index) =>
    mapRigaInputToInsert(preventivoId, riga, organizationId, riga.ordine ?? index),
  );

  const { error: insertError } = await supabase.from(RIGHE_TABLE).insert(rows);
  if (insertError) handleSupabaseError("replaceRigheInsert", insertError);
}

function timelineTipoForStato(stato: StatoPreventivo): ClienteTimelineEventoTipo | null {
  switch (stato) {
    case "Inviato":
      return "preventivo_inviato";
    case "Accettato":
      return "preventivo_accettato";
    case "Convertito":
      return "preventivo_convertito";
    default:
      return null;
  }
}

function notificaTipoForStato(stato: StatoPreventivo): NotificaTipo | null {
  switch (stato) {
    case "Bozza":
      return "preventivo_creato";
    case "Inviato":
      return "preventivo_inviato";
    case "Accettato":
      return "preventivo_accettato";
    case "Convertito":
      return "preventivo_convertito";
    default:
      return null;
  }
}

async function emitPreventivoEvents(
  preventivo: Preventivo,
  azione: "creato" | "modificato" | "duplicato" | "convertito",
): Promise<void> {
  const label = `${preventivo.numero} — ${preventivo.clienteNome}`;

  await recordAuditLog({
    azione:
      azione === "creato"
        ? `Preventivo creato: ${preventivo.numero}`
        : azione === "duplicato"
          ? `Preventivo duplicato: ${preventivo.numero}`
          : azione === "convertito"
            ? `Preventivo convertito in iscrizione: ${preventivo.numero}`
            : `Preventivo aggiornato: ${preventivo.numero}`,
    tipo: "preventivo",
    azioneTipo:
      azione === "creato" || azione === "duplicato"
        ? "creato"
        : azione === "convertito"
          ? "completato"
          : "modificato",
    entitaId: preventivo.id,
    entitaLabel: label,
  });

  if (azione === "creato" || azione === "duplicato") {
    await recordClienteTimelineEvent({
      clienteId: preventivo.clienteId,
      tipo: "preventivo_creato",
      titolo: `Preventivo ${preventivo.numero}`,
      descrizione: preventivo.titolo || `Totale € ${preventivo.totale.toLocaleString("it-IT")}`,
    });
  }

  const timelineTipo = timelineTipoForStato(preventivo.stato);
  if (timelineTipo && azione !== "creato" && azione !== "duplicato") {
    await recordClienteTimelineEvent({
      clienteId: preventivo.clienteId,
      tipo: timelineTipo,
      titolo: `Preventivo ${preventivo.numero} — ${preventivo.stato}`,
      descrizione: preventivo.tourNome
        ? `Tour: ${preventivo.tourNome}`
        : "Preventivo aggiornato.",
    });
  }

  const notificaTipo =
    azione === "creato" || azione === "duplicato"
      ? "preventivo_creato"
      : notificaTipoForStato(preventivo.stato);

  if (notificaTipo) {
    await recordNotifica({
      tipo: notificaTipo,
      titolo: `Preventivo ${preventivo.numero}`,
      messaggio: `${preventivo.clienteNome} · € ${preventivo.totale.toLocaleString("it-IT")} · ${preventivo.stato}`,
      href: `/preventivi/${preventivo.id}`,
    });
  }

  if (preventivo.tourId) {
    await recordTourTimelineEvent({
      tourId: preventivo.tourId,
      tipo: "nota_interna",
      titolo: `Preventivo ${preventivo.numero}`,
      descrizione: `${preventivo.stato} per ${preventivo.clienteNome}.`,
    });
  }
}

export async function listPreventivi(): Promise<PreventivoListItem[]> {
  const organizationId = await getOrganizationId();
  const supabase = getSupabaseClient();
  const { clienteMap, tourMap } = await buildContextMaps();

  const { data, error } = await supabase
    .from(PREVENTIVI_TABLE)
    .select("*")
    .eq("organization_id", organizationId)
    .order("created_at", { ascending: false });

  if (error) handleSupabaseError("listPreventivi", error);

  return ((data ?? []) as PreventivoRow[]).map((row) =>
    mapPreventivoRowToListItem(row, {
      clienteNome: clienteMap.get(row.cliente_id) ?? "Cliente",
      tourNome: row.tour_id ? (tourMap.get(row.tour_id) ?? null) : null,
    }),
  );
}

export async function getPreventivoById(id: string): Promise<Preventivo | null> {
  const organizationId = await getOrganizationId();
  const supabase = getSupabaseClient();
  const { clienteMap, tourMap } = await buildContextMaps();

  const { data, error } = await supabase
    .from(PREVENTIVI_TABLE)
    .select("*")
    .eq("id", id)
    .eq("organization_id", organizationId)
    .maybeSingle();

  if (error) handleSupabaseError("getPreventivoById", error);
  if (!data) return null;

  const row = data as PreventivoRow;
  const righe = await fetchRigheByPreventivoId(id);

  return mapPreventivoRowToPreventivo(row, {
    clienteNome: clienteMap.get(row.cliente_id) ?? "Cliente",
    tourNome: row.tour_id ? (tourMap.get(row.tour_id) ?? null) : null,
    righe,
  });
}

export async function createPreventivo(
  input: CreatePreventivoInput,
  options?: { azione?: "creato" | "duplicato" },
): Promise<Preventivo> {
  const organizationId = await getOrganizationId();
  const supabase = getSupabaseClient();

  if (!input.clienteId) {
    throw new PreventivoServiceError("Il cliente è obbligatorio.");
  }
  if (!input.righe.length) {
    throw new PreventivoServiceError("Aggiungi almeno una riga al preventivo.");
  }

  const numero = await generatePreventivoNumero(organizationId);
  const totals = calculatePreventivoTotals(
    input.righe,
    input.tassePercentuale ?? DEFAULT_TASSE_PERCENTUALE,
  );

  const { data, error } = await supabase
    .from(PREVENTIVI_TABLE)
    .insert(
      mapCreatePreventivoInputToInsert(input, organizationId, numero, {
        subtotaleCents: totals.subtotaleCents,
        tasseCents: totals.tasseCents,
        totaleCents: totals.totaleCents,
      }),
    )
    .select("*")
    .single();

  if (error) handleSupabaseError("createPreventivo", error);

  const row = data as PreventivoRow;
  await replaceRighe(row.id, input.righe, organizationId);

  const preventivo = await getPreventivoById(row.id);
  if (!preventivo) {
    throw new PreventivoServiceError("Preventivo creato ma non recuperabile.");
  }

  await emitPreventivoEvents(preventivo, options?.azione ?? "creato");
  invalidateCaches();
  return preventivo;
}

export async function updatePreventivo(
  id: string,
  input: UpdatePreventivoInput,
): Promise<Preventivo> {
  const organizationId = await getOrganizationId();
  const supabase = getSupabaseClient();

  const existing = await getPreventivoById(id);
  if (!existing) {
    throw new PreventivoServiceError("Preventivo non trovato.");
  }

  const righe = input.righe ?? existing.righe.map((riga) => ({
    id: riga.id,
    descrizione: riga.descrizione,
    quantita: riga.quantita,
    prezzoUnitario: riga.prezzoUnitario,
    ordine: riga.ordine,
  }));

  const tassePercentuale = input.tassePercentuale ?? existing.tassePercentuale;
  const totals = calculatePreventivoTotals(righe, tassePercentuale);

  const { error } = await supabase
    .from(PREVENTIVI_TABLE)
    .update(
      mapUpdatePreventivoInputToUpdate(input, {
        subtotaleCents: totals.subtotaleCents,
        tasseCents: totals.tasseCents,
        totaleCents: totals.totaleCents,
      }),
    )
    .eq("id", id)
    .eq("organization_id", organizationId)
    .select("*")
    .single();

  if (error) handleSupabaseError("updatePreventivo", error);

  if (input.righe) {
    await replaceRighe(id, righe, organizationId);
  }

  const preventivo = await getPreventivoById(id);
  if (!preventivo) {
    throw new PreventivoServiceError("Preventivo aggiornato ma non recuperabile.");
  }

  await emitPreventivoEvents(preventivo, "modificato");
  invalidateCaches();
  return preventivo;
}

export async function deletePreventivo(id: string): Promise<void> {
  const organizationId = await getOrganizationId();
  const supabase = getSupabaseClient();

  const existing = await getPreventivoById(id);

  const { error } = await supabase
    .from(PREVENTIVI_TABLE)
    .delete()
    .eq("id", id)
    .eq("organization_id", organizationId);

  if (error) handleSupabaseError("deletePreventivo", error);

  if (existing) {
    await recordAuditLog({
      azione: `Preventivo eliminato: ${existing.numero}`,
      tipo: "preventivo",
      azioneTipo: "eliminato",
      entitaId: id,
      entitaLabel: existing.numero,
    });
  }

  invalidateCaches();
}

export async function duplicatePreventivo(id: string): Promise<Preventivo> {
  const existing = await getPreventivoById(id);
  if (!existing) {
    throw new PreventivoServiceError("Preventivo non trovato.");
  }

  const duplicated = await createPreventivo(
    {
      clienteId: existing.clienteId,
      tourId: existing.tourId,
      titolo: existing.titolo ? `${existing.titolo} (copia)` : "",
      stato: "Bozza",
      tassePercentuale: existing.tassePercentuale,
      validoFino: existing.validoFino,
      note: existing.note,
      righe: existing.righe.map((riga) => ({
        descrizione: riga.descrizione,
        quantita: riga.quantita,
        prezzoUnitario: riga.prezzoUnitario,
        ordine: riga.ordine,
      })),
    },
    { azione: "duplicato" },
  );

  return duplicated;
}

export async function convertPreventivoToIscrizione(id: string): Promise<Preventivo> {
  const preventivo = await getPreventivoById(id);
  if (!preventivo) {
    throw new PreventivoServiceError("Preventivo non trovato.");
  }

  if (!preventivo.tourId) {
    throw new PreventivoServiceError("Collega un tour al preventivo prima della conversione.");
  }

  if (preventivo.stato === "Convertito") {
    throw new PreventivoServiceError("Il preventivo è già stato convertito.");
  }

  if (!["Accettato", "Inviato"].includes(preventivo.stato)) {
    throw new PreventivoServiceError(
      "Il preventivo deve essere Inviato o Accettato per la conversione.",
    );
  }

  const partecipazione = await createPartecipazione(
    formToCreateInput(preventivo.tourId, {
      ...EMPTY_PARTECIPANTE_FORM,
      clienteId: preventivo.clienteId,
    }),
  );

  const organizationId = await getOrganizationId();
  const supabase = getSupabaseClient();

  const { error } = await supabase
    .from(PREVENTIVI_TABLE)
    .update({
      stato: "convertito",
      partecipante_id: partecipazione.id,
    })
    .eq("id", id)
    .eq("organization_id", organizationId);

  if (error) handleSupabaseError("convertPreventivoToIscrizione", error);

  const updated = await getPreventivoById(id);
  if (!updated) {
    throw new PreventivoServiceError("Conversione completata ma preventivo non recuperabile.");
  }

  await emitPreventivoEvents(updated, "convertito");
  invalidateCaches();
  return updated;
}

export async function countPreventiviInAttesa(): Promise<number> {
  const organizationId = await getOrganizationId();
  const supabase = getSupabaseClient();

  const { count, error } = await supabase
    .from(PREVENTIVI_TABLE)
    .select("id", { count: "exact", head: true })
    .eq("organization_id", organizationId)
    .in("stato", ["bozza", "inviato"]);

  if (error) handleSupabaseError("countPreventiviInAttesa", error);
  return count ?? 0;
}
