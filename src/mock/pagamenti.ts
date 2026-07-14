import { createPagamento } from "@/models/pagamento";
import type { PartecipazioneTour } from "@/types/tour-partecipazione";
import type {
  CreatePagamentoInput,
  Pagamento,
  UpdatePagamentoInput,
} from "@/types/pagamento";

const pagamentiStore: Pagamento[] = [];
let seeded = false;

export function seedPagamentiMock(partecipazioni: PartecipazioneTour[]): void {
  if (seeded) return;

  const tour1 = partecipazioni.filter((item) => item.tourId === "tour-1");
  const tour3 = partecipazioni.filter((item) => item.tourId === "tour-3");

  const seedInputs: CreatePagamentoInput[] = [];

  if (tour1[0]) {
    seedInputs.push({
      tourId: "tour-1",
      partecipazioneId: tour1[0].id,
      importo: 960,
      data: "2026-01-15",
      metodo: "Bonifico",
      tipo: "Acconto",
    });
  }

  if (tour3[0]) {
    seedInputs.push(
      {
        tourId: "tour-3",
        partecipazioneId: tour3[0].id,
        importo: 867,
        data: "2026-02-01",
        metodo: "Carta",
        tipo: "Acconto",
      },
      {
        tourId: "tour-3",
        partecipazioneId: tour3[0].id,
        importo: 2023,
        data: "2026-02-28",
        metodo: "Bonifico",
        tipo: "Saldo",
      },
    );
  }

  pagamentiStore.push(...seedInputs.map(createPagamento));
  seeded = true;
}

export function listPagamentiMock(): Pagamento[] {
  return [...pagamentiStore];
}

export function listPagamentiByTourIdMock(tourId: string): Pagamento[] {
  return pagamentiStore.filter((item) => item.tourId === tourId);
}

export function listPagamentiByPartecipazioneIdMock(
  partecipazioneId: string,
): Pagamento[] {
  return pagamentiStore.filter(
    (item) => item.partecipazioneId === partecipazioneId,
  );
}

export function findPagamentoByIdMock(id: string): Pagamento | undefined {
  return pagamentiStore.find((item) => item.id === id);
}

export function insertPagamentoMock(input: CreatePagamentoInput): Pagamento {
  const pagamento = createPagamento(input);
  pagamentiStore.push(pagamento);
  return pagamento;
}

export function updatePagamentoMock(
  id: string,
  input: UpdatePagamentoInput,
): Pagamento | null {
  const index = pagamentiStore.findIndex((item) => item.id === id);
  if (index === -1) return null;

  const current = pagamentiStore[index];
  const updated: Pagamento = {
    ...current,
    ...input,
    aggiornatoIl: new Date().toISOString(),
  };

  pagamentiStore[index] = updated;
  return updated;
}

export function deletePagamentoMock(id: string): boolean {
  const index = pagamentiStore.findIndex((item) => item.id === id);
  if (index === -1) return false;
  pagamentiStore.splice(index, 1);
  return true;
}

export function resetPagamentiMockForTests(): void {
  pagamentiStore.length = 0;
  seeded = false;
}
