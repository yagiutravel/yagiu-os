import { getSupabaseClient } from "@/config/supabase";
import { mapEmailInvioRowToInvio } from "@/mappers/email-invio.mapper";
import { recordClienteTimelineEvent } from "@/services/cliente-timeline-event.service";
import type { EmailInvio, InviaEmailInput } from "@/types/email-invio";

export class EmailInvioServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "EmailInvioServiceError";
  }
}

const TABLE = "email_invii";

function handleSupabaseError(
  operation: string,
  error: { message: string; code?: string },
): never {
  throw new EmailInvioServiceError(
    `[${operation}] ${error.message}${error.code ? ` (${error.code})` : ""}`,
  );
}

export type InviaEmailResult = {
  invio: EmailInvio;
};

export async function inviaEmailSimulata(
  input: InviaEmailInput,
): Promise<InviaEmailResult> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from(TABLE)
    .insert({
      cliente_id: input.clienteId,
      destinatario: input.destinatario.trim(),
      oggetto: input.oggetto.trim(),
      messaggio: input.messaggio.trim(),
      template_id: input.templateId || null,
      allegati: input.allegati,
      utente: input.utente,
    })
    .select("*")
    .single();

  if (error) {
    handleSupabaseError("inviaEmailSimulata", error);
  }

  const invio = mapEmailInvioRowToInvio(data);

  await recordClienteTimelineEvent({
    clienteId: input.clienteId,
    tipo: "email_inviata",
    titolo: `Email inviata: ${input.oggetto}`,
    descrizione: `Inviata a ${input.destinatario}${input.allegati.length > 0 ? ` con ${input.allegati.length} allegat${input.allegati.length === 1 ? "o" : "i"}` : ""}.`,
    utente: input.utente,
  });

  return { invio };
}
