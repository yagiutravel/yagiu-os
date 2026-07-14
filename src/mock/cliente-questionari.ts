import { createClienteQuestionario } from "@/models/cliente-questionario";
import type { ClienteQuestionario } from "@/types/cliente-questionario";

const questionariStore: ClienteQuestionario[] = [];
const seededClienti = new Set<string>();

function seedQuestionarioForCliente(clienteId: string): void {
  if (seededClienti.has(clienteId)) return;

  const isEven = clienteId.charCodeAt(0) % 2 === 0;

  questionariStore.push(
    createClienteQuestionario(clienteId, {
      allergie: isEven ? "Noci, crostacei" : "Nessuna",
      intolleranze: isEven ? "Lattosio" : "Nessuna",
      farmaci: isEven ? "Eutirox 50mcg" : "Nessuno",
      contattoEmergenza: isEven ? "Laura Bianchi" : "Marco Rossi",
      numeroEmergenza: isEven ? "+39 340 123 4567" : "+39 333 987 6543",
      tagliaMaglietta: isEven ? "M" : "L",
      tagliaFelpa: isEven ? "M" : "XL",
      cameraPreferita: isEven ? "Doppia con letti separati" : "Singola",
      compagnoRichiesto: isEven ? "Laura Bianchi" : "—",
      noteAlimentari: isEven
        ? "Preferisce pasti leggeri a cena. Evitare cibi piccanti."
        : "Nessuna preferenza particolare.",
      vegetariano: isEven,
      vegano: false,
      celiaco: isEven,
      fumatore: false,
    }),
  );

  seededClienti.add(clienteId);
}

export function seedClienteQuestionarioMock(clienteId: string): void {
  seedQuestionarioForCliente(clienteId);
}

export function listQuestionariMock(): ClienteQuestionario[] {
  return [...questionariStore];
}

export function findQuestionarioByClienteIdMock(
  clienteId: string,
): ClienteQuestionario | undefined {
  seedQuestionarioForCliente(clienteId);
  return questionariStore.find((item) => item.clienteId === clienteId);
}

export function resetClienteQuestionariMockForTests(): void {
  questionariStore.length = 0;
  seededClienti.clear();
}
