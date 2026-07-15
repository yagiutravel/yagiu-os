import { getSupabaseClient } from "@/config/supabase";
import { isDevMissingTableNoOp } from "@/lib/supabase/missing-table";
import {
  mapComunicazioneEventoRowToEvento,
  mapComunicazioneRowToComunicazione,
  mapComunicazioniDashboardData,
} from "@/mappers/comunicazione.mapper";
import { getClienti } from "@/services/clienti.service";
import type {
  Comunicazione,
  ComunicazioneEventoTimeline,
  ComunicazioniDashboardData,
} from "@/types/comunicazione";

export class ComunicazioneServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ComunicazioneServiceError";
  }
}

const COMUNICAZIONI_TABLE = "comunicazioni";
const EVENTI_TABLE = "comunicazione_eventi";

function handleSupabaseError(
  operation: string,
  error: { message: string; code?: string },
): never {
  throw new ComunicazioneServiceError(
    `[${operation}] ${error.message}${error.code ? ` (${error.code})` : ""}`,
  );
}

async function listComunicazioni(): Promise<Comunicazione[]> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from(COMUNICAZIONI_TABLE)
    .select("*")
    .order("creato_il", { ascending: false })
    .limit(500);

  if (error) {
    if (
      isDevMissingTableNoOp(
        "comunicazione",
        COMUNICAZIONI_TABLE,
        "listComunicazioni",
        error,
      )
    ) {
      return [];
    }
    handleSupabaseError("listComunicazioni", error);
  }

  return (data ?? []).map((row) => mapComunicazioneRowToComunicazione(row));
}

async function listComunicazioneEventi(): Promise<ComunicazioneEventoTimeline[]> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from(EVENTI_TABLE)
    .select("*")
    .order("creato_il", { ascending: true })
    .limit(1000);

  if (error) {
    if (
      isDevMissingTableNoOp(
        "comunicazione",
        EVENTI_TABLE,
        "listComunicazioneEventi",
        error,
      )
    ) {
      return [];
    }
    handleSupabaseError("listComunicazioneEventi", error);
  }

  return (data ?? []).map((row) => mapComunicazioneEventoRowToEvento(row));
}

async function buildClientiMap(): Promise<Map<string, string>> {
  const map = new Map<string, string>();

  try {
    const clienti = await getClienti();
    for (const cliente of clienti) {
      map.set(cliente.id, cliente.nome);
    }
    return map;
  } catch {
    return map;
  }
}

export async function getComunicazioniDashboardData(): Promise<ComunicazioniDashboardData> {
  const [clientiMap, comunicazioni, eventi] = await Promise.all([
    buildClientiMap(),
    listComunicazioni(),
    listComunicazioneEventi(),
  ]);

  return mapComunicazioniDashboardData({
    comunicazioni,
    eventi,
    clientiMap,
  });
}
