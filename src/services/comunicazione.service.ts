import { mapComunicazioniDashboardData } from "@/mappers/comunicazione.mapper";
import {
  listComunicazioniMock,
  listEventiMock,
  seedComunicazioniMock,
} from "@/mock/comunicazioni";
import { getClienti } from "@/services/clienti.service";
import type { ComunicazioniDashboardData } from "@/types/comunicazione";

export class ComunicazioneServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ComunicazioneServiceError";
  }
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

export async function getComunicazioniDashboardData(): Promise<ComunicazioniDashboardData> {
  let clienti: Array<{ id: string; nome: string }> = [];

  try {
    const data = await getClienti();
    clienti = data.map((cliente) => ({
      id: cliente.id,
      nome: cliente.nome,
    }));
  } catch {
    clienti = [];
  }

  seedComunicazioniMock(clienti);

  const clientiMap = await buildClientiMap();
  for (const cliente of clienti) {
    clientiMap.set(cliente.id, cliente.nome);
  }

  return mapComunicazioniDashboardData({
    comunicazioni: listComunicazioniMock(),
    eventi: listEventiMock(),
    clientiMap,
  });
}
