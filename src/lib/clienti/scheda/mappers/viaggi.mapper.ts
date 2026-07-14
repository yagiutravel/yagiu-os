import type { ClienteViaggio, ClienteViaggi } from "@/types/cliente-scheda/viaggi";
import { ViaggioStato } from "@/types/cliente-scheda/enums";
import {
  EMPTY_VIAGGI,
  VIAGGIO_STATI_ATTIVI,
  VIAGGIO_STATI_STORICO,
} from "@/models/cliente-scheda/defaults";

export function partitionViaggi(viaggi: ClienteViaggio[]): ClienteViaggi {
  const attivi: ClienteViaggio[] = [];
  const storico: ClienteViaggio[] = [];

  for (const viaggio of viaggi) {
    if (VIAGGIO_STATI_ATTIVI.includes(viaggio.stato)) {
      attivi.push(viaggio);
    } else if (VIAGGIO_STATI_STORICO.includes(viaggio.stato)) {
      storico.push(viaggio);
    } else {
      attivi.push(viaggio);
    }
  }

  return { attivi, storico };
}

export function mapViaggiToClienteViaggi(viaggi: ClienteViaggio[] = []): ClienteViaggi {
  if (viaggi.length === 0) return EMPTY_VIAGGI;
  return partitionViaggi(viaggi);
}

export function isViaggioAttivo(stato: ViaggioStato): boolean {
  return VIAGGIO_STATI_ATTIVI.includes(stato);
}

export function isViaggioStorico(stato: ViaggioStato): boolean {
  return VIAGGIO_STATI_STORICO.includes(stato);
}

export function countViaggiAttivi(viaggi: ClienteViaggi): number {
  return viaggi.attivi.length;
}

export function countViaggiStorico(viaggi: ClienteViaggi): number {
  return viaggi.storico.length;
}
