import type { Cliente } from "@/types/cliente";
import { createPartecipazioneTour } from "@/models/tour-partecipazione";
import type {
  CreatePartecipazioneTourInput,
  PartecipazioneTour,
  UpdatePartecipazioneTourInput,
} from "@/types/tour-partecipazione";

const partecipazioniStore: PartecipazioneTour[] = [];
let seeded = false;

export function seedPartecipazioniMock(clienti: Cliente[]): void {
  if (seeded || clienti.length === 0) return;

  const seedInputs: CreatePartecipazioneTourInput[] = [
    {
      tourId: "tour-1",
      clienteId: clienti[0].id,
      ruolo: "Partecipante",
      pagamento: "Acconto ricevuto",
      documenti: "Ricevuti",
      questionario: "Compilato",
      note: "Richiede camera singola.",
    },
  ];

  if (clienti.length > 1) {
    seedInputs.push({
      tourId: "tour-1",
      clienteId: clienti[1].id,
      ruolo: "Accompagnatore",
      pagamento: "Non iniziato",
      documenti: "Da inviare",
      questionario: "Da compilare",
      note: "",
    });
  }

  if (clienti.length > 2) {
    seedInputs.push({
      tourId: "tour-3",
      clienteId: clienti[2].id,
      ruolo: "Tour Leader",
      pagamento: "Saldo ricevuto",
      documenti: "Verificati",
      questionario: "Compilato",
      note: "Referente gruppo trekking.",
    });
  }

  partecipazioniStore.push(...seedInputs.map(createPartecipazioneTour));
  seeded = true;
}

export function listPartecipazioniMock(): PartecipazioneTour[] {
  return [...partecipazioniStore];
}

export function listPartecipazioniByTourIdMock(tourId: string): PartecipazioneTour[] {
  return partecipazioniStore.filter((item) => item.tourId === tourId);
}

export function listPartecipazioniByClienteIdMock(
  clienteId: string,
): PartecipazioneTour[] {
  return partecipazioniStore.filter((item) => item.clienteId === clienteId);
}

export function findPartecipazioneByIdMock(
  id: string,
): PartecipazioneTour | undefined {
  return partecipazioniStore.find((item) => item.id === id);
}

export function existsPartecipazioneMock(
  tourId: string,
  clienteId: string,
  excludeId?: string,
): boolean {
  return partecipazioniStore.some(
    (item) =>
      item.tourId === tourId &&
      item.clienteId === clienteId &&
      item.id !== excludeId,
  );
}

export function insertPartecipazioneMock(
  input: CreatePartecipazioneTourInput,
): PartecipazioneTour {
  const partecipazione = createPartecipazioneTour(input);
  partecipazioniStore.push(partecipazione);
  return partecipazione;
}

export function updatePartecipazioneMock(
  id: string,
  input: UpdatePartecipazioneTourInput,
): PartecipazioneTour | null {
  const index = partecipazioniStore.findIndex((item) => item.id === id);
  if (index === -1) return null;

  const current = partecipazioniStore[index];
  const updated: PartecipazioneTour = {
    ...current,
    ...input,
    note: input.note !== undefined ? input.note.trim() : current.note,
    aggiornatoIl: new Date().toISOString(),
  };

  partecipazioniStore[index] = updated;
  return updated;
}

export function deletePartecipazioneMock(id: string): boolean {
  const index = partecipazioniStore.findIndex((item) => item.id === id);
  if (index === -1) return false;
  partecipazioniStore.splice(index, 1);
  return true;
}

export function resetPartecipazioniMockForTests(): void {
  partecipazioniStore.length = 0;
  seeded = false;
}
