import { createClienteDocumento } from "@/models/cliente-documento";
import type { ClienteDocumento } from "@/types/cliente-documento";

const documentiStore: ClienteDocumento[] = [];
const seededClienti = new Set<string>();

function seedDocumentiForCliente(clienteId: string): void {
  if (seededClienti.has(clienteId)) return;

  const suffix = clienteId.slice(0, 8);

  documentiStore.push(
    createClienteDocumento(clienteId, "passaporto", {
      numero: `YA${suffix.toUpperCase().replace(/-/g, "").slice(0, 7)}`,
      scadenza: "2031-03-15",
      allegatoNome: `passaporto-${suffix}.pdf`,
      allegatoUrl: `/mock/documenti/passaporto-${suffix}.pdf`,
    }),
    createClienteDocumento(clienteId, "carta_identita", {
      numero: `CA${suffix.toUpperCase().replace(/-/g, "").slice(0, 9)}`,
      scadenza: "2029-11-20",
      allegatoNome: `carta-identita-${suffix}.pdf`,
      allegatoUrl: `/mock/documenti/carta-identita-${suffix}.pdf`,
    }),
    createClienteDocumento(clienteId, "visto", {
      numero: `VI-${suffix.slice(0, 6).toUpperCase()}`,
      scadenza: "2026-09-10",
      allegatoNome: `visto-${suffix}.pdf`,
      allegatoUrl: `/mock/documenti/visto-${suffix}.pdf`,
    }),
    createClienteDocumento(clienteId, "assicurazione", {
      numero: `POL-${suffix.slice(0, 6).toUpperCase()}`,
      scadenza: "2026-05-01",
      allegatoNome: `assicurazione-${suffix}.pdf`,
      allegatoUrl: `/mock/documenti/assicurazione-${suffix}.pdf`,
    }),
  );

  seededClienti.add(clienteId);
}

export function seedClienteDocumentiMock(clienteId: string): void {
  seedDocumentiForCliente(clienteId);
}

export function listDocumentiMock(): ClienteDocumento[] {
  return [...documentiStore];
}

export function listDocumentiByClienteIdMock(
  clienteId: string,
): ClienteDocumento[] {
  seedDocumentiForCliente(clienteId);
  return documentiStore.filter((item) => item.clienteId === clienteId);
}

export function findDocumentoByIdMock(
  id: string,
): ClienteDocumento | undefined {
  return documentiStore.find((item) => item.id === id);
}

export function resetClienteDocumentiMockForTests(): void {
  documentiStore.length = 0;
  seededClienti.clear();
}
