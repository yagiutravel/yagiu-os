import { getSupabaseClient } from "@/config/supabase";
import {
  mapCreateInputToInsert,
  mapRowToCliente,
  mapRowsToClienti,
  mapUpdateInputToUpdate,
} from "@/lib/clienti/mappers";
import type {
  Cliente,
  CreateClienteInput,
  UpdateClienteInput,
} from "@/types/cliente";
import type { ClienteRow } from "@/types/database";

export const CLIENTI_TABLE = "clienti";

function handleSupabaseError(operation: string, error: { message: string; code?: string }) {
  throw new Error(`[${operation}] ${error.message}${error.code ? ` (${error.code})` : ""}`);
}

export async function getClienti(): Promise<Cliente[]> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from(CLIENTI_TABLE)
    .select("*")
    .order("created_at", { ascending: false });

  if (error) handleSupabaseError("getClienti", error);

  return mapRowsToClienti((data ?? []) as ClienteRow[]);
}

export async function getCliente(id: string): Promise<Cliente | null> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from(CLIENTI_TABLE)
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) handleSupabaseError("getCliente", error);
  if (!data) return null;

  return mapRowToCliente(data as ClienteRow);
}

export async function createCliente(input: CreateClienteInput): Promise<Cliente> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from(CLIENTI_TABLE)
    .insert(mapCreateInputToInsert(input))
    .select("*")
    .single();

  if (error) handleSupabaseError("createCliente", error);

  return mapRowToCliente(data as ClienteRow);
}

export async function updateCliente(
  id: string,
  input: UpdateClienteInput,
): Promise<Cliente> {
  const supabase = getSupabaseClient();
  const payload = mapUpdateInputToUpdate(input);

  if (Object.keys(payload).length === 0) {
    const existing = await getCliente(id);
    if (!existing) {
      throw new Error(`[updateCliente] Cliente con id "${id}" non trovato.`);
    }
    return existing;
  }

  const { data, error } = await supabase
    .from(CLIENTI_TABLE)
    .update(payload)
    .eq("id", id)
    .select("*")
    .single();

  if (error) handleSupabaseError("updateCliente", error);

  return mapRowToCliente(data as ClienteRow);
}

export async function deleteCliente(id: string): Promise<void> {
  const supabase = getSupabaseClient();

  const { error } = await supabase.from(CLIENTI_TABLE).delete().eq("id", id);

  if (error) handleSupabaseError("deleteCliente", error);
}
