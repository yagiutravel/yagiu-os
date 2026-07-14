import type {
  ClienteDocumento,
  ClienteDocumentoStato,
  ClienteDocumentoTipo,
} from "@/types/cliente-documento";

export const CLIENTE_DOCUMENTO_TIPI: ClienteDocumentoTipo[] = [
  "passaporto",
  "carta_identita",
  "visto",
  "assicurazione",
];

export const GIORNI_PREAVVISO_SCADENZA = 90;

export const CLIENTE_DOCUMENTO_TIPO_LABELS: Record<
  ClienteDocumentoTipo,
  string
> = {
  passaporto: "Passaporto",
  carta_identita: "Carta Identità",
  visto: "Visto",
  assicurazione: "Assicurazione",
};

export const CLIENTE_DOCUMENTO_STATO_LABELS: Record<
  ClienteDocumentoStato,
  string
> = {
  valido: "Valido",
  in_scadenza: "In scadenza",
  scaduto: "Scaduto",
};

export function createClienteDocumentoId(): string {
  return `cdoc-${crypto.randomUUID()}`;
}

export function calcolaStatoDocumento(
  scadenza: string,
  now = new Date(),
): ClienteDocumentoStato {
  const expiry = new Date(`${scadenza}T00:00:00`);
  const oggi = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  if (Number.isNaN(expiry.getTime())) return "in_scadenza";

  const diffMs = expiry.getTime() - oggi.getTime();
  const diffDays = Math.ceil(diffMs / 86400000);

  if (diffDays < 0) return "scaduto";
  if (diffDays <= GIORNI_PREAVVISO_SCADENZA) return "in_scadenza";
  return "valido";
}

export function formatScadenzaDocumento(isoDate: string): string {
  const date = new Date(`${isoDate}T00:00:00`);
  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("it-IT", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function createClienteDocumento(
  clienteId: string,
  tipo: ClienteDocumentoTipo,
  data: {
    numero: string;
    scadenza: string;
    allegatoNome?: string | null;
    allegatoUrl?: string | null;
  },
): ClienteDocumento {
  const now = new Date().toISOString();

  return {
    id: createClienteDocumentoId(),
    clienteId,
    tipo,
    numero: data.numero,
    scadenza: data.scadenza,
    allegatoNome: data.allegatoNome ?? null,
    allegatoUrl: data.allegatoUrl ?? null,
    creatoIl: now,
    aggiornatoIl: now,
  };
}
