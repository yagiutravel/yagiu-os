import { mapAutomazioniToViews } from "@/mappers/automazione.mapper";
import {
  createAutomazioneMock,
  listAutomazioniMock,
} from "@/mock/automazioni";
import { countByStato } from "@/models/automazione";
import type {
  AutomazioneStato,
  AutomazioneView,
  CreateAutomazioneInput,
} from "@/types/automazione";

export class AutomazioneServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AutomazioneServiceError";
  }
}

export type AutomazioneRiepilogo = {
  attivi: number;
  inattivi: number;
  bozze: number;
  totale: number;
};

export async function getAutomazioni(): Promise<AutomazioneView[]> {
  return mapAutomazioniToViews(listAutomazioniMock());
}

export async function getAutomazioneRiepilogo(): Promise<AutomazioneRiepilogo> {
  const items = listAutomazioniMock();
  const counts = countByStato(items);
  return {
    attivi: counts.attivo,
    inattivi: counts.inattivo,
    bozze: counts.bozza,
    totale: items.length,
  };
}

export async function createAutomazione(
  input: CreateAutomazioneInput,
): Promise<AutomazioneView> {
  const created = createAutomazioneMock(input);
  return mapAutomazioniToViews([created])[0];
}

export function filterAutomazioni(
  items: AutomazioneView[],
  search: string,
  stato: AutomazioneStato | "tutti",
): AutomazioneView[] {
  const query = search.trim().toLowerCase();

  return items.filter((item) => {
    const matchesStato = stato === "tutti" || item.stato === stato;
    if (!matchesStato) return false;
    if (!query) return true;

    return (
      item.nome.toLowerCase().includes(query) ||
      item.triggerLabel.toLowerCase().includes(query) ||
      item.azioneLabel.toLowerCase().includes(query)
    );
  });
}
