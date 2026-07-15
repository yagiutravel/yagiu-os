import { getSupabaseClient } from "@/config/supabase";
import { isDevMissingTableNoOp } from "@/lib/supabase/missing-table";
import {
  mapSchedulazioneRowToSchedulazione,
  mapSchedulazioniToViews,
} from "@/mappers/schedulazione.mapper";
import { countByStato } from "@/models/schedulazione";
import { getTours } from "@/services/tour.service";
import { getClienti } from "@/services/clienti.service";
import type {
  CreateSchedulazioneInput,
  Schedulazione,
  SchedulazioneStato,
  SchedulazioneTipo,
  SchedulazioneView,
} from "@/types/schedulazione";

export class SchedulazioneServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SchedulazioneServiceError";
  }
}

const TABLE = "schedulazioni";

function handleSupabaseError(
  operation: string,
  error: { message: string; code?: string },
): never {
  throw new SchedulazioneServiceError(
    `[${operation}] ${error.message}${error.code ? ` (${error.code})` : ""}`,
  );
}

async function listSchedulazioni(): Promise<Schedulazione[]> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .order("data", { ascending: false })
    .order("ora", { ascending: false })
    .limit(500);

  if (error) {
    if (
      isDevMissingTableNoOp("schedulazione", TABLE, "listSchedulazioni", error)
    ) {
      return [];
    }
    handleSupabaseError("listSchedulazioni", error);
  }

  return (data ?? []).map((row) => mapSchedulazioneRowToSchedulazione(row));
}

export type SchedulazioneRiepilogo = {
  programmate: number;
  inviate: number;
  fallite: number;
  bozze: number;
  totale: number;
};

export async function getSchedulazioni(): Promise<SchedulazioneView[]> {
  const items = await listSchedulazioni();
  return mapSchedulazioniToViews(items);
}

export async function getSchedulazioneRiepilogo(): Promise<SchedulazioneRiepilogo> {
  const items = await listSchedulazioni();
  const counts = countByStato(items);
  return {
    programmate: counts.programmata,
    inviate: counts.inviata,
    fallite: counts.fallita,
    bozze: counts.bozza,
    totale: items.length,
  };
}

export async function createSchedulazione(
  input: CreateSchedulazioneInput,
): Promise<SchedulazioneView> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from(TABLE)
    .insert({
      titolo: input.titolo.trim(),
      cliente_id: input.clienteId,
      cliente_nome: input.clienteNome,
      tour_id: input.tourId,
      tour_nome: input.tourNome,
      tipo: input.tipo,
      data: input.data,
      ora: input.ora,
      stato: input.stato,
    })
    .select("*")
    .single();

  if (error) {
    handleSupabaseError("createSchedulazione", error);
  }

  return mapSchedulazioniToViews([mapSchedulazioneRowToSchedulazione(data)])[0];
}

export async function getSchedulazioneClienti(): Promise<
  Array<{ id: string; nome: string }>
> {
  try {
    const clienti = await getClienti();
    return clienti.map((c) => ({ id: c.id, nome: c.nome }));
  } catch {
    return [];
  }
}

export async function getSchedulazioneTours(): Promise<
  Array<{ id: string; nome: string }>
> {
  const tours = await getTours();
  return tours
    .filter((t) => t.stato !== "Archiviato")
    .map((t) => ({
      id: t.id,
      nome: t.nomeTour,
    }));
}

export function filterSchedulazioni(
  items: SchedulazioneView[],
  search: string,
  stato: SchedulazioneStato | "tutte",
  tipo: SchedulazioneTipo | "tutti",
): SchedulazioneView[] {
  const query = search.trim().toLowerCase();

  return items.filter((item) => {
    const matchesStato = stato === "tutte" || item.stato === stato;
    const matchesTipo = tipo === "tutti" || item.tipo === tipo;
    if (!matchesStato || !matchesTipo) return false;
    if (!query) return true;

    return (
      item.titolo.toLowerCase().includes(query) ||
      item.clienteNome.toLowerCase().includes(query) ||
      (item.tourNome?.toLowerCase().includes(query) ?? false)
    );
  });
}
