import { insertEmailInvioMock } from "@/mock/email-invio";
import { insertComunicazioneEmailMock } from "@/mock/comunicazioni";
import { insertClienteTimelineEmailMock } from "@/mock/cliente-timeline";
import { buildAnteprimaMessaggio } from "@/models/email-invio";
import type { EmailInvio, InviaEmailInput } from "@/types/email-invio";

export class EmailInvioServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "EmailInvioServiceError";
  }
}

export type InviaEmailResult = {
  invio: EmailInvio;
};

export async function inviaEmailSimulata(
  input: InviaEmailInput,
): Promise<InviaEmailResult> {
  await new Promise((resolve) => setTimeout(resolve, 600));

  const invio = insertEmailInvioMock(input);

  insertClienteTimelineEmailMock({
    clienteId: input.clienteId,
    oggetto: `Email inviata: ${input.oggetto}`,
    descrizione: `Inviata a ${input.destinatario}${input.allegati.length > 0 ? ` con ${input.allegati.length} allegat${input.allegati.length === 1 ? "o" : "i"}` : ""}.`,
    utente: input.utente,
  });

  insertComunicazioneEmailMock({
    clienteId: input.clienteId,
    oggetto: input.oggetto,
    anteprima: buildAnteprimaMessaggio(input.messaggio),
  });

  return { invio };
}
