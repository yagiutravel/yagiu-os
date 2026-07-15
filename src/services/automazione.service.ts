import { getSupabaseClient } from "@/config/supabase";
import { isDevMissingTableNoOp } from "@/lib/supabase/missing-table";
import {
  mapAutomazioneRowToAutomazione,
  mapAutomazioniToViews,
} from "@/mappers/automazione.mapper";
import { countByStato } from "@/models/automazione";
import type {
  Automazione,
  AutomazioneStato,
  AutomazioneView,
  CreateAutomazioneInput,
} from "@/types/automazione";

export class AutomazioneServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AutomazioneServiceError";
  }
}

const TABLE = "automazioni";

function handleSupabaseError(
  operation: string,
  error: { message: string; code?: string },
): never {
  throw new AutomazioneServiceError(
    `[${operation}] ${error.message}${error.code ? ` (${error.code})` : ""}`,
  );
}

async function listAutomazioni(): Promise<Automazione[]> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .order("ultima_esecuzione", { ascending: false, nullsFirst: false })
    .order("creato_il", { ascending: false })
    .limit(500);

  if (error) {
    if (
      isDevMissingTableNoOp("automazione", TABLE, "listAutomazioni", error)
    ) {
      return [];
    }
    handleSupabaseError("listAutomazioni", error);
  }

  return (data ?? []).map((row) => mapAutomazioneRowToAutomazione(row));
}

export type AutomazioneRiepilogo = {
  attivi: number;
  inattivi: number;
  bozze: number;
  totale: number;
};

export async function getAutomazioni(): Promise<AutomazioneView[]> {
  const items = await listAutomazioni();
  return mapAutomazioniToViews(items);
}

export async function getAutomazioneRiepilogo(): Promise<AutomazioneRiepilogo> {
  const items = await listAutomazioni();
  const counts = countByStato(items);
  return {
    attivi: counts.attivo,
    inattivi: counts.inattivo,
    bozze: counts.bozza,
    totale: items.length,
  };
}

export async function createAutomazione(
  input: CreateAutomazioneInput,
): Promise<AutomazioneView> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from(TABLE)
    .insert({
      nome: input.nome.trim(),
      trigger: input.trigger,
      azione: input.azione,
      stato: input.stato,
      ultima_esecuzione: null,
    })
    .select("*")
    .single();

  if (error) {
    handleSupabaseError("createAutomazione", error);
  }

  return mapAutomazioniToViews([mapAutomazioneRowToAutomazione(data)])[0];
}

export function filterAutomazioni(
  items: AutomazioneView[],
  search: string,
  stato: AutomazioneStato | "tutti",
): AutomazioneView[] {
  const query = search.trim().toLowerCase();

  return items.filter((item) => {
    const matchesStato = stato === "tutti" || item.stato === stato;
    if (!matchesStato) return false;
    if (!query) return true;

    return (
      item.nome.toLowerCase().includes(query) ||
      item.triggerLabel.toLowerCase().includes(query) ||
      item.azioneLabel.toLowerCase().includes(query)
    );
  });
}
