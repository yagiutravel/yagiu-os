import { getOrganizationId } from "@/config/organization";
import { getSupabaseClient } from "@/config/supabase";
import {
  formatClienteDeleteBlockedMessage,
  getClienteDeleteBlockers,
  mapClienteDeleteForeignKeyError,
} from "@/lib/clienti/delete-guards";
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
import { recordAuditLog } from "@/services/audit-log-record.service";

export const CLIENTI_TABLE = "clienti";

export class ClienteServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ClienteServiceError";
  }
}

function handleSupabaseError(operation: string, error: { message: string; code?: string }) {
  throw new ClienteServiceError(
    `[${operation}] ${error.message}${error.code ? ` (${error.code})` : ""}`,
  );
}

function handleDeleteClienteError(error: { message: string; code?: string }): never {
  const mapped =
    mapClienteDeleteForeignKeyError(error.message) ??
    (error.code === "23503"
      ? mapClienteDeleteForeignKeyError("foreign key constraint")
      : null);

  throw new ClienteServiceError(
    mapped ??
      `[deleteCliente] ${error.message}${error.code ? ` (${error.code})` : ""}`,
  );
}

export async function getClienti(): Promise<Cliente[]> {
  const supabase = getSupabaseClient();
  const organizationId = await getOrganizationId();

  const { data, error } = await supabase
    .from(CLIENTI_TABLE)
    .select("*")
    .eq("organization_id", organizationId)
    .order("created_at", { ascending: false });

  if (error) handleSupabaseError("getClienti", error);

  return mapRowsToClienti((data ?? []) as ClienteRow[]);
}

export async function getCliente(id: string): Promise<Cliente | null> {
  const supabase = getSupabaseClient();
  const organizationId = await getOrganizationId();

  const { data, error } = await supabase
    .from(CLIENTI_TABLE)
    .select("*")
    .eq("id", id)
    .eq("organization_id", organizationId)
    .maybeSingle();

  if (error) handleSupabaseError("getCliente", error);
  if (!data) return null;

  return mapRowToCliente(data as ClienteRow);
}

export async function createCliente(input: CreateClienteInput): Promise<Cliente> {
  const supabase = getSupabaseClient();
  const organizationId = await getOrganizationId();

  const { data, error } = await supabase
    .from(CLIENTI_TABLE)
    .insert({
      ...mapCreateInputToInsert(input),
      organization_id: organizationId,
    })
    .select("*")
    .single();

  if (error) handleSupabaseError("createCliente", error);

  const cliente = mapRowToCliente(data as ClienteRow);

  await recordAuditLog({
    azione: `${cliente.nome} creato`,
    tipo: "cliente",
    azioneTipo: "creato",
    entitaId: cliente.id,
    entitaLabel: cliente.nome,
  });

  return cliente;
}

export async function updateCliente(
  id: string,
  input: UpdateClienteInput,
): Promise<Cliente> {
  const supabase = getSupabaseClient();
  const organizationId = await getOrganizationId();
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
    .eq("organization_id", organizationId)
    .select("*")
    .single();

  if (error) handleSupabaseError("updateCliente", error);

  const cliente = mapRowToCliente(data as ClienteRow);

  await recordAuditLog({
    azione: `${cliente.nome} modificato`,
    tipo: "cliente",
    azioneTipo: "modificato",
    entitaId: cliente.id,
    entitaLabel: cliente.nome,
  });

  return cliente;
}

export async function deleteCliente(id: string): Promise<void> {
  const existing = await getCliente(id);
  if (!existing) {
    throw new ClienteServiceError(`Cliente con id "${id}" non trovato.`);
  }

  const supabase = getSupabaseClient();
  const organizationId = await getOrganizationId();

  const blockers = await getClienteDeleteBlockers(supabase, id, organizationId);
  if (blockers.length > 0) {
    throw new ClienteServiceError(formatClienteDeleteBlockedMessage(blockers));
  }

  const { error } = await supabase
    .from(CLIENTI_TABLE)
    .delete()
    .eq("id", id)
    .eq("organization_id", organizationId);

  if (error) handleDeleteClienteError(error);

  if (existing) {
    await recordAuditLog({
      azione: `${existing.nome} eliminato`,
      tipo: "cliente",
      azioneTipo: "eliminato",
      entitaId: id,
      entitaLabel: existing.nome,
    });
  }
}
