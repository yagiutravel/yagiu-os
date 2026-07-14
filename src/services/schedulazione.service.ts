import { mapSchedulazioniToViews } from "@/mappers/schedulazione.mapper";
import {
  createSchedulazioneMock,
  listSchedulazioniMock,
} from "@/mock/schedulazioni";
import { countByStato } from "@/models/schedulazione";
import { getTours } from "@/services/tour.service";
import { getClienti } from "@/services/clienti.service";
import type {
  CreateSchedulazioneInput,
  SchedulazioneStato,
  SchedulazioneTipo,
  SchedulazioneView,
} from "@/types/schedulazione";

export class SchedulazioneServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SchedulazioneServiceError";
  }
}

export type SchedulazioneRiepilogo = {
  programmate: number;
  inviate: number;
  fallite: number;
  bozze: number;
  totale: number;
};

export async function getSchedulazioni(): Promise<SchedulazioneView[]> {
  return mapSchedulazioniToViews(listSchedulazioniMock());
}

export async function getSchedulazioneRiepilogo(): Promise<SchedulazioneRiepilogo> {
  const items = listSchedulazioniMock();
  const counts = countByStato(items);
  return {
    programmate: counts.programmata,
    inviate: counts.inviata,
    fallite: counts.fallita,
    bozze: counts.bozza,
    totale: items.length,
  };
}

export async function createSchedulazione(
  input: CreateSchedulazioneInput,
): Promise<SchedulazioneView> {
  const created = createSchedulazioneMock(input);
  return mapSchedulazioniToViews([created])[0];
}

export async function getSchedulazioneClienti(): Promise<
  Array<{ id: string; nome: string }>
> {
  try {
    const clienti = await getClienti();
    if (clienti.length > 0) {
      return clienti.map((c) => ({ id: c.id, nome: c.nome }));
    }
  } catch {
    /* fallback */
  }
  return [
    { id: "mock-c1", nome: "Marco Rossi" },
    { id: "mock-c2", nome: "Laura Bianchi" },
    { id: "mock-c3", nome: "Giulia Verdi" },
    { id: "mock-c4", nome: "Andrea Neri" },
  ];
}

export async function getSchedulazioneTours(): Promise<
  Array<{ id: string; nome: string }>
> {
  const tours = await getTours();
  return tours
    .filter((t) => t.stato !== "Archiviato")
    .map((t) => ({
      id: t.id,
      nome: t.nomeTour,
    }));
}

export function filterSchedulazioni(
  items: SchedulazioneView[],
  search: string,
  stato: SchedulazioneStato | "tutte",
  tipo: SchedulazioneTipo | "tutti",
): SchedulazioneView[] {
  const query = search.trim().toLowerCase();

  return items.filter((item) => {
    const matchesStato = stato === "tutte" || item.stato === stato;
    const matchesTipo = tipo === "tutti" || item.tipo === tipo;
    if (!matchesStato || !matchesTipo) return false;
    if (!query) return true;

    return (
      item.titolo.toLowerCase().includes(query) ||
      item.clienteNome.toLowerCase().includes(query) ||
      (item.tourNome?.toLowerCase().includes(query) ?? false)
    );
  });
}
