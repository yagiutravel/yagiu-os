import { getSupabaseClient } from "@/config/supabase";
import { isDevMissingTableNoOp } from "@/lib/supabase/missing-table";
import {
  mapConversazioniToViews,
  mapWhatsAppConversazioneRowToConversazione,
  mapWhatsAppInvioRowToInvio,
  mapWhatsAppTemplateRowToTemplate,
} from "@/mappers/whatsapp.mapper";
import { buildAnteprimaWhatsApp } from "@/models/whatsapp";
import { getClienti } from "@/services/clienti.service";
import { recordClienteTimelineEvent } from "@/services/cliente-timeline-event.service";
import type {
  InviaWhatsAppInput,
  WhatsAppConversazione,
  WhatsAppConversazioneView,
  WhatsAppInvio,
  WhatsAppTemplate,
} from "@/types/whatsapp";

export class WhatsAppServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "WhatsAppServiceError";
  }
}

const CONVERSAZIONI_TABLE = "whatsapp_conversazioni";
const INVII_TABLE = "whatsapp_invii";
const TEMPLATES_TABLE = "whatsapp_templates";

function handleSupabaseError(
  operation: string,
  error: { message: string; code?: string },
): never {
  throw new WhatsAppServiceError(
    `[${operation}] ${error.message}${error.code ? ` (${error.code})` : ""}`,
  );
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

async function listWhatsAppConversazioni(): Promise<WhatsAppConversazione[]> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from(CONVERSAZIONI_TABLE)
    .select("*")
    .order("data", { ascending: false })
    .limit(500);

  if (error) {
    if (
      isDevMissingTableNoOp(
        "whatsapp",
        CONVERSAZIONI_TABLE,
        "listWhatsAppConversazioni",
        error,
      )
    ) {
      return [];
    }
    handleSupabaseError("listWhatsAppConversazioni", error);
  }

  const clientiMap = await buildClientiMap();

  return (data ?? []).map((row) =>
    mapWhatsAppConversazioneRowToConversazione({
      ...row,
      cliente_nome: clientiMap.get(row.cliente_id) ?? "",
    }),
  );
}

async function listWhatsAppTemplates(): Promise<WhatsAppTemplate[]> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from(TEMPLATES_TABLE)
    .select("*")
    .order("titolo", { ascending: true });

  if (error) {
    if (
      isDevMissingTableNoOp(
        "whatsapp",
        TEMPLATES_TABLE,
        "listWhatsAppTemplates",
        error,
      )
    ) {
      return [];
    }
    handleSupabaseError("listWhatsAppTemplates", error);
  }

  return (data ?? []).map((row) => mapWhatsAppTemplateRowToTemplate(row));
}

async function syncConversazioneAfterInvio(input: InviaWhatsAppInput): Promise<void> {
  const supabase = getSupabaseClient();
  const now = new Date().toISOString();

  const { data: existing, error: fetchError } = await supabase
    .from(CONVERSAZIONI_TABLE)
    .select("id")
    .eq("cliente_id", input.clienteId)
    .maybeSingle();

  if (fetchError) {
    if (
      isDevMissingTableNoOp(
        "whatsapp",
        CONVERSAZIONI_TABLE,
        "syncConversazioneAfterInvio",
        fetchError,
      )
    ) {
      return;
    }
    handleSupabaseError("syncConversazioneAfterInvio", fetchError);
  }

  const payload = {
    numero: input.numero,
    ultimo_messaggio: input.messaggio,
    data: now,
    stato: "inviato",
    aggiornato_il: now,
  };

  if (existing) {
    const { error } = await supabase
      .from(CONVERSAZIONI_TABLE)
      .update(payload)
      .eq("cliente_id", input.clienteId);

    if (error) {
      if (
        isDevMissingTableNoOp(
          "whatsapp",
          CONVERSAZIONI_TABLE,
          "syncConversazioneAfterInvio",
          error,
        )
      ) {
        return;
      }
      handleSupabaseError("syncConversazioneAfterInvio", error);
    }
    return;
  }

  const { error } = await supabase.from(CONVERSAZIONI_TABLE).insert({
    cliente_id: input.clienteId,
    ...payload,
  });

  if (error) {
    if (
      isDevMissingTableNoOp(
        "whatsapp",
        CONVERSAZIONI_TABLE,
        "syncConversazioneAfterInvio",
        error,
      )
    ) {
      return;
    }
    handleSupabaseError("syncConversazioneAfterInvio", error);
  }
}

export async function getWhatsAppConversazioni(): Promise<
  WhatsAppConversazioneView[]
> {
  const conversazioni = await listWhatsAppConversazioni();
  return mapConversazioniToViews(conversazioni);
}

export async function getWhatsAppTemplates(): Promise<WhatsAppTemplate[]> {
  return listWhatsAppTemplates();
}

export type InviaWhatsAppResult = {
  invio: WhatsAppInvio;
};

export async function inviaWhatsAppSimulato(
  input: InviaWhatsAppInput,
): Promise<InviaWhatsAppResult> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from(INVII_TABLE)
    .insert({
      cliente_id: input.clienteId,
      numero: input.numero.trim(),
      messaggio: input.messaggio.trim(),
      template_id: input.templateId || null,
      utente: input.utente,
    })
    .select("*")
    .single();

  if (error) {
    handleSupabaseError("inviaWhatsAppSimulato", error);
  }

  const invio = mapWhatsAppInvioRowToInvio(data);

  await syncConversazioneAfterInvio(input);

  await recordClienteTimelineEvent({
    clienteId: input.clienteId,
    tipo: "whatsapp_inviato",
    titolo: "WhatsApp inviato",
    descrizione: `Messaggio inviato a ${input.numero}: "${buildAnteprimaWhatsApp(input.messaggio, 60)}"`,
    utente: input.utente,
  });

  return { invio };
}

export function filterWhatsAppConversazioni(
  conversazioni: WhatsAppConversazioneView[],
  search: string,
): WhatsAppConversazioneView[] {
  const query = search.trim().toLowerCase();
  if (!query) return conversazioni;

  return conversazioni.filter(
    (item) =>
      item.clienteNome.toLowerCase().includes(query) ||
      item.numero.includes(query) ||
      item.ultimoMessaggio.toLowerCase().includes(query),
  );
}
