import { createEmailInvioId } from "@/models/email-invio";
import type { EmailInvio, InviaEmailInput } from "@/types/email-invio";

const inviiStore: EmailInvio[] = [];

export function insertEmailInvioMock(input: InviaEmailInput): EmailInvio {
  const now = new Date().toISOString();
  const invio: EmailInvio = {
    id: createEmailInvioId(),
    clienteId: input.clienteId,
    destinatario: input.destinatario,
    oggetto: input.oggetto,
    messaggio: input.messaggio,
    templateId: input.templateId,
    allegati: input.allegati,
    utente: input.utente,
    inviataIl: now,
    creatoIl: now,
  };

  inviiStore.unshift(invio);
  return invio;
}

export function listEmailInviiMock(): EmailInvio[] {
  return [...inviiStore];
}

export function listEmailInviiByClienteIdMock(clienteId: string): EmailInvio[] {
  return inviiStore.filter((item) => item.clienteId === clienteId);
}

export function resetEmailInviiMockForTests(): void {
  inviiStore.length = 0;
}
